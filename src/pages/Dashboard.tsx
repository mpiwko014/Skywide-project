import { useAuth } from '@/hooks/useAuth';

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome to SKYWIDE Dashboard
          </h1>
          <p className="text-muted-foreground">
            Hello {user?.email}, manage your content requests here.
          </p>
        </div>
        
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">
            Dashboard content coming soon in the next steps!
          </p>
        </div>
      </div>
    </div>
  );
}