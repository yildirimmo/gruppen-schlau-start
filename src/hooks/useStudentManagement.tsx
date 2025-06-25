
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  bundesland: string;
  klassenstufe: string;
  created_at: string;
  group_status: string;
  availabilities_count: number;
}

export const useStudentManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: students, isLoading: isLoadingStudents } = useQuery({
    queryKey: ['all-students'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select(`
            id,
            first_name,
            last_name,
            email,
            bundesland,
            klassenstufe,
            created_at,
            availabilities:availabilities(count)
          `)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching students:', error);
          return [];
        }

        // Add group status for each student
        const studentsWithStatus = await Promise.all(
          (data || []).map(async (student) => {
            const { data: groupData } = await supabase
              .from('group_members')
              .select(`
                groups:group_id (
                  status
                )
              `)
              .eq('user_id', student.id)
              .single();

            return {
              ...student,
              group_status: groupData?.groups?.status || 'not_assigned',
              availabilities_count: student.availabilities?.[0]?.count || 0
            };
          })
        );

        return studentsWithStatus as Student[];
      } catch (error) {
        console.error('Error in students query:', error);
        return [];
      }
    },
  });

  return {
    students: students || [],
    isLoadingStudents,
  };
};
