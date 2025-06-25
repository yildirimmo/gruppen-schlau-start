
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Tables, TablesInsert } from '@/integrations/supabase/types';

type Availability = Tables<'availabilities'>;
type AvailabilityInsert = TablesInsert<'availabilities'>;

export const useAvailabilities = (userId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: availabilities, isLoading } = useQuery({
    queryKey: ['availabilities', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('availabilities')
        .select('*')
        .eq('user_id', userId)
        .order('day_of_week');

      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
  });

  const addAvailability = useMutation({
    mutationFn: async (availability: Omit<AvailabilityInsert, 'user_id'>) => {
      if (!userId) throw new Error('User ID is required');

      const { data, error } = await supabase
        .from('availabilities')
        .insert({ ...availability, user_id: userId })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availabilities', userId] });
      toast({
        title: "Verfügbarkeit hinzugefügt",
        description: "Ihre Verfügbarkeit wurde gespeichert.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Fehler beim Speichern",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const removeAvailability = useMutation({
    mutationFn: async (availabilityId: string) => {
      const { error } = await supabase
        .from('availabilities')
        .delete()
        .eq('id', availabilityId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availabilities', userId] });
      toast({
        title: "Verfügbarkeit entfernt",
        description: "Die Verfügbarkeit wurde gelöscht.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Fehler beim Löschen",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    availabilities,
    isLoading,
    addAvailability: addAvailability.mutate,
    removeAvailability: removeAvailability.mutate,
    isAdding: addAvailability.isPending,
    isRemoving: removeAvailability.isPending,
  };
};
