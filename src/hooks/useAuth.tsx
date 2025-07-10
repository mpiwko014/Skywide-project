import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, displayName?: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: "Sign In Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Welcome back!",
          description: "Successfully signed in.",
        });
      }

      return { error };
    } catch (error: any) {
      toast({
        title: "Sign In Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
      return { error };
    }
  };

  const signUp = async (email: string, password: string, displayName?: string) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            display_name: displayName || email.split('@')[0],
          }
        }
      });

      if (error) {
        toast({
          title: "Sign Up Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Account Created!",
          description: "Please check your email to verify your account.",
        });
      }

      return { error };
    } catch (error: any) {
      toast({
        title: "Sign Up Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
      return { error };
    }
  };

  const signOut = async () => {
    // Immediately clear local state to provide instant UI feedback
    setSession(null);
    setUser(null);

    try {
      // Check if we have a valid session before attempting logout
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // Attempt server-side logout with local scope
        await supabase.auth.signOut({ scope: 'local' });
      }
      
      // Clear any remaining auth data from localStorage as fallback
      localStorage.removeItem('supabase.auth.token');
      localStorage.removeItem('sb-sgwocrvftiwxofvykmhh-auth-token');
      
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out.",
      });
    } catch (error: any) {
      // Treat any logout error as successful since we've already cleared local state
      // This handles 403 session_not_found and other server-side issues gracefully
      
      // Ensure complete cleanup of auth data
      try {
        localStorage.removeItem('supabase.auth.token');
        localStorage.removeItem('sb-sgwocrvftiwxofvykmhh-auth-token');
        // Clear all possible Supabase auth keys
        Object.keys(localStorage).forEach(key => {
          if (key.includes('supabase') || key.includes('sb-')) {
            localStorage.removeItem(key);
          }
        });
      } catch (cleanupError) {
        console.warn('Cleanup error:', cleanupError);
      }

      toast({
        title: "Signed Out",
        description: "You have been successfully signed out.",
      });
    }
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}