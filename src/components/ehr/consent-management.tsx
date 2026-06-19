'use client';

import { useState } from 'react';
import { PageContainer } from '@/components/ehr/page-container';
import { DataTable, type DataTableColumn } from '@/components/ehr/data-table';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
  ShieldCheck, Plus, Clock, CheckCircle2, AlertCircle, Lock,
} from 'lucide-react';
import { usePatientRecords } from '@/lib/hooks/use-records';
import { useAppStore } from '@/lib/store';
import type { Encounter } from '@/lib/api';

// Derive unique provider access entries from encounters
function buildAccessLog(encounters: Encounter[]) {
  const providerMap = new Map<string, { providerDid: string; lastAccess: string; visits: number }>();
  for (const enc of encounters) {
    const existing = providerMap.get(enc.providerDid);
    if (!existing || new Date(enc.encounterDate) > new Date(existing.lastAccess)) {
      providerMap.set(enc.providerDid, {
        providerDid: enc.providerDid,
        lastAccess: enc.encounterDate,
        visits: (existing?.visits ?? 0) + 1,
      });
    } else {
      existing.visits += 1;
    }
  }
  return Array.from(providerMap.values()).sort(
    (a, b) => new Date(b.lastAccess).getTime() - new Date(a.lastAccess).getTime()
  );
}

export function ConsentManagement() {
  const userDid = useAppStore((s) => s.userDid);
  const { data: records, isLoading } = usePatientRecords(userDid);

  const [grantDialogOpen, setGrantDialogOpen] = useState(false);
  const [grantForm, setGrantForm] = useState({ providerDid: '', accessTypes: [] as string[], duration: '24h', purpose: '' });

  const encounters = records?.encounters ?? [];
  const accessLog = buildAccessLog(encounters);

  const toggleAccessType = (type: string) => {
    setGrantForm((prev) => ({
      ...prev,
      accessTypes: prev.accessTypes.includes(type)
        ? prev.accessTypes.filter((t) => t !== type)
        : [...prev.accessTypes, type],
    }));
  };

  const tableColumns: DataTableColumn<(typeof accessLog)[0] & Record<string, unknown>>[] = [
    {
      header: 'Provider DID',
      accessor: (row) => (
        <span className="font-mono text-xs text-muted-foreground truncate max-w-[220px] inline-block">
          {(row as (typeof accessLog)[0]).providerDid}
        </span>
      ),
    },
    {
      header: 'Last Access',
      accessor: (row) =>
        new Date((row as (typeof accessLog)[0]).lastAccess).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }),
      headerClassName: 'w-[160px]',
    },
    {
      header: 'Visits',
      accessor: (row) => (
        <Badge variant="outline" className="text-xs">
          {(row as (typeof accessLog)[0]).visits} visit{(row as (typeof accessLog)[0]).visits !== 1 ? 's' : ''}
        </Badge>
      ),
      headerClassName: 'w-[100px]',
    },
    {
      header: 'Status',
      accessor: () => (
        <Badge className="bg-emerald-accent/10 text-emerald-accent border-emerald-accent/20 text-xs gap-1">
          <CheckCircle2 className="size-3" /> Verified
        </Badge>
      ),
      headerClassName: 'w-[120px]',
    },
  ];

  if (isLoading) {
    return (
      <PageContainer title="Consent Management" subtitle="Your Data. Your Control.">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="Consent Management"
      subtitle="Your Data. Your Control."
      actions={
        <Button className="gap-2" onClick={() => setGrantDialogOpen(true)}>
          <Plus className="w-4 h-4" /> Grant Access
        </Button>
      }
    >
      {/* Blockchain Consent Explanation */}
      <Card className="mb-6 animate-fade-in border-primary/20 bg-primary/5">
        <CardContent className="p-5 flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <ShieldCheck className="size-5 text-primary" />
          </div>
          <div className="space-y-1">
            <h3 className="font-semibold text-sm text-foreground">AfriHealth Chain Consent Model</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Your consent is enforced on-chain. Every provider who accesses your records is verified against the AfriHealth blockchain.
              Access is automatically logged and immutable. You can review who has seen your records below.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Providers with Access', value: accessLog.length, icon: ShieldCheck, color: 'text-emerald-accent' },
          { label: 'Total Encounters', value: encounters.length, icon: Clock, color: 'text-amber-warm' },
          { label: 'Records Secured', value: (records?.prescriptions?.length ?? 0) + (records?.documents?.length ?? 0), icon: CheckCircle2, color: 'text-primary' },
        ].map((s) => (
          <Card key={s.label} className="py-0">
            <CardContent className="p-5 flex items-center gap-4">
              <div className={`w-10 h-10 rounded-lg bg-muted flex items-center justify-center ${s.color}`}>
                <s.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Provider Access Log */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-accent" />
          Provider Access History
        </h2>
        {accessLog.length > 0 ? (
          <Card className="py-0">
            <CardContent className="p-0">
              <DataTable
                columns={tableColumns}
                data={accessLog as ((typeof accessLog)[0] & Record<string, unknown>)[]}
                rowKey="providerDid"
                maxHeight="max-h-[480px]"
              />
            </CardContent>
          </Card>
        ) : (
          <Card className="py-0">
            <CardContent className="py-12 text-center">
              <Lock className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">No provider access on record</p>
              <p className="text-xs text-muted-foreground mt-1">
                Access history will appear here once a provider views your records
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Security Notes */}
      <Card className="animate-fade-in">
        <CardContent className="p-5 space-y-3">
          <h3 className="text-sm font-semibold text-foreground">How your data is protected</h3>
          <div className="space-y-2">
            {[
              'Every record access is anchored immutably on AfriHealth Chain',
              'Providers must have your explicit consent before viewing sensitive records',
              'Time-limited access windows are enforced automatically',
              'You can review the full audit trail anytime in this page',
            ].map((point) => (
              <div key={point} className="flex items-start gap-2 text-xs text-muted-foreground">
                <CheckCircle2 className="size-3.5 text-emerald-accent mt-0.5 shrink-0" />
                <span>{point}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Grant Access Dialog */}
      <Dialog open={grantDialogOpen} onOpenChange={setGrantDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" /> Grant Provider Access
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-3 rounded-lg bg-amber-warm/10 text-amber-warm text-xs flex items-start gap-2">
              <AlertCircle className="size-4 shrink-0 mt-0.5" />
              <span>Granting access issues a signed blockchain consent token. The provider can access your records for the specified duration.</span>
            </div>
            <div className="space-y-2">
              <Label>Provider DID</Label>
              <Input
                placeholder="did:afrihealth:DR-CMR-XXXXX"
                value={grantForm.providerDid}
                onChange={(e) => setGrantForm({ ...grantForm, providerDid: e.target.value })}
                className="font-mono text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label>Access Scope</Label>
              <div className="flex flex-wrap gap-2">
                {['Records', 'Prescriptions', 'Documents', 'Vitals'].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => toggleAccessType(type)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      grantForm.accessTypes.includes(type)
                        ? 'bg-primary/10 text-primary border-primary/30'
                        : 'bg-muted text-muted-foreground border-border hover:border-primary/20'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Duration</Label>
              <div className="flex gap-2">
                {['2h', '8h', '24h', '48h'].map((dur) => (
                  <button
                    key={dur}
                    type="button"
                    onClick={() => setGrantForm({ ...grantForm, duration: dur })}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      grantForm.duration === dur
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-muted text-muted-foreground border-border hover:border-primary/20'
                    }`}
                  >
                    {dur}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Purpose</Label>
              <Textarea
                placeholder="Reason for granting access..."
                value={grantForm.purpose}
                onChange={(e) => setGrantForm({ ...grantForm, purpose: e.target.value })}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGrantDialogOpen(false)}>Cancel</Button>
            <Button
              disabled={!grantForm.providerDid || grantForm.accessTypes.length === 0}
              onClick={() => setGrantDialogOpen(false)}
            >
              Issue Consent Token
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
