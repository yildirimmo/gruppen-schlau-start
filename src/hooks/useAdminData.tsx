
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

  const { data: pendingGroups, isLoading: isLoadingPending, error: pendingError } = useQuery({
    queryKey: ['pending-groups'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.rpc('get_pending_groups_with_students');
        if (error) {
          console.error('Error fetching pending groups:', error);
          return [];
        }
        return data as PendingGroup[];
      } catch (error) {
        console.error('Error in pending groups query:', error);
        return [];
      }
    },
  });

  const { data: activeGroups, isLoading: isLoadingActive, error: activeError } = useQuery({
    queryKey: ['active-groups'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.rpc('get_active_groups');
        if (error) {
          console.error('Error fetching active groups:', error);
          return [];
        }
        return data as ActiveGroup[];
      } catch (error) {
        console.error('Error in active groups query:', error);
        return [];
      }
    },
  });

  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      try {
        // Get total students count
        const { data: studentsData, error: studentsError } = await supabase
          .from('profiles')
          .select('id', { count: 'exact' });

        if (studentsError) {
          console.error('Error fetching students:', studentsError);
          throw studentsError;
        }

        // Get pending groups count
        const { data: pendingData, error: pendingError } = await supabase
          .from('groups')
          .select('id', { count: 'exact' })
          .eq('status', 'pending');

        if (pendingError) {
          console.error('Error fetching pending groups count:', pendingError);
          throw pendingError;
        }

        // Get active groups count
        const { data: activeData, error: activeError } = await supabase
          .from('groups')
          .select('id', { count: 'exact' })
          .eq('status', 'active');

        if (activeError) {
          console.error('Error fetching active groups count:', activeError);
          throw activeError;
        }

        // Get completed groups count
        const { data: completedData, error: completedError } = await supabase
          .from('groups')
          .select('id', { count: 'exact' })
          .eq('status', 'completed');

        if (completedError) {
          console.error('Error fetching completed groups count:', completedError);
          throw completedError;
        }

        const stats = {
          totalStudents: studentsData?.length || 0,
          pendingGroups: pendingData?.length || 0,
          activeGroups: activeData?.length || 0,
          completedBookings: completedData?.length || 0,
        };
        
        return stats;
      } catch (error) {
        console.error('Error fetching admin stats:', error);
        return { totalStudents: 0, pendingGroups: 0, activeGroups: 0, completedBookings: 0 };
      }
    },
  });

  const createGroup = useMutation({
    mutationFn: async ({ groupId, whatsappLink }: { groupId: string; whatsappLink: string }) => {
      // Update group status to active
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

      if (error) {
        console.error('Error updating group:', error);
        throw error;
      }

      // Send notification emails
      const { data: emailData, error: emailError } = await supabase.functions.invoke('send-group-notification', {
        body: { groupId, whatsappLink }
      });

      if (emailError) {
        console.error('Error sending notification emails:', emailError);
        // Don't throw error here - group was created successfully, just email failed
        toast({
          title: "Gruppe erstellt, aber E-Mail-Fehler",
          description: "Die Gruppe wurde erstellt, aber die E-Mails konnten nicht versendet werden.",
          variant: "destructive",
        });
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-groups'] });
      queryClient.invalidateQueries({ queryKey: ['active-groups'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      queryClient.invalidateQueries({ queryKey: ['all-students'] });
      toast({
        title: "Gruppe erstellt!",
        description: "Die Schüler wurden per E-Mail benachrichtigt und erhalten den WhatsApp-Link.",
      });
    },
    onError: (error: any) => {
      console.error('Group creation failed:', error);
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
