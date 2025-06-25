
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
