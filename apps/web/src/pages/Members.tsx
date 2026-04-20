import React, { useState } from 'react';
import { useStudioStore } from '../stores/studioStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatDate } from '../lib/dateUtils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Role } from '../types';

export default function Members() {
  const { users, userMemberships, membershipPlans, addUser } = useStudioStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Form
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<Role>('member');
  const [phone, setPhone] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !name) return;
    const newUser = {
      email,
      name,
      role,
      phone,
      joinedAt: new Date().toISOString()
    };
    addUser(newUser);
    setIsAddOpen(false);
    setEmail('');
    setName('');
    setRole('member');
    setPhone('');
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalMembers = users.filter(u => u.role === 'member').length;
  const totalInstructors = users.filter(u => u.role === 'instructor').length;
  const activeMemberships = userMemberships.filter(m => m.status === 'active').length;

  const cardBase = "border-border/60 bg-card/80 backdrop-blur-md shadow-sm ring-1 ring-border/40";

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border/60 bg-card/80 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Members & Staff</h1>
            <p className="text-muted-foreground mt-2">Manage your studio community and memberships.</p>
          </div>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button>Add Person</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Person</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAdd} className="space-y-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input required value={name} onChange={e => setName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" required value={email} onChange={e => setEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input value={phone} onChange={e => setPhone(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background/80 px-3 py-2 text-sm"
                    value={role}
                    onChange={e => setRole(e.target.value as Role)}
                  >
                    <option value="member">Member</option>
                    <option value="instructor">Instructor</option>
                    <option value="staff">Staff</option>
                    <option value="admin">Admin</option>
                    <option value="finance">Finance</option>
                  </select>
                </div>
                <Button type="submit" className="w-full">Save Person</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className={cardBase}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Active Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMembers}</div>
          </CardContent>
        </Card>
        <Card className={cardBase}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Instructors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalInstructors}</div>
          </CardContent>
        </Card>
        <Card className={cardBase}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Active Memberships</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeMemberships}</div>
          </CardContent>
        </Card>
      </div>

      <Card className={cardBase}>
        <CardHeader>
          <div className="max-w-sm">
            <Input 
              placeholder="Search by name or email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">Active Membership</th>
                  <th className="px-4 py-3">Joined</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(u => {
                  const activeMem = userMemberships.find(m => m.userId === u.id && m.status === 'active');
                  const plan = activeMem ? membershipPlans.find(p => p.id === activeMem.planId) : null;

                  return (
                    <tr key={u.id} className="border-b last:border-0 hover:bg-muted/20">
                      <td className="px-4 py-3 font-medium">{u.name}</td>
                      <td className="px-4 py-3">
                        <Badge variant={u.role === 'member' ? 'outline' : 'default'} className="uppercase text-[10px]">
                          {u.role}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-muted-foreground">{u.email}</div>
                        {u.phone && <div className="text-xs text-muted-foreground">{u.phone}</div>}
                      </td>
                      <td className="px-4 py-3">
                        {plan ? (
                          <div>
                            <div className="font-medium">{plan.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {activeMem?.creditsRemaining !== null ? `${activeMem?.creditsRemaining} credits left` : 'Unlimited'}
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground italic">None</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {formatDate(u.joinedAt)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {filteredUsers.length === 0 && (
              <div className="py-6 text-center text-muted-foreground">
                No users found.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}