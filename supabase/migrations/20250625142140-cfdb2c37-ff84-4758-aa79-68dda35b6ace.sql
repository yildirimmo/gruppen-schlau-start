
-- Add admin role support to user profiles
ALTER TABLE public.profiles 
ADD COLUMN is_admin BOOLEAN NOT NULL DEFAULT FALSE;

-- Create a function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT COALESCE(
    (SELECT is_admin FROM public.profiles WHERE id = auth.uid()),
    FALSE
  );
$$;

-- Update RLS policies for groups to allow admin access
DROP POLICY IF EXISTS "Admins can manage groups" ON public.groups;
CREATE POLICY "Admins can manage groups" ON public.groups
  FOR ALL USING (public.is_current_user_admin());

-- Update RLS policies for group_members to allow admin access  
DROP POLICY IF EXISTS "Admins can manage group members" ON public.group_members;
CREATE POLICY "Admins can manage group members" ON public.group_members
  FOR ALL USING (public.is_current_user_admin());

-- Allow users to join groups they're matched with
CREATE POLICY "Users can join matched groups" ON public.group_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create a function to get pending groups with student details (fixed JSON/JSONB issue)
CREATE OR REPLACE FUNCTION public.get_pending_groups_with_students()
RETURNS TABLE (
  group_id UUID,
  bundesland TEXT,
  klassenstufe TEXT,
  time_slots TEXT[],
  student_count BIGINT,
  students JSONB
) 
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT 
    g.id as group_id,
    g.bundesland,
    g.klassenstufe,
    g.time_slots,
    COUNT(gm.user_id) as student_count,
    COALESCE(
      JSONB_AGG(
        JSONB_BUILD_OBJECT(
          'id', p.id,
          'name', p.first_name || ' ' || p.last_name,
          'email', p.email,
          'registered', p.created_at
        )
      ) FILTER (WHERE p.id IS NOT NULL),
      '[]'::jsonb
    ) as students
  FROM public.groups g
  LEFT JOIN public.group_members gm ON g.id = gm.group_id
  LEFT JOIN public.profiles p ON gm.user_id = p.id
  WHERE g.status = 'pending'
    AND (
      SELECT COUNT(*) FROM public.group_members gm2 
      WHERE gm2.group_id = g.id
    ) >= 3  -- Only show groups with at least 3 students
  GROUP BY g.id, g.bundesland, g.klassenstufe, g.time_slots
  ORDER BY student_count DESC;
$$;

-- Create a function to get active groups
CREATE OR REPLACE FUNCTION public.get_active_groups()
RETURNS TABLE (
  group_id UUID,
  bundesland TEXT,
  klassenstufe TEXT,
  time_slots TEXT[],
  student_count BIGINT,
  whatsapp_link TEXT,
  created_at TIMESTAMPTZ,
  status TEXT
) 
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT 
    g.id as group_id,
    g.bundesland,
    g.klassenstufe,
    g.time_slots,
    COUNT(gm.user_id) as student_count,
    g.whatsapp_link,
    g.created_at,
    g.status::TEXT
  FROM public.groups g
  LEFT JOIN public.group_members gm ON g.id = gm.group_id
  WHERE g.status = 'active'
  GROUP BY g.id, g.bundesland, g.klassenstufe, g.time_slots, g.whatsapp_link, g.created_at, g.status
  ORDER BY g.created_at DESC;
$$;
