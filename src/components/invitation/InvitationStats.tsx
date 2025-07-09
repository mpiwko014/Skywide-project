import { Clock, CheckCircle } from 'lucide-react';
import { Invitation } from '@/types/invitation';

interface InvitationStatsProps {
  invitations: Invitation[];
}

export function InvitationStats({ invitations }: InvitationStatsProps) {
  const pendingCount = invitations.filter(inv => inv.status === 'pending').length;
  const acceptedCount = invitations.filter(inv => inv.status === 'accepted').length;

  return (
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
  );
}