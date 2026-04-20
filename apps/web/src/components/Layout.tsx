import React, { useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useStudioStore } from '../stores/studioStore';
import {
  Calendar,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  CreditCard,
  Briefcase,
  Activity,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function Layout() {
  const { user, logout } = useAuthStore();
  const fetchAll = useStudioStore(s => s.fetchAll);
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getNavItems = () => {
    if (!user) return [];

    const items = [
      { to: '/', label: 'Dashboard', icon: Activity, roles: ['admin', 'staff', 'instructor', 'member', 'finance'] },
      { to: '/schedule', label: 'Schedule', icon: Calendar, roles: ['admin', 'staff', 'instructor', 'member'] },
      { to: '/members', label: 'Members', icon: Users, roles: ['admin', 'staff'] },
      { to: '/memberships', label: 'Memberships', icon: CreditCard, roles: ['admin', 'member'] },
      { to: '/transactions', label: 'Transactions', icon: Briefcase, roles: ['admin', 'finance'] },
      { to: '/settings', label: 'Settings', icon: Settings, roles: ['admin'] },
    ];

    return items.filter((item) => item.roles.includes(user.role));
  };

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'SF';

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-32 right-0 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 left-0 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />

        {/* Navbar */}
        <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/85 backdrop-blur-xl">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Mobile menu button on the left */}
                <div className="flex md:hidden">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsMobileMenuOpen(true)}
                    aria-label="Open menu"
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                </div>

                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white font-semibold shadow-sm">
                    SF
                  </div>
                  <div>
                    <span className="text-lg font-semibold leading-none">StudioFlow</span>
                    <div className="text-xs text-muted-foreground">Yoga studio operations</div>
                  </div>
                </div>

                <nav className="hidden md:ml-6 md:flex md:space-x-2">
                  {getNavItems().map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all',
                          isActive
                            ? 'bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20'
                            : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                        )
                      }
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </NavLink>
                  ))}
                </nav>
              </div>

              <div className="hidden md:flex items-center space-x-4">
                <div className="flex items-center gap-3 rounded-full border border-border/60 bg-card/80 px-3 py-1.5 shadow-sm">
                  <div className="h-9 w-9 rounded-full bg-primary/10 text-primary font-semibold flex items-center justify-center">
                    {initials}
                  </div>
                  <div className="text-sm">
                    <div className="font-medium leading-tight">{user?.name}</div>
                    <div className="text-xs text-muted-foreground uppercase tracking-widest">{user?.role}</div>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={handleLogout} title="Log out">
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Mobile sidebar */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-black/40"
              onClick={() => setIsMobileMenuOpen(false)}
              aria-label="Close menu"
            />
            <aside className="absolute left-0 top-0 h-full w-4/5 max-w-xs bg-background border-r border-border shadow-lg">
              <div className="flex items-center justify-between px-4 py-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-primary to-blue-600 text-white font-semibold flex items-center justify-center">
                    SF
                  </div>
                  <span className="text-lg font-semibold">StudioFlow</span>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <div className="space-y-2 px-4 py-4">
                {getNavItems().map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 px-3 py-2 rounded-lg text-base font-medium transition-colors',
                        isActive
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      )
                    }
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </NavLink>
                ))}
                <div className="mt-6 pt-4 border-t border-border">
                  <div className="px-3 py-2 flex items-center justify-between">
                    <div>
                      <div className="text-base font-medium">{user?.name}</div>
                      <div className="text-sm text-muted-foreground capitalize">{user?.role}</div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={handleLogout}>
                      <LogOut className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        )}

        {/* Main content */}
        <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}