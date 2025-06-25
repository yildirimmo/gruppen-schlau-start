import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface StudentData {
  student_id: string;
  first_name: string;
  last_name: string;
  email: string;
  bundesland: string;
  klassenstufe: string;
  registered_at: string;
  availability_count: number;
  in_group: boolean;
  availabilities: Array<{
    day: string;
    time: string;
  }>;
}

export interface StudentFilters {
  bundesland?: string;
  klassenstufe?: string;
  inGroup?: boolean;
}

export const useStudentManagement = (filters?: StudentFilters) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query to get all students
  const { data: students, isLoading } = useQuery({
    queryKey: ['all-students', filters],
    queryFn: async () => {
      console.log('Fetching all students...');
      
      try {
        const { data, error } = await supabase.rpc('get_all_students');

        if (error) {
          console.error('Error calling get_all_students:', error);
          return [];
        }
        
        console.log('All students data:', data);
        let filteredData = data as StudentData[] || [];

        // Apply client-side filters
        if (filters) {
          if (filters.bundesland) {
            filteredData = filteredData.filter(s => s.bundesland === filters.bundesland);
          }
          if (filters.klassenstufe) {
            filteredData = filteredData.filter(s => s.klassenstufe === filters.klassenstufe);
          }
          if (filters.inGroup !== undefined) {
            filteredData = filteredData.filter(s => s.in_group === filters.inGroup);
          }
        }

        return filteredData;
      } catch (error) {
        console.error('Error in get_all_students query:', error);
        return [];
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Mutation to delete a student
  const deleteStudent = useMutation({
    mutationFn: async (studentId: string) => {
      console.log('Deleting student:', studentId);
      
      // First remove from any groups
      const { error: groupError } = await supabase
        .from('group_members')
        .delete()
        .eq('user_id', studentId);

      if (groupError) {
        console.error('Error removing student from groups:', groupError);
        throw groupError;
      }

      // Then delete availabilities
      const { error: availError } = await supabase
        .from('availabilities')
        .delete()
        .eq('user_id', studentId);

      if (availError) {
        console.error('Error deleting student availabilities:', availError);
        throw availError;
      }

      // Finally delete the profile
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', studentId);

      if (profileError) {
        console.error('Error deleting student profile:', profileError);
        throw profileError;
      }

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-students'] });
      queryClient.invalidateQueries({ queryKey: ['pending-groups'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      
      toast({
        title: "Schüler gelöscht",
        description: "Der Schüler wurde erfolgreich gelöscht.",
      });
    },
    onError: (error: any) => {
      console.error('Error deleting student:', error);
      toast({
        title: "Fehler beim Löschen",
        description: error.message || "Ein unbekannter Fehler ist aufgetreten.",
        variant: "destructive",
      });
    },
  });

  // Mutation to update student profile
  const updateStudent = useMutation({
    mutationFn: async ({ 
      studentId, 
      updates 
    }: { 
      studentId: string; 
      updates: Partial<Pick<StudentData, 'first_name' | 'last_name' | 'bundesland' | 'klassenstufe'>>
    }) => {
      console.log('Updating student:', studentId, updates);
      
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', studentId)
        .select()
        .single();

      if (error) {
        console.error('Error updating student:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-students'] });
      
      toast({
        title: "Schüler aktualisiert",
        description: "Die Schülerdaten wurden erfolgreich aktualisiert.",
      });
    },
    onError: (error: any) => {
      console.error('Error updating student:', error);
      toast({
        title: "Fehler beim Aktualisieren",
        description: error.message || "Ein unbekannter Fehler ist aufgetreten.",
        variant: "destructive",
      });
    },
  });

  // Function to get unique values for filters
  const getFilterOptions = () => {
    if (!students) return { bundeslaender: [], klassenstufen: [] };

    const bundeslaender = [...new Set(students.map(s => s.bundesland))].sort();
    const klassenstufen = [...new Set(students.map(s => s.klassenstufe))].sort();

    return { bundeslaender, klassenstufen };
  };

  // Statistics
  const getStats = () => {
    if (!students) return { total: 0, withAvailabilities: 0, inGroups: 0, available: 0 };

    return {
      total: students.length,
      withAvailabilities: students.filter(s => s.availability_count > 0).length,
      inGroups: students.filter(s => s.in_group).length,
      available: students.filter(s => s.availability_count > 0 && !s.in_group).length,
    };
  };

  return {
    students: students || [],
    isLoading,
    deleteStudent,
    updateStudent,
    isDeleting: deleteStudent.isPending,
    isUpdating: updateStudent.isPending,
    getFilterOptions,
    getStats,
  };
};
