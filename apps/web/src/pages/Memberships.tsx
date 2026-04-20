import React, { useRef, useState } from 'react';
import { useStudioStore } from '../stores/studioStore';
import { useAuthStore } from '../stores/authStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
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
import { MembershipType } from '../types';
import { Check } from 'lucide-react';

export default function Memberships() {
  const { membershipPlans, userMemberships, addMembershipPlan, purchaseMembership } = useStudioStore();
  const { user } = useAuthStore();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const noticeTimeout = useRef<number | null>(null);

  // Form
  const [name, setName] = useState('');
  const [type, setType] = useState<MembershipType>('drop-in');
  const [price, setPrice] = useState(20);
  const [credits, setCredits] = useState<number | ''>('');
  const [validityDays, setValidityDays] = useState(30);

  const isAdmin = user?.role === 'admin';

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    
    addMembershipPlan({
      name,
      type,
      price,
      credits: type === 'unlimited' ? null : (Number(credits) || 1),
      validityDays
    });
    
    setIsAddOpen(false);
    setName('');
    setType('drop-in');
    setPrice(20);
    setCredits('');
    setValidityDays(30);
  };

  const showNotice = (message: string) => {
    setNotice(message);
    if (noticeTimeout.current) {
      window.clearTimeout(noticeTimeout.current);
    }
    noticeTimeout.current = window.setTimeout(() => setNotice(null), 3200);
  };

  const handlePurchase = (planId: string) => {
    if (!user) return;
    purchaseMembership(user.id, planId);
    showNotice('Purchase successful! Plan added to your account.');
  };

  const myActivePlans = userMemberships.filter(m => m.userId === user?.id && m.status === 'active');

  const cardBase = "border-border/60 bg-card/80 backdrop-blur-md shadow-sm ring-1 ring-border/40";
  const hoverCard = "transition-all hover:-translate-y-0.5 hover:shadow-md";

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-border/60 bg-card/80 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Memberships & Passes</h1>
            <p className="text-muted-foreground mt-2">Purchase class credits or unlimited plans.</p>
          </div>
          {isAdmin && (
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <Button>Create Plan</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Membership Plan</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAdd} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Plan Name</Label>
                    <Input required value={name} onChange={e => setName(e.target.value)} placeholder="10 Class Pass" />
                  </div>
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background/80 px-3 py-2 text-sm"
                      value={type}
                      onChange={e => setType(e.target.value as MembershipType)}
                    >
                      <option value="drop-in">Single Drop-in</option>
                      <option value="pass">Class Pass</option>
                      <option value="unlimited">Unlimited Subscription</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Price ($)</Label>
                      <Input type="number" required min={0} value={price} onChange={e => setPrice(Number(e.target.value))} />
                    </div>
                    <div className="space-y-2">
                      <Label>Validity (Days)</Label>
                      <Input type="number" required min={1} value={validityDays} onChange={e => setValidityDays(Number(e.target.value))} />
                    </div>
                  </div>
                  {type !== 'unlimited' && (
                    <div className="space-y-2">
                      <Label>Credits</Label>
                      <Input type="number" required min={1} value={credits} onChange={e => setCredits(Number(e.target.value))} />
                    </div>
                  )}
                  <Button type="submit" className="w-full">Save Plan</Button>
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

      {user?.role === 'member' && myActivePlans.length > 0 && (
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-4">Your Active Plans</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {myActivePlans.map(m => {
              const plan = membershipPlans.find(p => p.id === m.planId);
              if (!plan) return null;
              return (
                <Card key={m.id} className={cardBase}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{plan.name}</CardTitle>
                    <CardDescription>Expires {formatDate(m.validUntil)}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {m.creditsRemaining !== null ? `${m.creditsRemaining} Credits` : 'Unlimited'}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-2xl font-bold mb-6">Available Plans</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {membershipPlans.map(plan => (
            <Card key={plan.id} className={`flex flex-col ${cardBase} ${hoverCard}`}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <Badge variant="outline" className="uppercase">{plan.type}</Badge>
                </div>
                <div className="mt-4">
                  <span className="text-4xl font-bold">${plan.price}</span>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-primary mr-2" />
                    {plan.credits === null ? 'Unlimited classes' : `${plan.credits} class credit${plan.credits > 1 ? 's' : ''}`}
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-primary mr-2" />
                    Valid for {plan.validityDays} days
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-primary mr-2" />
                    Book online instantly
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                {user?.role === 'member' ? (
                  <Button className="w-full" onClick={() => handlePurchase(plan.id)}>Purchase</Button>
                ) : isAdmin ? (
                  <Button className="w-full" variant="outline">Edit Plan</Button>
                ) : null}
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}