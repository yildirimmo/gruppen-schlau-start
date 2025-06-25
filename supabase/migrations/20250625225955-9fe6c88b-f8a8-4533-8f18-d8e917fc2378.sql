
-- Funktion um kompatible Schüler zu finden
CREATE OR REPLACE FUNCTION public.find_compatible_students()
RETURNS TABLE(
  bundesland TEXT,
  klassenstufe TEXT,
  matching_students JSONB,
  common_time_slots TEXT[],
  student_count INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH student_availabilities AS (
    SELECT 
      p.id,
      p.first_name,
      p.last_name,
      p.email,
      p.bundesland,
      p.klassenstufe,
      ARRAY_AGG(DISTINCT a.day_of_week::TEXT || ' ' || a.time_slot) as available_slots
    FROM public.profiles p
    LEFT JOIN public.availabilities a ON p.id = a.user_id
    WHERE NOT EXISTS (
      SELECT 1 FROM public.group_members gm 
      JOIN public.groups g ON gm.group_id = g.id 
      WHERE gm.user_id = p.id AND g.status IN ('pending', 'active')
    )
    GROUP BY p.id, p.first_name, p.last_name, p.email, p.bundesland, p.klassenstufe
    HAVING COUNT(a.id) > 0
  ),
  potential_groups AS (
    SELECT 
      s1.bundesland,
      s1.klassenstufe,
      ARRAY_AGG(DISTINCT s1.id) as student_ids,
      JSONB_AGG(DISTINCT JSONB_BUILD_OBJECT(
        'id', s1.id,
        'name', s1.first_name || ' ' || s1.last_name,
        'email', s1.email,
        'available_slots', s1.available_slots
      )) as students,
      (
        SELECT ARRAY_AGG(DISTINCT slot)
        FROM UNNEST(s1.available_slots) slot
        WHERE slot = ANY(s2.available_slots)
          AND slot = ANY(s3.available_slots)
      ) as common_slots,
      COUNT(*) as group_size
    FROM student_availabilities s1
    JOIN student_availabilities s2 ON s1.bundesland = s2.bundesland 
      AND s1.klassenstufe = s2.klassenstufe 
      AND s1.id != s2.id
    JOIN student_availabilities s3 ON s1.bundesland = s3.bundesland 
      AND s1.klassenstufe = s3.klassenstufe 
      AND s1.id != s3.id 
      AND s2.id != s3.id
    WHERE EXISTS (
      SELECT 1 FROM UNNEST(s1.available_slots) slot1
      JOIN UNNEST(s2.available_slots) slot2 ON slot1 = slot2
      JOIN UNNEST(s3.available_slots) slot3 ON slot1 = slot3
    )
    GROUP BY s1.bundesland, s1.klassenstufe
    HAVING COUNT(*) >= 3
  )
  SELECT 
    pg.bundesland,
    pg.klassenstufe,
    pg.students as matching_students,
    pg.common_slots as common_time_slots,
    pg.group_size as student_count
  FROM potential_groups pg
  WHERE ARRAY_LENGTH(pg.common_slots, 1) >= 1
  ORDER BY pg.group_size DESC, ARRAY_LENGTH(pg.common_slots, 1) DESC;
END;
$$;

-- Funktion um automatisch eine Gruppe zu erstellen
CREATE OR REPLACE FUNCTION public.create_auto_group(
  p_bundesland TEXT,
  p_klassenstufe TEXT,
  p_student_ids UUID[],
  p_time_slots TEXT[]
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_group_id UUID;
  student_id UUID;
BEGIN
  -- Erstelle neue Gruppe
  INSERT INTO public.groups (
    bundesland,
    klassenstufe,
    time_slots,
    status,
    admin_note
  ) VALUES (
    p_bundesland,
    p_klassenstufe,
    p_time_slots,
    'pending',
    'Automatisch erstellt am ' || NOW()::DATE
  ) RETURNING id INTO new_group_id;
  
  -- Füge Schüler zur Gruppe hinzu
  FOREACH student_id IN ARRAY p_student_ids
  LOOP
    INSERT INTO public.group_members (group_id, user_id)
    VALUES (new_group_id, student_id);
  END LOOP;
  
  RETURN new_group_id;
END;
$$;

-- Hauptfunktion für Auto-Matching Prozess
CREATE OR REPLACE FUNCTION public.process_auto_matching()
RETURNS TABLE(
  created_group_id UUID,
  bundesland TEXT,
  klassenstufe TEXT,
  student_count INTEGER,
  common_slots TEXT[]
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  compatible_group RECORD;
  student_ids UUID[];
  new_group_id UUID;
BEGIN
  -- Finde alle kompatiblen Gruppen
  FOR compatible_group IN 
    SELECT * FROM public.find_compatible_students()
    WHERE student_count >= 3
    LIMIT 5 -- Maximal 5 neue Gruppen pro Durchlauf
  LOOP
    -- Extrahiere Schüler-IDs aus dem JSONB
    SELECT ARRAY_AGG((student->>'id')::UUID)
    INTO student_ids
    FROM JSONB_ARRAY_ELEMENTS(compatible_group.matching_students) student;
    
    -- Erstelle automatisch eine Gruppe
    SELECT public.create_auto_group(
      compatible_group.bundesland,
      compatible_group.klassenstufe,
      student_ids[1:5], -- Maximal 5 Schüler pro Gruppe
      compatible_group.common_time_slots
    ) INTO new_group_id;
    
    -- Gebe das Ergebnis zurück
    RETURN QUERY SELECT 
      new_group_id,
      compatible_group.bundesland,
      compatible_group.klassenstufe,
      LEAST(compatible_group.student_count, 5),
      compatible_group.common_time_slots;
  END LOOP;
END;
$$;

-- Trigger-Funktion für automatisches Matching bei neuen Verfügbarkeiten
CREATE OR REPLACE FUNCTION public.trigger_auto_matching()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Führe Auto-Matching aus nach Insert/Update von Verfügbarkeiten
  PERFORM public.process_auto_matching();
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Trigger erstellen
DROP TRIGGER IF EXISTS auto_matching_on_availability_change ON public.availabilities;
CREATE TRIGGER auto_matching_on_availability_change
  AFTER INSERT OR UPDATE ON public.availabilities
  FOR EACH STATEMENT
  EXECUTE FUNCTION public.trigger_auto_matching();
