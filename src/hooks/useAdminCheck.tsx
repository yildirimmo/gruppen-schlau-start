
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const useAdminCheck = () => {
  const { user } = useAuth();

  const { data: isAdmin, isLoading, error } = useQuery({
    queryKey: ['is-admin', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        console.log('No user ID available for admin check');
        return false;
      }
      
      console.log('Checking admin status for user:', user.id);
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error checking admin status:', error);
          return false;
        }
        
        console.log('Admin check result:', data);
        const adminStatus = data?.is_admin || false;
        console.log('User is admin:', adminStatus);
        
        return adminStatus;
      } catch (error) {
        console.error('Error in admin check query:', error);
        return false;
      }
    },
    enabled: !!user?.id,
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });

  if (error) {
    console.error('Admin check query error:', error);
  }

  return {
    isAdmin: isAdmin || false,
    isLoading,
  };
};
