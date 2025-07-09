import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Shield, Users, Mail, Calendar, CheckCircle, Clock, XCircle } from 'lucide-react';

interface Invitation {
  id: string;
  email: string;
  full_name: string;
  role: string;
  status: string;
  created_at: string;
  expires_at: string;
  accepted_at?: string;
  token: string;
}

export default function InviteUsers() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [userRole, setUserRole] = useState<string>('user');

  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    role: 'user'
  });

  // Check user role and redirect if not admin
  useEffect(() => {
    const checkUserRole = async () => {
      if (!user?.id) return;

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching user role:', error);
        return;
      }

      setUserRole(profile?.role || 'user');

      if (profile?.role !== 'admin') {
        toast({
          title: "Access Denied",
          description: "You don't have permission to access this page.",
          variant: "destructive",
        });
        window.history.back();
        return;
      }

      // If admin, load invitations
      await fetchInvitations();
    };

    checkUserRole();
  }, [user?.id, toast]);

  const fetchInvitations = async () => {
    try {
      const { data, error } = await supabase
        .from('user_invitations')
        .select('id, email, full_name, role, status, created_at, expires_at, accepted_at, token')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvitations(data || []);
    } catch (error) {
      console.error('Error fetching invitations:', error);
      toast({
        title: "Error",
        description: "Failed to load invitations.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };


  // Email sending function via n8n webhook
  const sendInvitationEmail = async (email: string, fullName: string, role: string, token: string) => {
    try {
      const webhookUrl = 'https://seobrand.app.n8n.cloud/webhook/send-invitation';
      const appUrl = 'https://preview--skywide-content-flow.lovable.app';
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          fullName,
          role,
          token,
          appUrl
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Webhook failed: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Email webhook error:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fullName || !formData.email || !formData.role) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      // Check for existing user or pending invitation
      const { data: existingUser, error: userError } = await supabase
        .from('profiles')
        .select('id, email')
        .eq('email', formData.email)
        .maybeSingle();

      if (userError && userError.code !== 'PGRST116') {
        console.error('Profile query error:', userError);
      }

      if (existingUser) {
        toast({
          title: "User Already Exists",
          description: "A user with this email address already exists.",
          variant: "destructive",
        });
        setSubmitting(false);
        return;
      }

      const { data: pendingInvitation, error: invitationError } = await supabase
        .from('user_invitations')
        .select('id, email, status')
        .eq('email', formData.email)
        .eq('status', 'pending')
        .maybeSingle();

      if (invitationError && invitationError.code !== 'PGRST116') {
        console.error('Invitation query error:', invitationError);
      }

      if (pendingInvitation) {
        toast({
          title: "Invitation Already Sent",
          description: "A pending invitation already exists for this email address.",
          variant: "destructive",
        });
        setSubmitting(false);
        return;
      }

      // Generate secure token and expiration date
      const token = crypto.randomUUID();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

      // Save invitation to database
      const { data, error } = await supabase
        .from('user_invitations')
        .insert([{
          invited_by: user!.id,
          email: formData.email,
          full_name: formData.fullName,
          role: formData.role,
          token: token,
          expires_at: expiresAt.toISOString(),
          status: 'pending'
        }])
        .select();

      if (error) throw error;

      // Send invitation email
      try {
        await sendInvitationEmail(formData.email, formData.fullName, formData.role, token);
        
        toast({
          title: "Invitation Sent!",
          description: `Invitation sent successfully to ${formData.email}. They will receive an email with registration instructions.`,
        });
      } catch (emailError: any) {
        console.error('Email sending failed:', emailError);
        toast({
          title: "Invitation Saved",
          description: `Invitation saved but email failed to send to ${formData.email}. You can resend it from the table below.`,
          variant: "destructive",
        });
      }

      // Reset form
      setFormData({
        fullName: '',
        email: '',
        role: 'user'
      });

      // Refresh invitations list
      await fetchInvitations();

    } catch (error: any) {
      console.error('Error sending invitation:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to send invitation.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Resend invitation email
  const handleResendInvitation = async (invitation: Invitation) => {
    try {
      await sendInvitationEmail(invitation.email, invitation.full_name, invitation.role, invitation.token);
      
      toast({
        title: "Invitation Resent!",
        description: `Invitation email resent successfully to ${invitation.email}`,
      });
    } catch (error: any) {
      console.error('Error resending invitation:', error);
      toast({
        title: "Error",
        description: "Failed to resend invitation email.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-amber-900/20 text-amber-400">
            <Clock className="h-3 w-3" />
            Pending
          </span>
        );
      case 'accepted':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-emerald-900/20 text-emerald-400">
            <CheckCircle className="h-3 w-3" />
            Accepted
          </span>
        );
      case 'expired':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-red-900/20 text-red-400">
            <XCircle className="h-3 w-3" />
            Expired
          </span>
        );
      default:
        return <span className="text-gray-400">{status}</span>;
    }
  };

  const getRoleBadge = (role: string) => {
    return (
      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
        role === 'admin' 
          ? 'bg-blue-900/20 text-blue-400'
          : 'bg-gray-900/20 text-gray-400'
      }`}>
        {role === 'admin' ? <Shield className="h-3 w-3 mr-1" /> : <Users className="h-3 w-3 mr-1" />}
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const pendingCount = invitations.filter(inv => inv.status === 'pending').length;
  const acceptedCount = invitations.filter(inv => inv.status === 'accepted').length;

  if (userRole !== 'admin') {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-white mb-2">Access Denied</h2>
          <p className="text-gray-400">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-gray-800 pb-6">
        <div className="flex items-center gap-3 mb-2">
          <Users className="h-6 w-6 text-blue-400" />
          <h1 className="text-2xl font-bold text-white">Invite Users</h1>
          <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-blue-900/20 text-blue-400">
            <Shield className="h-3 w-3 mr-1" />
            Admin
          </span>
        </div>
        <p className="text-gray-400 mb-4">Send invitations to new team members</p>
        
        {/* Stats */}
        <div className="flex gap-6 text-sm">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-amber-400" />
            <span className="text-gray-400">Pending:</span>
            <span className="text-white font-medium">{pendingCount}</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-emerald-400" />
            <span className="text-gray-400">Accepted:</span>
            <span className="text-white font-medium">{acceptedCount}</span>
          </div>
        </div>
      </div>

      {/* Invitation Form */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Send New Invitation</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fullName" className="text-gray-300 mb-2 block">
                Full Name *
              </Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Enter full name"
                value={formData.fullName}
                onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <Label htmlFor="email" className="text-gray-300 mb-2 block">
                Email Address *
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter email address"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <Label className="text-gray-300 mb-2 block">
              Role *
            </Label>
            <Select value={formData.role} onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}>
              <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700 z-50">
                <SelectItem value="user" className="text-white hover:bg-gray-700">User</SelectItem>
                <SelectItem value="admin" className="text-white hover:bg-gray-700">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            type="submit"
            disabled={submitting}
            className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
          >
            <Mail className="h-4 w-4 mr-2" />
            {submitting ? 'Sending...' : 'Send Invitation'}
          </Button>
        </form>
      </div>

      {/* Invitations Table */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-lg overflow-hidden">
        <div className="p-6 border-b border-gray-800">
          <h2 className="text-lg font-semibold text-white">Manage Invitations</h2>
          <p className="text-gray-400 text-sm mt-1">View and manage sent invitations</p>
        </div>

        {loading ? (
          <div className="p-6 text-center">
            <div className="text-gray-400">Loading invitations...</div>
          </div>
        ) : invitations.length === 0 ? (
          <div className="p-6 text-center">
            <Users className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No invitations sent yet</h3>
            <p className="text-gray-400">Start by sending your first invitation above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800/50">
                <tr>
                  <th className="text-left p-4 text-gray-300 font-medium">Name</th>
                  <th className="text-left p-4 text-gray-300 font-medium">Email</th>
                  <th className="text-left p-4 text-gray-300 font-medium">Role</th>
                  <th className="text-left p-4 text-gray-300 font-medium">Status</th>
                  <th className="text-left p-4 text-gray-300 font-medium">Invited Date</th>
                  <th className="text-left p-4 text-gray-300 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {invitations.map((invitation) => (
                  <tr key={invitation.id} className="border-t border-gray-800 hover:bg-gray-800/30">
                    <td className="p-4 text-white font-medium">{invitation.full_name}</td>
                    <td className="p-4 text-gray-300">{invitation.email}</td>
                    <td className="p-4">{getRoleBadge(invitation.role)}</td>
                    <td className="p-4">{getStatusBadge(invitation.status)}</td>
                    <td className="p-4 text-gray-400">{formatDate(invitation.created_at)}</td>
                    <td className="p-4">
                      {(invitation.status === 'pending' || invitation.status === 'expired') && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-blue-400 border-blue-400 hover:bg-blue-400 hover:text-white"
                          onClick={() => handleResendInvitation(invitation)}
                        >
                          Resend
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}