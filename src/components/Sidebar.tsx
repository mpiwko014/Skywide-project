import { Home, FileText, BarChart, Settings, LogOut, Users, MessageSquare } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/Logo';

const navItems = [
  { icon: Home, label: 'Dashboard', path: '/dashboard' },
  { icon: FileText, label: 'My Requests', path: '/my-requests' },
  { icon: MessageSquare, label: 'Features', path: '/features' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

const adminNavItems = [
  { icon: Home, label: 'Dashboard', path: '/dashboard' },
  { icon: FileText, label: 'My Requests', path: '/my-requests' },
  { icon: MessageSquare, label: 'Features', path: '/features' },
  { icon: Users, label: 'Invite Users', path: '/invite-users' },
  { icon: BarChart, label: 'Analytics', path: '/analytics' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

interface SidebarProps {
  userRole: string;
  loading: boolean;
}

export function Sidebar({ userRole, loading }: SidebarProps) {
  const { signOut } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path || (path === '/dashboard' && location.pathname === '/');
  };

  // Show loading skeleton while role is being checked
  if (loading) {
    return (
      <div className="fixed left-0 top-0 h-full w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-sidebar-border">
          <Logo />
        </div>

        {/* Loading Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <li key={i}>
                <div className="flex items-center gap-3 px-3 py-2 rounded-md">
                  <div className="h-5 w-5 bg-sidebar-accent/30 rounded animate-pulse"></div>
                  <div className="h-4 bg-sidebar-accent/30 rounded animate-pulse flex-1"></div>
                </div>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer with Sign Out */}
        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3 px-3 py-2 rounded-md">
            <div className="h-4 w-4 bg-sidebar-accent/30 rounded animate-pulse"></div>
            <div className="h-4 bg-sidebar-accent/30 rounded animate-pulse flex-1"></div>
          </div>
        </div>
      </div>
    );
  }

  // Use admin nav items if user is admin, otherwise regular nav items
  const currentNavItems = userRole === 'admin' ? adminNavItems : navItems;

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-sidebar-border">
        <Logo />
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {currentNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={`
                    flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors
                    ${active 
                      ? 'bg-sidebar-accent text-sidebar-primary' 
                      : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
                    }
                  `}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* SEObrand Logo */}
      <div className="p-4 flex justify-center">
        <img 
          src="/lovable-uploads/6c11bbb9-a412-4b9f-8bf5-4872a550e58e.png" 
          alt="SEObrand" 
          className="h-12 opacity-60 hover:opacity-80 transition-opacity"
        />
      </div>

      {/* Footer with Sign Out */}
      <div className="p-4 border-t border-sidebar-border">
        <Button
          onClick={signOut}
          variant="ghost"
          className="w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent/50"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}