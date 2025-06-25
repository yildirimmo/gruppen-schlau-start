
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface StudentDetails {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  bundesland: string;
  klassenstufe: string;
  sessions_per_month: number;
  created_at: string;
  group_status: string;
  has_pending_payments: boolean;
  availabilities: Array<{
    id: string;
    day_of_week: string;
    time_slot: string;
    created_at: string;
  }>;
  group_memberships: Array<{
    id: string;
    joined_at: string;
    groups: {
      id: string;
      bundesland: string;
      klassenstufe: string;
      status: string;
      time_slots: string[];
      created_at: string;
    };
  }>;
}

export const useStudentDetails = (studentId?: string | null) => {
  const { data: studentDetails, isLoading } = useQuery({
    queryKey: ['student-details', studentId],
    queryFn: async () => {
      if (!studentId) return null;
      
      try {
        // Hole Schüler-Grunddaten
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', studentId)
          .single();

        if (profileError) {
          console.error('Error fetching student profile:', profileError);
          return null;
        }

        // Hole Verfügbarkeiten
        const { data: availabilities, error: availError } = await supabase
          .from('availabilities')
          .select('*')
          .eq('user_id', studentId)
          .order('day_of_week, time_slot');

        if (availError) {
          console.error('Error fetching availabilities:', availError);
        }

        // Hole Gruppenmitgliedschaften
        const { data: memberships, error: memberError } = await supabase
          .from('group_members')
          .select(`
            id,
            joined_at,
            groups:group_id (
              id,
              bundesland,
              klassenstufe,
              status,
              time_slots,
              created_at
            )
          `)
          .eq('user_id', studentId);

        if (memberError) {
          console.error('Error fetching group memberships:', memberError);
        }

        // Bestimme Gruppenstatus
        let groupStatus = 'not_assigned';
        if (memberships && memberships.length > 0) {
          const activeGroup = memberships.find(m => m.groups?.status === 'active');
          const pendingGroup = memberships.find(m => m.groups?.status === 'pending');
          
          if (activeGroup) {
            groupStatus = 'active';
          } else if (pendingGroup) {
            groupStatus = 'pending';
          } else {
            groupStatus = 'completed';
          }
        }

        // TODO: Implementiere Zahlungsstatus-Logik
        // Für jetzt nehmen wir an, dass keine offenen Zahlungen vorhanden sind
        const hasPendingPayments = false;

        return {
          ...profile,
          group_status: groupStatus,
          has_pending_payments: hasPendingPayments,
          availabilities: availabilities || [],
          group_memberships: memberships || []
        } as StudentDetails;

      } catch (error) {
        console.error('Error in student details query:', error);
        return null;
      }
    },
    enabled: !!studentId,
  });

  return {
    studentDetails,
    isLoading,
  };
};
