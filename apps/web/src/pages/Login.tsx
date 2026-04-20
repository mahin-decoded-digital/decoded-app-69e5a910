import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronDown, Check, Sparkles, Calendar, Users } from 'lucide-react';
import { useAuthStore, MOCK_USERS } from '../stores/authStore';
import { Role } from '../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const roleOptions: { value: Role; label: string; description: string }[] = [
  { value: 'admin', label: 'Admin', description: 'Full access to settings, billing, and staff tools.' },
  { value: 'staff', label: 'Front Desk Staff', description: 'Check-in, bookings, and schedule management.' },
  { value: 'instructor', label: 'Instructor', description: 'View assigned classes and mark attendance.' },
  { value: 'member', label: 'Member', description: 'Book classes, manage passes, and view history.' },
  { value: 'finance', label: 'Finance & Accounting', description: 'Transactions, invoices, and payouts.' },
];

export default function Login() {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('member');
  const [roleOpen, setRoleOpen] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const roleRef = useRef<HTMLDivElement | null>(null);

  const from = location.state?.from?.pathname || '/';

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    login(email, role);
    navigate(from, { replace: true });
  };

  const autofill = (u: { email: string; role: Role }) => {
    setEmail(u.email);
    setRole(u.role);
  };

  const formatRoleLabel = (value: Role) => value.charAt(0).toUpperCase() + value.slice(1);
  const selectedRole = roleOptions.find((option) => option.value === role) || roleOptions[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!roleRef.current) return;
      if (!roleRef.current.contains(event.target as Node)) {
        setRoleOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/40 to-background p-6">
      <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-8 items-center">
        <div className="hidden lg:flex flex-col gap-6">
          <Badge className="w-fit bg-primary/10 text-primary" variant="secondary">
            StudioFlow • Yoga Studio Ops
          </Badge>
          <div>
            <h1 className="text-4xl font-bold tracking-tight">
              A calmer way to run your studio.
            </h1>
            <p className="text-muted-foreground mt-3 text-lg">
              Scheduling, bookings, memberships, and payments — all in one clean workspace built for yoga studios.
            </p>
          </div>
          <div className="grid gap-4">
            <div className="flex items-start gap-3 rounded-2xl border border-border/60 bg-card/80 p-4 shadow-sm">
              <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <div className="font-semibold">Smart scheduling</div>
                <div className="text-sm text-muted-foreground">Recurring classes, waitlists, and instructor calendars synced.</div>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-2xl border border-border/60 bg-card/80 p-4 shadow-sm">
              <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <div className="font-semibold">Member-first booking</div>
                <div className="text-sm text-muted-foreground">Mobile friendly booking, pass management, and attendance history.</div>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-2xl border border-border/60 bg-card/80 p-4 shadow-sm">
              <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <div className="font-semibold">Modern workflows</div>
                <div className="text-sm text-muted-foreground">Check-ins, overrides, and exports built for the front desk.</div>
              </div>
            </div>
          </div>
        </div>

        <Card className="w-full border-border/60 bg-card/90 shadow-xl ring-1 ring-border/40">
          <CardHeader className="space-y-2 text-center">
            <CardTitle className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
              StudioFlow
            </CardTitle>
            <CardDescription>
              Sign in to manage your studio or book your next class.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <div ref={roleRef} className="relative">
                  <button
                    id="role"
                    type="button"
                    aria-haspopup="listbox"
                    aria-expanded={roleOpen}
                    onClick={() => setRoleOpen((prev) => !prev)}
                    className="flex h-11 w-full items-center justify-between rounded-md border border-input bg-background px-3 text-left text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium text-foreground">{selectedRole.label}</span>
                      <span className="text-xs text-muted-foreground">{selectedRole.description}</span>
                    </div>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </button>
                  {roleOpen && (
                    <div
                      role="listbox"
                      className="absolute z-10 mt-2 w-full rounded-lg border border-border bg-card p-1 shadow-lg"
                    >
                      {roleOptions.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          role="option"
                          aria-selected={option.value === role}
                          onClick={() => {
                            setRole(option.value);
                            setRoleOpen(false);
                          }}
                          className={`flex w-full items-start gap-3 rounded-md px-3 py-2 text-left transition-colors hover:bg-muted/60 ${
                            option.value === role ? 'bg-muted text-foreground' : 'text-foreground'
                          }`}
                        >
                          <span className="mt-1 flex h-5 w-5 items-center justify-center rounded-full border border-border bg-background">
                            {option.value === role && <Check className="h-3 w-3 text-primary" />}
                          </span>
                          <span className="flex flex-col">
                            <span className="text-sm font-medium">{option.label}</span>
                            <span className="text-xs text-muted-foreground">{option.description}</span>
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-border mt-4">
                <Label className="text-xs text-muted-foreground mb-2 block">Quick Login (Demo)</Label>
                <div className="flex flex-wrap gap-2">
                  {MOCK_USERS.map((u) => (
                    <Button
                      key={u.id}
                      type="button"
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => autofill({ email: u.email, role: u.role })}
                    >
                      {formatRoleLabel(u.role)}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full">Sign In</Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}