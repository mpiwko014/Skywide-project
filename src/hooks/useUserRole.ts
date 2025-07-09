import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useUserRole(userId?: string) {
  const [userRole, setUserRole] = useState<string>('user');
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUserRole = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', userId)
          .single();

        if (error) {
          console.error('Error fetching user role:', error);
          setLoading(false);
          return;
        }

        const role = profile?.role || 'user';
        setUserRole(role);
        setIsAdmin(role === 'admin');
      } catch (error) {
        console.error('Error in checkUserRole:', error);
      } finally {
        setLoading(false);
      }
    };

    checkUserRole();
  }, [userId]);

  return { userRole, isAdmin, loading };
}