
-- Erstelle zuerst alle Grundtabellen
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  bundesland TEXT NOT NULL,
  klassenstufe TEXT NOT NULL,
  sessions_per_month INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ENUM-Types für bessere Typsicherheit
CREATE TYPE group_status AS ENUM ('pending', 'active', 'completed');
CREATE TYPE day_of_week AS ENUM ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday');

-- Verfügbarkeiten Tabelle mit ENUM
CREATE TABLE public.availabilities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day_of_week day_of_week NOT NULL,
  time_slot TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Gruppen Tabelle mit Optimierungen
CREATE TABLE public.groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bundesland TEXT NOT NULL,
  klassenstufe TEXT NOT NULL,
  time_slots TEXT[] NOT NULL,
  whatsapp_link TEXT,
  status group_status NOT NULL DEFAULT 'pending',
  max_students INTEGER NOT NULL DEFAULT 5,
  admin_note TEXT DEFAULT NULL,
  link_sent_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Gruppen-Mitgliedschaft Tabelle
CREATE TABLE public.group_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

-- RLS aktivieren
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availabilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

-- RLS Policies für profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies für availabilities
CREATE POLICY "Users can view their own availabilities" ON public.availabilities
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own availabilities" ON public.availabilities
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own availabilities" ON public.availabilities
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own availabilities" ON public.availabilities
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies für groups
CREATE POLICY "Anyone can view groups" ON public.groups
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage groups" ON public.groups
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'admin' OR
    (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true
  );

-- RLS Policies für group_members
CREATE POLICY "Users can view their own group memberships" ON public.group_members
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view group memberships" ON public.group_members
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage group members" ON public.group_members
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'admin' OR
    (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true
  );

-- Funktion zur Überprüfung der maximalen Gruppengröße
CREATE OR REPLACE FUNCTION public.check_group_capacity()
RETURNS TRIGGER AS $$
BEGIN
  IF (
    SELECT COUNT(*) 
    FROM public.group_members 
    WHERE group_id = NEW.group_id
  ) >= (
    SELECT max_students 
    FROM public.groups 
    WHERE id = NEW.group_id
  ) THEN
    RAISE EXCEPTION 'Gruppe hat bereits die maximale Anzahl von Schülern erreicht';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger für Kapazitätsprüfung
CREATE TRIGGER enforce_group_capacity
  BEFORE INSERT ON public.group_members
  FOR EACH ROW EXECUTE FUNCTION public.check_group_capacity();

-- Funktion zur automatischen Gruppenfindung
CREATE OR REPLACE FUNCTION public.find_matching_groups(user_uuid UUID)
RETURNS TABLE (
  group_id UUID,
  bundesland TEXT,
  klassenstufe TEXT,
  matching_slots INTEGER,
  current_members INTEGER
) AS $$
BEGIN
  RETURN QUERY
  WITH user_profile AS (
    SELECT p.bundesland, p.klassenstufe
    FROM public.profiles p
    WHERE p.id = user_uuid
  ),
  user_availability AS (
    SELECT ARRAY_AGG(day_of_week::TEXT || ' ' || time_slot) as available_slots
    FROM public.availabilities a
    WHERE a.user_id = user_uuid
  )
  SELECT 
    g.id,
    g.bundesland,
    g.klassenstufe,
    (
      SELECT COUNT(*)
      FROM UNNEST(g.time_slots) AS slot
      WHERE slot = ANY((SELECT available_slots FROM user_availability))
    )::INTEGER as matching_slots,
    (
      SELECT COUNT(*)::INTEGER
      FROM public.group_members gm
      WHERE gm.group_id = g.id
    ) as current_members
  FROM public.groups g, user_profile up
  WHERE g.bundesland = up.bundesland
    AND g.klassenstufe = up.klassenstufe
    AND g.status = 'pending'
    AND (
      SELECT COUNT(*)
      FROM public.group_members gm
      WHERE gm.group_id = g.id
    ) < g.max_students
  ORDER BY matching_slots DESC, current_members ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger für automatische Profile-Erstellung bei User-Registrierung
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, email, bundesland, klassenstufe, sessions_per_month)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'firstName', ''),
    COALESCE(NEW.raw_user_meta_data->>'lastName', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'bundesland', ''),
    COALESCE(NEW.raw_user_meta_data->>'klassenstufe', ''),
    COALESCE((NEW.raw_user_meta_data->>'sessionsPerMonth')::INTEGER, 1)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update Trigger für Zeitstempel
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_groups
  BEFORE UPDATE ON public.groups
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
