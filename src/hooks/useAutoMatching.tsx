
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CompatibleGroup {
  bundesland: string;
  klassenstufe: string;
  matching_students: any[];
  common_time_slots: string[];
  student_count: number;
}

interface AutoMatchResult {
  created_group_id: string;
  bundesland: string;
  klassenstufe: string;
  student_count: number;
  common_slots: string[];
}

export const useAutoMatching = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: compatibleGroups, isLoading: isLoadingCompatible } = useQuery({
    queryKey: ['compatible-groups'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.rpc('find_compatible_students');
        
        if (error) {
          console.error('Error fetching compatible groups:', error);
          return [];
        }
        
        return data as CompatibleGroup[];
      } catch (error) {
        console.error('Error in compatible groups query:', error);
        return [];
      }
    },
  });

  const processAutoMatching = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc('process_auto_matching');
      
      if (error) {
        console.error('Error processing auto matching:', error);
        throw error;
      }
      
      return data as AutoMatchResult[];
    },
    onSuccess: (results) => {
      queryClient.invalidateQueries({ queryKey: ['pending-groups'] });
      queryClient.invalidateQueries({ queryKey: ['compatible-groups'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      
      if (results && results.length > 0) {
        toast({
          title: "Auto-Matching erfolgreich!",
          description: `${results.length} neue Gruppe(n) wurden automatisch erstellt.`,
        });
      } else {
        toast({
          title: "Kein Auto-Matching möglich",
          description: "Derzeit sind nicht genügend kompatible Schüler für neue Gruppen verfügbar.",
        });
      }
    },
    onError: (error: any) => {
      console.error('Auto matching failed:', error);
      toast({
        title: "Fehler beim Auto-Matching",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    compatibleGroups: compatibleGroups || [],
    isLoadingCompatible,
    processAutoMatching: processAutoMatching.mutate,
    isProcessing: processAutoMatching.isPending,
  };
};
