import React, { useRef, useState } from 'react';
import { useStudioStore } from '../stores/studioStore';
import { useAuthStore } from '../stores/authStore';
import { isFuture, isPast, formatDateTime } from '../lib/dateUtils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function Schedule() {
  const { classes, bookings, users, addClass, bookClass, cancelBooking } = useStudioStore();
  const { user } = useAuthStore();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const noticeTimeout = useRef<number | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [instructorId, setInstructorId] = useState('');
  const [capacity, setCapacity] = useState(20);
  const [price, setPrice] = useState(20);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);

  const instructors = users.filter(u => u.role === 'instructor');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !instructorId || !startTime || !endTime) return;

    addClass({
      title,
      description: desc,
      instructorId,
      capacity,
      price,
      startTime: new Date(startTime).toISOString(),
      endTime: new Date(endTime).toISOString(),
      isRecurring
    });
    setIsCreateOpen(false);
    // Reset
    setTitle('');
    setDesc('');
    setInstructorId('');
    setCapacity(20);
    setPrice(20);
    setStartTime('');
    setEndTime('');
    setIsRecurring(false);
  };

  const showNotice = (message: string) => {
    setNotice(message);
    if (noticeTimeout.current) {
      window.clearTimeout(noticeTimeout.current);
    }
    noticeTimeout.current = window.setTimeout(() => setNotice(null), 3200);
  };

  const handleBook = (classId: string, isFull: boolean) => {
    if (!user) return;
    bookClass(classId, user.id, isFull);
    showNotice(`Confirmation sent! You have been ${isFull ? 'waitlisted for' : 'booked into'} the class.`);
  };

  const handleCancel = (bookingId: string) => {
    cancelBooking(bookingId);
    showNotice('Booking cancelled. If applicable, refund processed.');
  };

  // Sort classes by time
  const sortedClasses = [...classes].sort((a, b) => a.startTime.localeCompare(b.startTime));

  const canManage = user?.role === 'admin' || user?.role === 'staff';

  const upcomingCount = classes.filter(c => isFuture(c.startTime)).length;
  const totalBookings = bookings.filter(b => b.status === 'confirmed').length;
  const totalWaitlist = bookings.filter(b => b.status === 'waitlisted').length;

  const cardBase = "border-border/60 bg-card/80 backdrop-blur-md shadow-sm ring-1 ring-border/40";
  const hoverCard = "transition-all hover:-translate-y-0.5 hover:shadow-md";

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border/60 bg-card/80 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Class Schedule</h1>
            <p className="text-muted-foreground mt-2">View, book, and manage upcoming classes.</p>
          </div>
          {canManage && (
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button>Create Class</Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Create New Class</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreate} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input required value={title} onChange={e => setTitle(e.target.value)} placeholder="Vinyasa Flow" />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Input value={desc} onChange={e => setDesc(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Instructor</Label>
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background/80 px-3 py-2 text-sm"
                      required
                      value={instructorId}
                      onChange={e => setInstructorId(e.target.value)}
                    >
                      <option value="" disabled>Select Instructor</option>
                      {instructors.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Capacity</Label>
                      <Input type="number" required min={1} value={capacity} onChange={e => setCapacity(Number(e.target.value))} />
                    </div>
                    <div className="space-y-2">
                      <Label>Price ($)</Label>
                      <Input type="number" required min={0} value={price} onChange={e => setPrice(Number(e.target.value))} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Start Time</Label>
                      <Input type="datetime-local" required value={startTime} onChange={e => setStartTime(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>End Time</Label>
                      <Input type="datetime-local" required value={endTime} onChange={e => setEndTime(e.target.value)} />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="recurring" checked={isRecurring} onChange={e => setIsRecurring(e.target.checked)} className="rounded border-input" />
                    <Label htmlFor="recurring">Is Recurring (Weekly)</Label>
                  </div>
                  <Button type="submit" className="w-full">Save Class</Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
        {notice && (
          <div className="mt-4 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-primary">
            {notice}
          </div>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className={cardBase}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Upcoming Classes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingCount}</div>
          </CardContent>
        </Card>
        <Card className={cardBase}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Confirmed Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBookings}</div>
          </CardContent>
        </Card>
        <Card className={cardBase}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Waitlist Count</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalWaitlist}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sortedClasses.length === 0 && (
          <div className="col-span-full py-12 text-center text-muted-foreground border rounded-lg bg-muted/20">
            No classes scheduled yet.
          </div>
        )}
        {sortedClasses.map(cls => {
          const instructor = users.find(u => u.id === cls.instructorId);
          const classBookings = bookings.filter(b => b.classId === cls.id && b.status !== 'cancelled');
          const confirmedCount = classBookings.filter(b => b.status === 'confirmed').length;
          const waitlistCount = classBookings.filter(b => b.status === 'waitlisted').length;
          const isFull = confirmedCount >= cls.capacity;
          
          const myBooking = user ? classBookings.find(b => b.userId === user.id) : null;
          const past = isPast(cls.startTime);

          return (
            <Card
              key={cls.id}
              className={`${cardBase} ${hoverCard} ${past ? 'opacity-60 grayscale' : ''}`}
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{cls.title}</CardTitle>
                    <CardDescription className="mt-1">{formatDateTime(cls.startTime)}</CardDescription>
                  </div>
                  <Badge variant={isFull ? 'destructive' : 'default'}>
                    {isFull ? 'Full' : 'Available'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm space-y-2 text-muted-foreground mb-4">
                  <p>{cls.description}</p>
                  <p><span className="font-medium text-foreground">Instructor:</span> {instructor?.name}</p>
                  <p><span className="font-medium text-foreground">Capacity:</span> {confirmedCount} / {cls.capacity} booked {waitlistCount > 0 && `(${waitlistCount} waitlisted)`}</p>
                  <p><span className="font-medium text-foreground">Price:</span> ${cls.price}</p>
                </div>

                {user?.role === 'member' && !past && (
                  <div className="mt-4 pt-4 border-t">
                    {myBooking ? (
                      <div className="flex items-center justify-between">
                        <Badge variant={myBooking.status === 'waitlisted' ? 'secondary' : 'default'}>
                          {myBooking.status === 'waitlisted' ? 'Waitlisted' : 'Booked'}
                        </Badge>
                        <Button variant="outline" size="sm" onClick={() => handleCancel(myBooking.id)}>
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <Button 
                        className="w-full" 
                        variant={isFull ? 'secondary' : 'default'}
                        onClick={() => handleBook(cls.id, isFull)}
                      >
                        {isFull ? 'Join Waitlist' : 'Book Class'}
                      </Button>
                    )}
                  </div>
                )}
                
                {canManage && !past && (
                  <div className="mt-4 pt-4 border-t flex gap-2">
                    <Button variant="outline" size="sm" className="w-full">View Roster</Button>
                    <Button variant="outline" size="sm" className="w-full">Check-in</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}