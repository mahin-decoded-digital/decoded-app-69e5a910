import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useStudioStore } from '../stores/studioStore';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Users, Calendar, Activity, DollarSign, ArrowRight } from 'lucide-react';
import { isToday, isFuture, formatDateTime } from '../lib/dateUtils';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export default function Dashboard() {
  const { user } = useAuthStore();
  const { classes, bookings, users, transactions } = useStudioStore();
  const navigate = useNavigate();

  if (!user) return null;

  const stats = useMemo(() => {
    const todayClasses = classes.filter(c => isToday(c.startTime));
    const activeMembers = users.filter(u => u.role === 'member').length;
    const totalRevenue = transactions.filter(t => t.type === 'purchase').reduce((sum, t) => sum + t.amount, 0);
    const refunds = transactions.filter(t => t.type === 'refund').reduce((sum, t) => sum + t.amount, 0);

    const memberBookings = bookings.filter(b => b.userId === user.id && b.status !== 'cancelled');
    const upcomingClasses = memberBookings
      .map(b => classes.find(c => c.id === b.classId))
      .filter(c => c && isFuture(c.startTime))
      .sort((a, b) => a!.startTime.localeCompare(b!.startTime));

    const instructorClasses = classes
      .filter(c => c.instructorId === user.id && isFuture(c.startTime))
      .sort((a, b) => a.startTime.localeCompare(b.startTime));

    return {
      todayClasses,
      activeMembers,
      netRevenue: totalRevenue - refunds,
      upcomingClasses,
      instructorClasses
    };
  }, [classes, bookings, users, transactions, user]);

  const statCards = [
    {
      title: "Today's Classes",
      value: stats.todayClasses.length,
      icon: Calendar,
      accent: 'bg-primary/10 text-primary',
      meta: 'Scheduled sessions'
    },
    {
      title: 'Total Members',
      value: stats.activeMembers,
      icon: Users,
      accent: 'bg-emerald-500/10 text-emerald-600',
      meta: 'Active studio members'
    },
    {
      title: 'Net Revenue',
      value: `$${stats.netRevenue.toFixed(2)}`,
      icon: DollarSign,
      accent: 'bg-amber-500/10 text-amber-600',
      meta: 'After refunds'
    },
    {
      title: 'Active Bookings',
      value: bookings.filter(b => b.status === 'confirmed').length,
      icon: Activity,
      accent: 'bg-sky-500/10 text-sky-600',
      meta: 'Confirmed reservations'
    }
  ];

  const cardBase = "border-border/60 bg-card/80 backdrop-blur-md shadow-sm ring-1 ring-border/40";
  const hoverCard = "transition-all hover:-translate-y-0.5 hover:shadow-md";

  const nextClass = stats.upcomingClasses[0];

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-border/60 bg-card/80 p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user.name}</h1>
            <p className="text-muted-foreground mt-2">Here is what's happening at StudioFlow today.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => navigate('/schedule')} className="gap-2">
              View Schedule <ArrowRight className="h-4 w-4" />
            </Button>
            {(user.role === 'admin' || user.role === 'staff') && (
              <Button variant="outline" onClick={() => navigate('/members')}>
                Manage Members
              </Button>
            )}
          </div>
        </div>
        {user.role === 'member' && nextClass && (
          <div className="mt-6 rounded-xl border border-primary/20 bg-primary/5 p-4">
            <div className="text-sm text-muted-foreground">Your next class</div>
            <div className="text-lg font-semibold">{nextClass.title}</div>
            <div className="text-sm text-muted-foreground">{formatDateTime(nextClass.startTime)}</div>
          </div>
        )}
      </div>

      {/* Admin, Staff, Finance Overview Widgets */}
      {['admin', 'staff', 'finance'].includes(user.role) && (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card
                key={stat.title}
                className={cn(
                  "relative overflow-hidden",
                  cardBase,
                  hoverCard
                )}
              >
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary/60 via-primary/20 to-transparent" />
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                  <div>
                    <CardTitle className="text-sm font-semibold text-foreground">{stat.title}</CardTitle>
                    <CardDescription className="text-xs mt-1">{stat.meta}</CardDescription>
                  </div>
                  <div className={cn('flex h-10 w-10 items-center justify-center rounded-full', stat.accent)}>
                    <Icon className="h-5 w-5" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold tracking-tight">{stat.value}</div>
                  <div className="mt-2 text-xs text-muted-foreground">Updated moments ago</div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Member Dashboard */}
      {user.role === 'member' && (
        <Card className={cn(cardBase, "overflow-hidden")}> 
          <CardHeader>
            <CardTitle>Your Upcoming Classes</CardTitle>
            <CardDescription>Classes you have booked or waitlisted for.</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.upcomingClasses.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                You have no upcoming classes. Check the Schedule to book!
              </div>
            ) : (
              <div className="space-y-4">
                {stats.upcomingClasses.map((cls) => {
                  if (!cls) return null;
                  const booking = bookings.find(b => b.classId === cls.id && b.userId === user.id);
                  return (
                    <div key={cls.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                      <div>
                        <div className="font-medium">{cls.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {formatDateTime(cls.startTime)}
                        </div>
                      </div>
                      <Badge variant={booking?.status === 'confirmed' ? 'default' : 'secondary'}>
                        {booking?.status}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Instructor Dashboard */}
      {user.role === 'instructor' && (
        <Card className={cn(cardBase, "overflow-hidden")}>
          <CardHeader>
            <CardTitle>Your Teaching Schedule</CardTitle>
            <CardDescription>Upcoming classes assigned to you.</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.instructorClasses.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                You have no upcoming assigned classes.
              </div>
            ) : (
              <div className="space-y-4">
                {stats.instructorClasses.map((cls) => {
                  const bookedCount = bookings.filter(b => b.classId === cls.id && b.status === 'confirmed').length;
                  return (
                    <div key={cls.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                      <div>
                        <div className="font-medium">{cls.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {formatDateTime(cls.startTime)}
                        </div>
                      </div>
                      <div className="text-sm font-medium">
                        {bookedCount} / {cls.capacity} Booked
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

    </div>
  );
}