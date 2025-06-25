
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
      
      console.log('Fetching matching groups for user:', userId);
      
      try {
        const { data, error } = await supabase.rpc('find_matching_groups', {
          user_uuid: userId
        });

        if (error) {
          console.error('Error calling find_matching_groups:', error);
          // Don't throw error, just return empty array
          return [];
        }
        
        console.log('Matching groups data:', data);
        return data || [];
      } catch (error) {
        console.error('Error in find_matching_groups query:', error);
        // Return empty array instead of throwing
        return [];
      }
    },
    enabled: !!userId,
    retry: false, // Don't retry on failure
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: userGroups, isLoading: isLoadingUserGroups } = useQuery({
    queryKey: ['user-groups', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      console.log('Fetching user groups for user:', userId);
      
      try {
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

        if (error) {
          console.error('Error fetching user groups:', error);
          return [];
        }
        
        console.log('User groups data:', data);
        return data || [];
      } catch (error) {
        console.error('Error in user groups query:', error);
        return [];
      }
    },
    enabled: !!userId,
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
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
      console.error('Error joining group:', error);
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
