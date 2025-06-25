
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const useAdminCheck = () => {
  const { user } = useAuth();

  const { data: isAdmin, isLoading, error } = useQuery({
    queryKey: ['is-admin', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        return false;
      }
      
      const { data, error } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error checking admin status:', error);
        throw error;
      }
      
      return data?.is_admin || false;
    },
    enabled: !!user?.id,
  });

  if (error) {
    console.error('Admin check query error:', error);
  }

  return {
    isAdmin: isAdmin || false,
    isLoading,
  };
};
