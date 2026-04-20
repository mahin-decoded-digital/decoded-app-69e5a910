import React, { useState } from 'react';
import { useStudioStore } from '../stores/studioStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

export default function Settings() {
  const { settings, updateSettings } = useStudioStore();
  const [saved, setSaved] = useState(false);

  const [bookAdvanceHours, setBookAdvanceHours] = useState(settings.bookAdvanceHours);
  const [freeCancelHours, setFreeCancelHours] = useState(settings.freeCancelHours);
  const [instantCharge, setInstantCharge] = useState(settings.instantCharge);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      bookAdvanceHours,
      freeCancelHours,
      instantCharge
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const cardBase = "border-border/60 bg-card/80 backdrop-blur-md shadow-sm ring-1 ring-border/40";

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="rounded-2xl border border-border/60 bg-card/80 p-6 shadow-sm">
        <h1 className="text-3xl font-bold tracking-tight">Studio Settings</h1>
        <p className="text-muted-foreground mt-2">Configure booking, cancellation, and payment rules.</p>
      </div>

      <form onSubmit={handleSave}>
        <Card className={cardBase}>
          <CardHeader>
            <CardTitle>Booking Rules</CardTitle>
            <CardDescription>Control when members can book and cancel classes.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Advance Booking Window (Hours)</Label>
              <div className="text-sm text-muted-foreground mb-2">
                How far in advance can members book a class? (e.g., 72 hours = 3 days)
              </div>
              <Input 
                type="number" 
                required 
                min={1} 
                value={bookAdvanceHours} 
                onChange={e => setBookAdvanceHours(Number(e.target.value))} 
              />
            </div>
            
            <div className="space-y-2 pt-4 border-t">
              <Label>Free Cancellation Window (Hours)</Label>
              <div className="text-sm text-muted-foreground mb-2">
                Up to how many hours before class start can a member cancel for free? (e.g., 12 hours)
              </div>
              <Input 
                type="number" 
                required 
                min={0} 
                value={freeCancelHours} 
                onChange={e => setFreeCancelHours(Number(e.target.value))} 
              />
            </div>

            <div className="space-y-2 pt-4 border-t">
              <Label>Payment Processing</Label>
              <div className="flex items-center space-x-2 mt-2">
                <input 
                  type="checkbox" 
                  id="instantCharge" 
                  checked={instantCharge} 
                  onChange={e => setInstantCharge(e.target.checked)} 
                  className="rounded border-input h-4 w-4" 
                />
                <Label htmlFor="instantCharge" className="font-normal">
                  Instant Charge: Bill immediately upon booking (if pass/credits unavailable).
                </Label>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t p-6">
            <Button type="submit">Save Changes</Button>
            {saved && (
              <span className="flex items-center text-green-600 text-sm font-medium">
                <Check className="h-4 w-4 mr-1" /> Settings saved
              </span>
            )}
          </CardFooter>
        </Card>
      </form>

      <Card className={cardBase}>
        <CardHeader>
          <CardTitle>Integrations</CardTitle>
          <CardDescription>Connect external services.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-xl border border-border/60 bg-background/80 p-4">
            <div>
              <div className="font-medium">Google Calendar</div>
              <div className="text-sm text-muted-foreground">Sync studio schedule with Google Calendar</div>
            </div>
            <Button variant="outline">Connect</Button>
          </div>
          <div className="flex items-center justify-between rounded-xl border border-border/60 bg-background/80 p-4">
            <div>
              <div className="font-medium">Apple Calendar (iCal)</div>
              <div className="text-sm text-muted-foreground">Generate subscription URL</div>
            </div>
            <Button variant="outline">Generate URL</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}