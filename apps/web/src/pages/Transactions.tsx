import React, { useState } from 'react';
import { useStudioStore } from '../stores/studioStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { formatDateTime } from '../lib/dateUtils';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

export default function Transactions() {
  const { transactions, users } = useStudioStore();
  const [searchTerm, setSearchTerm] = useState('');

  const sortedTransactions = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const filteredTransactions = sortedTransactions.filter(t => {
    const user = users.find(u => u.id === t.userId);
    return (
      user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const totalRevenue = transactions.filter(t => t.type === 'purchase').reduce((sum, t) => sum + t.amount, 0);
  const totalRefunds = transactions.filter(t => t.type === 'refund').reduce((sum, t) => sum + t.amount, 0);

  const cardBase = "border-border/60 bg-card/80 backdrop-blur-md shadow-sm ring-1 ring-border/40";
  const hoverCard = "transition-all hover:-translate-y-0.5 hover:shadow-md";

  const exportCSV = () => {
    const headers = ['Date', 'User', 'Type', 'Amount', 'Description'];
    const rows = filteredTransactions.map(t => {
      const user = users.find(u => u.id === t.userId);
      return [
        formatDateTime(t.date),
        user?.name || 'Unknown',
        t.type,
        t.type === 'refund' ? `-${t.amount}` : t.amount,
        t.description
      ].join(',');
    });
    const csvContent = [headers.join(','), ...rows].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'studio_transactions.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border/60 bg-card/80 p-6 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transactions & Invoices</h1>
          <p className="text-muted-foreground mt-2">View payment history, issue refunds, and export reports.</p>
        </div>
        <Button onClick={exportCSV} variant="outline">
          <Download className="mr-2 h-4 w-4" /> Export CSV
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className={`${cardBase} ${hoverCard}`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${totalRevenue.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card className={`${cardBase} ${hoverCard}`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Refunds</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">${totalRefunds.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card className={`${cardBase} ${hoverCard}`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Net Income</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(totalRevenue - totalRefunds).toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      <Card className={cardBase}>
        <CardHeader>
          <div className="max-w-sm">
            <Input 
              placeholder="Search transactions..." 
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
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                  <th className="px-4 py-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map(t => {
                  const user = users.find(u => u.id === t.userId);
                  return (
                    <tr key={t.id} className="border-b last:border-0 hover:bg-muted/20">
                      <td className="px-4 py-3 text-muted-foreground">
                        {formatDateTime(t.date)}
                      </td>
                      <td className="px-4 py-3 font-medium">{user?.name || 'Unknown'}</td>
                      <td className="px-4 py-3">{t.description}</td>
                      <td className={`px-4 py-3 text-right font-medium ${t.type === 'refund' ? 'text-red-600' : 'text-green-600'}`}>
                        {t.type === 'refund' ? '-' : '+'}${t.amount.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge variant={t.type === 'purchase' ? 'default' : 'destructive'} className="uppercase text-[10px]">
                          {t.type}
                        </Badge>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {filteredTransactions.length === 0 && (
              <div className="py-6 text-center text-muted-foreground">
                No transactions found.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}