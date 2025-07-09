import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail } from 'lucide-react';
import { InvitationFormData } from '@/types/invitation';

interface InvitationFormProps {
  onSubmit: (formData: InvitationFormData) => Promise<void>;
  isSubmitting: boolean;
}

export function InvitationForm({ onSubmit, isSubmitting }: InvitationFormProps) {
  const [formData, setFormData] = useState<InvitationFormData>({
    fullName: '',
    email: '',
    role: 'user'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
    // Reset form after successful submission
    setFormData({
      fullName: '',
      email: '',
      role: 'user'
    });
  };

  return (
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
          disabled={isSubmitting}
          className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
        >
          <Mail className="h-4 w-4 mr-2" />
          {isSubmitting ? 'Sending...' : 'Send Invitation'}
        </Button>
      </form>
    </div>
  );
}