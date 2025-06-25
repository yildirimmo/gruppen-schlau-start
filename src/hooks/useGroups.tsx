
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useGroups = (userId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: matchingGroups, isLoading: isLoadingMatching } = useQuery({
    queryKey: ['matching-groups', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      try {
        const { data, error } = await supabase.rpc('find_matching_groups', {
          user_uuid: userId
        });

        if (error) {
          console.error('Error calling find_matching_groups:', error);
          return [];
        }
        return data || [];
      } catch (error) {
        console.error('Error in find_matching_groups query:', error);
        return [];
      }
    },
    enabled: !!userId,
  });

  const { data: userGroups, isLoading: isLoadingUserGroups } = useQuery({
    queryKey: ['user-groups', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('group_members')
        .select(`
          *,
          groups:group_id (
            id,
            bundesland,
            klassenstufe,
            status,
            whatsapp_link,
            created_at,
            max_students
          )
        `)
        .eq('user_id', userId);

      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
  });

  const joinGroup = useMutation({
    mutationFn: async (groupId: string) => {
      if (!userId) throw new Error('User ID is required');

      const { data, error } = await supabase
        .from('group_members')
        .insert({ group_id: groupId, user_id: userId })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matching-groups', userId] });
      queryClient.invalidateQueries({ queryKey: ['user-groups', userId] });
      toast({
        title: "Gruppe beigetreten!",
        description: "Sie sind der Gruppe erfolgreich beigetreten.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Fehler beim Beitreten",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    matchingGroups: matchingGroups || [],
    userGroups: userGroups || [],
    isLoadingMatching,
    isLoadingUserGroups,
    joinGroup: joinGroup.mutate,
    isJoining: joinGroup.isPending,
  };
};
