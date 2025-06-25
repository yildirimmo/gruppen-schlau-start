
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PendingGroup {
  group_id: string;
  bundesland: string;
  klassenstufe: string;
  time_slots: string[];
  student_count: number;
  students: Array<{
    id: string;
    name: string;
    email: string;
    registered: string;
  }>;
}

interface ActiveGroup {
  group_id: string;
  bundesland: string;
  klassenstufe: string;
  time_slots: string[];
  student_count: number;
  whatsapp_link: string;
  created_at: string;
  status: string;
}

export const useAdminData = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: pendingGroups, isLoading: isLoadingPending } = useQuery({
    queryKey: ['pending-groups'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_pending_groups_with_students');
      if (error) throw error;
      return data as PendingGroup[];
    },
  });

  const { data: activeGroups, isLoading: isLoadingActive } = useQuery({
    queryKey: ['active-groups'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_active_groups');
      if (error) throw error;
      return data as ActiveGroup[];
    },
  });

  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      // Get total students count
      const { data: studentsData, error: studentsError } = await supabase
        .from('profiles')
        .select('id', { count: 'exact' });

      if (studentsError) throw studentsError;

      // Get pending groups count
      const { data: pendingData, error: pendingError } = await supabase
        .from('groups')
        .select('id', { count: 'exact' })
        .eq('status', 'pending');

      if (pendingError) throw pendingError;

      // Get active groups count
      const { data: activeData, error: activeError } = await supabase
        .from('groups')
        .select('id', { count: 'exact' })
        .eq('status', 'active');

      if (activeError) throw activeError;

      // Get completed groups count
      const { data: completedData, error: completedError } = await supabase
        .from('groups')
        .select('id', { count: 'exact' })
        .eq('status', 'completed');

      if (completedError) throw completedError;

      return {
        totalStudents: studentsData?.length || 0,
        pendingGroups: pendingData?.length || 0,
        activeGroups: activeData?.length || 0,
        completedBookings: completedData?.length || 0,
      };
    },
  });

  const createGroup = useMutation({
    mutationFn: async ({ groupId, whatsappLink }: { groupId: string; whatsappLink: string }) => {
      const { data, error } = await supabase
        .from('groups')
        .update({
          status: 'active',
          whatsapp_link: whatsappLink,
          link_sent_at: new Date().toISOString(),
        })
        .eq('id', groupId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-groups'] });
      queryClient.invalidateQueries({ queryKey: ['active-groups'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      toast({
        title: "Gruppe erstellt!",
        description: "Die Schüler wurden per E-Mail benachrichtigt und erhalten den WhatsApp-Link.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Fehler beim Erstellen der Gruppe",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    pendingGroups: pendingGroups || [],
    activeGroups: activeGroups || [],
    stats: stats || { totalStudents: 0, pendingGroups: 0, activeGroups: 0, completedBookings: 0 },
    isLoading: isLoadingPending || isLoadingActive || isLoadingStats,
    createGroup: createGroup.mutate,
    isCreatingGroup: createGroup.isPending,
  };
};
