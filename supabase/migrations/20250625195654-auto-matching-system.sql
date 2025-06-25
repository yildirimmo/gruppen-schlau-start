-- Auto-Matching System for Groups
-- This migration adds functions for automatic group creation based on student availabilities

-- Function to find potential group matches for auto-creation
CREATE OR REPLACE FUNCTION public.find_potential_auto_groups()
RETURNS TABLE(
  bundesland text,
  klassenstufe text,
  common_time_slots text[],
  student_count bigint,
  student_ids uuid[]
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH student_availability AS (
    -- Get all students with their availabilities
    SELECT 
      p.id as student_id,
      p.bundesland,
      p.klassenstufe,
      ARRAY_AGG(a.day_of_week::TEXT || ' ' || a.time_slot) as available_slots
    FROM public.profiles p
    JOIN public.availabilities a ON p.id = a.user_id
    WHERE p.role = 'student'
      AND NOT EXISTS (
        -- Exclude students already in groups
        SELECT 1 FROM public.group_members gm WHERE gm.user_id = p.id
      )
    GROUP BY p.id, p.bundesland, p.klassenstufe
    HAVING COUNT(a.id) > 0  -- Only students with availabilities
  ),
  potential_groups AS (
    -- Find groups of students with matching criteria
    SELECT 
      s1.bundesland,
      s1.klassenstufe,
      -- Find common time slots among all students in this group
      (
        SELECT ARRAY_AGG(DISTINCT slot)
        FROM UNNEST(s1.available_slots) AS slot
        WHERE slot = ANY(s2.available_slots)
          AND slot = ANY(s3.available_slots)
      ) as common_slots,
      ARRAY[s1.student_id, s2.student_id, s3.student_id] as student_group
    FROM student_availability s1
    JOIN student_availability s2 ON s1.bundesland = s2.bundesland 
      AND s1.klassenstufe = s2.klassenstufe 
      AND s1.student_id < s2.student_id
    JOIN student_availability s3 ON s1.bundesland = s3.bundesland 
      AND s1.klassenstufe = s3.klassenstufe 
      AND s2.student_id < s3.student_id
    WHERE EXISTS (
      -- Ensure there's at least one common time slot
      SELECT 1 FROM UNNEST(s1.available_slots) AS slot
      WHERE slot = ANY(s2.available_slots)
        AND slot = ANY(s3.available_slots)
    )
  )
  SELECT 
    pg.bundesland,
    pg.klassenstufe,
    pg.common_slots as common_time_slots,
    3::bigint as student_count,
    pg.student_group as student_ids
  FROM potential_groups pg
  WHERE array_length(pg.common_slots, 1) >= 1  -- At least one common time slot
  ORDER BY array_length(pg.common_slots, 1) DESC, pg.bundesland, pg.klassenstufe;
END;
$$;

-- Function to automatically create groups from potential matches
CREATE OR REPLACE FUNCTION public.create_auto_groups()
RETURNS TABLE(
  created_group_id uuid,
  bundesland text,
  klassenstufe text,
  student_count bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  potential_group RECORD;
  new_group_id uuid;
  student_id uuid;
BEGIN
  -- Find potential groups and create them
  FOR potential_group IN 
    SELECT * FROM public.find_potential_auto_groups()
    LIMIT 10  -- Limit to prevent too many groups at once
  LOOP
    -- Create new group
    INSERT INTO public.groups (
      bundesland,
      klassenstufe,
      time_slots,
      status,
      max_students
    ) VALUES (
      potential_group.bundesland,
      potential_group.klassenstufe,
      potential_group.common_time_slots,
      'pending',
      5
    ) RETURNING id INTO new_group_id;

    -- Add students to the group
    FOREACH student_id IN ARRAY potential_group.student_ids
    LOOP
      INSERT INTO public.group_members (group_id, user_id)
      VALUES (new_group_id, student_id);
    END LOOP;

    -- Return the created group info
    RETURN QUERY SELECT 
      new_group_id,
      potential_group.bundesland,
      potential_group.klassenstufe,
      potential_group.student_count;
  END LOOP;
END;
$$;

-- Function to get all students for admin overview
CREATE OR REPLACE FUNCTION public.get_all_students()
RETURNS TABLE(
  student_id uuid,
  first_name text,
  last_name text,
  email text,
  bundesland text,
  klassenstufe text,
  registered_at timestamptz,
  availability_count bigint,
  in_group boolean,
  availabilities jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id as student_id,
    p.first_name,
    p.last_name,
    p.email,
    p.bundesland,
    p.klassenstufe,
    p.created_at as registered_at,
    COALESCE(av.availability_count, 0) as availability_count,
    CASE WHEN gm.user_id IS NOT NULL THEN true ELSE false END as in_group,
    COALESCE(av.availabilities, '[]'::jsonb) as availabilities
  FROM public.profiles p
  LEFT JOIN (
    SELECT 
      a.user_id,
      COUNT(*) as availability_count,
      JSONB_AGG(
        JSONB_BUILD_OBJECT(
          'day', a.day_of_week,
          'time', a.time_slot
        )
      ) as availabilities
    FROM public.availabilities a
    GROUP BY a.user_id
  ) av ON p.id = av.user_id
  LEFT JOIN public.group_members gm ON p.id = gm.user_id
  WHERE p.role = 'student'
  ORDER BY p.created_at DESC;
END;
$$;

-- Function to trigger auto-matching (to be called by triggers or manually)
CREATE OR REPLACE FUNCTION public.trigger_auto_matching()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  created_groups_count integer;
BEGIN
  -- Create auto groups and count results
  SELECT COUNT(*) INTO created_groups_count
  FROM public.create_auto_groups();

  -- Log the result (optional)
  RAISE NOTICE 'Auto-matching completed. Created % new groups.', created_groups_count;
END;
$$;

-- Trigger function for availability changes
CREATE OR REPLACE FUNCTION public.handle_availability_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only trigger auto-matching if this is an INSERT (new availability)
  IF TG_OP = 'INSERT' THEN
    -- Use pg_notify to trigger async processing
    PERFORM pg_notify('auto_matching_trigger', 'availability_added');
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Trigger function for new user registrations
CREATE OR REPLACE FUNCTION public.handle_new_student_registration()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only trigger for student role
  IF NEW.role = 'student' AND (OLD IS NULL OR OLD.role != 'student') THEN
    -- Use pg_notify to trigger async processing
    PERFORM pg_notify('auto_matching_trigger', 'student_registered');
  END IF;

  RETURN NEW;
END;
$$;

-- Create triggers
DROP TRIGGER IF EXISTS availability_auto_matching_trigger ON public.availabilities;
CREATE TRIGGER availability_auto_matching_trigger
  AFTER INSERT ON public.availabilities
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_availability_change();

DROP TRIGGER IF EXISTS student_registration_auto_matching_trigger ON public.profiles;
CREATE TRIGGER student_registration_auto_matching_trigger
  AFTER INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_student_registration();

-- Function to manually run auto-matching (for admin use)
CREATE OR REPLACE FUNCTION public.run_manual_auto_matching()
RETURNS TABLE(
  success boolean,
  groups_created integer,
  message text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  created_count integer := 0;
  result_record RECORD;
BEGIN
  -- Check if user is admin
  IF NOT public.is_current_user_admin() THEN
    RETURN QUERY SELECT false, 0, 'Access denied. Admin privileges required.'::text;
    RETURN;
  END IF;

  -- Run auto-matching
  FOR result_record IN SELECT * FROM public.create_auto_groups()
  LOOP
    created_count := created_count + 1;
  END LOOP;

  RETURN QUERY SELECT
    true,
    created_count,
    CASE
      WHEN created_count = 0 THEN 'No new groups could be created. Check if there are enough students with matching availabilities.'
      WHEN created_count = 1 THEN '1 new group was created successfully.'
      ELSE created_count || ' new groups were created successfully.'
    END::text;
END;
$$;
