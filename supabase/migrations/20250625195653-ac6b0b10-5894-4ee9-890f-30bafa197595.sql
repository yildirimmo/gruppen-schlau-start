
-- Create the missing find_matching_groups function
CREATE OR REPLACE FUNCTION public.find_matching_groups(user_uuid uuid)
RETURNS TABLE(
  group_id uuid,
  bundesland text,
  klassenstufe text,
  matching_slots integer,
  current_members integer
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
$$;

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
