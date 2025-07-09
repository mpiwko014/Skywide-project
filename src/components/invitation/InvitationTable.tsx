import { Button } from '@/components/ui/button';
import { Users } from 'lucide-react';
import { Invitation } from '@/types/invitation';
import { getStatusBadge, getRoleBadge } from './InvitationBadges';

interface InvitationTableProps {
  invitations: Invitation[];
  loading: boolean;
  onResendInvitation: (invitation: Invitation) => Promise<void>;
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

export function InvitationTable({ invitations, loading, onResendInvitation }: InvitationTableProps) {
  if (loading) {
    return (
      <div className="bg-gray-900/50 border border-gray-800 rounded-lg overflow-hidden">
        <div className="p-6 border-b border-gray-800">
          <h2 className="text-lg font-semibold text-white">Manage Invitations</h2>
          <p className="text-gray-400 text-sm mt-1">View and manage sent invitations</p>
        </div>
        <div className="p-6 text-center">
          <div className="text-gray-400">Loading invitations...</div>
        </div>
      </div>
    );
  }

  if (invitations.length === 0) {
    return (
      <div className="bg-gray-900/50 border border-gray-800 rounded-lg overflow-hidden">
        <div className="p-6 border-b border-gray-800">
          <h2 className="text-lg font-semibold text-white">Manage Invitations</h2>
          <p className="text-gray-400 text-sm mt-1">View and manage sent invitations</p>
        </div>
        <div className="p-6 text-center">
          <Users className="h-12 w-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No invitations sent yet</h3>
          <p className="text-gray-400">Start by sending your first invitation above.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-lg overflow-hidden">
      <div className="p-6 border-b border-gray-800">
        <h2 className="text-lg font-semibold text-white">Manage Invitations</h2>
        <p className="text-gray-400 text-sm mt-1">View and manage sent invitations</p>
      </div>

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
                      onClick={() => onResendInvitation(invitation)}
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
    </div>
  );
}