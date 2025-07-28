import { supabase } from "@/integrations/supabase/client";

export async function sendCustomPasswordResetEmail(email: string): Promise<{ error: any }> {
  try {
    // Generate password reset link using Supabase
    const { data, error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (resetError) {
      console.error('Supabase reset error:', resetError);
      return { error: resetError };
    }

    // Get user profile for personalization
    const { data: profiles } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('email', email)
      .single();

    // Send custom email via our edge function
    const { error: emailError } = await supabase.functions.invoke('send-password-reset', {
      body: {
        email,
        resetUrl: `${window.location.origin}/reset-password`,
        userFullName: profiles?.full_name || undefined,
      }
    });

    if (emailError) {
      console.error('Custom email error:', emailError);
      // Don't return error here - fallback to Supabase default email
      console.log('Falling back to Supabase default email');
    }

    return { error: null };
  } catch (error) {
    console.error('Password reset service error:', error);
    return { error };
  }
}