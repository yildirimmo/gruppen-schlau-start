import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface PotentialGroup {
  bundesland: string;
  klassenstufe: string;
  common_time_slots: string[];
  student_count: number;
  student_ids: string[];
}

export interface AutoMatchingResult {
  success: boolean;
  groups_created: number;
  message: string;
}

export const useAutoMatching = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query to get potential groups that could be auto-created
  const { data: potentialGroups, isLoading: isLoadingPotential } = useQuery({
    queryKey: ['potential-auto-groups'],
    queryFn: async () => {
      console.log('Fetching potential auto groups...');
      
      try {
        const { data, error } = await supabase.rpc('find_potential_auto_groups');

        if (error) {
          console.error('Error calling find_potential_auto_groups:', error);
          return [];
        }
        
        console.log('Potential auto groups data:', data);
        return data as PotentialGroup[] || [];
      } catch (error) {
        console.error('Error in find_potential_auto_groups query:', error);
        return [];
      }
    },
    retry: false,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Mutation to manually trigger auto-matching
  const runAutoMatching = useMutation({
    mutationFn: async (): Promise<AutoMatchingResult> => {
      console.log('Running manual auto-matching...');
      
      const { data, error } = await supabase.rpc('run_manual_auto_matching');

      if (error) {
        console.error('Error running auto-matching:', error);
        throw error;
      }

      console.log('Auto-matching result:', data);
      return data[0] as AutoMatchingResult;
    },
    onSuccess: (result) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['potential-auto-groups'] });
      queryClient.invalidateQueries({ queryKey: ['pending-groups'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      
      toast({
        title: result.success ? "Auto-Matching erfolgreich!" : "Auto-Matching fehlgeschlagen",
        description: result.message,
        variant: result.success ? "default" : "destructive",
      });
    },
    onError: (error: any) => {
      console.error('Error in auto-matching:', error);
      toast({
        title: "Fehler beim Auto-Matching",
        description: error.message || "Ein unbekannter Fehler ist aufgetreten.",
        variant: "destructive",
      });
    },
  });

  // Function to trigger auto-matching (non-blocking)
  const triggerAutoMatching = useMutation({
    mutationFn: async () => {
      console.log('Triggering auto-matching...');
      
      const { error } = await supabase.rpc('trigger_auto_matching');

      if (error) {
        console.error('Error triggering auto-matching:', error);
        throw error;
      }

      return { success: true };
    },
    onSuccess: () => {
      // Invalidate relevant queries after a short delay
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['potential-auto-groups'] });
        queryClient.invalidateQueries({ queryKey: ['pending-groups'] });
        queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      }, 1000);
      
      toast({
        title: "Auto-Matching gestartet",
        description: "Das automatische Gruppen-Matching wurde ausgelöst.",
      });
    },
    onError: (error: any) => {
      console.error('Error triggering auto-matching:', error);
      toast({
        title: "Fehler beim Starten des Auto-Matching",
        description: error.message || "Ein unbekannter Fehler ist aufgetreten.",
        variant: "destructive",
      });
    },
  });

  return {
    potentialGroups: potentialGroups || [],
    isLoadingPotential,
    runAutoMatching,
    triggerAutoMatching,
    isRunningAutoMatching: runAutoMatching.isPending,
    isTriggeringAutoMatching: triggerAutoMatching.isPending,
  };
};
