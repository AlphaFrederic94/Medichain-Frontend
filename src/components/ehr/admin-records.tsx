'use client';

import React, { useState } from 'react';
import { PageContainer } from '@/components/ehr/page-container';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Pill, Activity, Search, Calendar, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { useAdminPrescriptions, useAdminDiagnoses } from '@/lib/hooks/use-records';

export function AdminRecords() {
  const { data: prescriptions, isLoading: rxLoading } = useAdminPrescriptions();
  const { data: diagnoses, isLoading: dxLoading } = useAdminDiagnoses();
  const [tab, setTab] = useState<'prescriptions' | 'diagnoses'>('prescriptions');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRx = (prescriptions ?? []).filter((r: any) => {
    const term = searchTerm.toLowerCase();
    return (r.medicationName || '').toLowerCase().includes(term) || (r.patientDid || '').toLowerCase().includes(term);
  });

  const filteredDx = (diagnoses ?? []).filter((d: any) => {
    const term = searchTerm.toLowerCase();
    return (d.description || '').toLowerCase().includes(term) || (d.patientDid || '').toLowerCase().includes(term) || (d.icd10Code || '').toLowerCase().includes(term);
  });

  if (rxLoading || dxLoading) {
    return (
      <PageContainer title="Clinical Records Overview" subtitle="System-wide supervision of prescriptions and clinical diagnoses">
        <Skeleton className="h-96 w-full rounded-xl" />
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="Clinical Records Overview"
      subtitle="Supervise global clinical activity, prescriptions dispensed, and ICD-10 diagnostic trends across MediChain"
    >
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <div className="flex gap-2 p-1 bg-muted rounded-lg border border-border/50">
          <button
            onClick={() => setTab('prescriptions')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-semibold transition-all ${
              tab === 'prescriptions' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Pill className="size-4 text-terra" /> All Prescriptions ({prescriptions?.length ?? 0})
          </button>
          <button
            onClick={() => setTab('diagnoses')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-semibold transition-all ${
              tab === 'diagnoses' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Activity className="size-4 text-emerald-accent" /> All Diagnoses ({diagnoses?.length ?? 0})
          </button>
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder={`Search ${tab}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-10 w-full"
          />
        </div>
      </div>

      {tab === 'prescriptions' ? (
        filteredRx.length === 0 ? (
          <Card className="p-12 text-center border-dashed">
            <Pill className="size-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-base font-semibold">No prescriptions logged yet</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in">
            {filteredRx.map((r: any) => (
              <Card key={r.id} className="border-border/60 hover:shadow-md transition-all bg-card">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                      <Pill className="size-4 text-terra shrink-0" />
                      {r.medicationName}
                    </CardTitle>
                    <Badge variant={r.dispensed ? 'default' : 'secondary'} className={r.dispensed ? 'bg-emerald-accent text-white' : 'bg-amber-warm/10 text-amber-warm border-amber-warm/20'}>
                      {r.dispensed ? 'Dispensed' : 'Pending'}
                    </Badge>
                  </div>
                  <CardDescription className="text-xs font-mono truncate" title={r.patientDid}>
                    Patient: {r.patientDid}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-xs text-muted-foreground pt-0">
                  <p><strong>Dosage:</strong> {r.dosage} ({r.frequency})</p>
                  <p><strong>Duration:</strong> {r.duration}</p>
                  {r.instructions && <p className="italic bg-muted/40 p-2 rounded border border-border/40">&ldquo;{r.instructions}&rdquo;</p>}
                  <div className="pt-2 border-t border-border/40 flex items-center justify-between text-[11px] font-mono">
                    <span>{new Date(r.createdAt).toLocaleDateString()}</span>
                    {r.blockchainTxId && <span className="text-emerald-accent">Anchored ✓</span>}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )
      ) : (
        filteredDx.length === 0 ? (
          <Card className="p-12 text-center border-dashed">
            <Activity className="size-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-base font-semibold">No diagnoses logged yet</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in">
            {filteredDx.map((d: any) => (
              <Card key={d.id} className="border-border/60 hover:shadow-md transition-all bg-card">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base font-bold text-foreground">
                      {d.description}
                    </CardTitle>
                    <Badge className="bg-primary/10 text-primary border-primary/20 font-mono text-xs">
                      {d.icd10Code || 'ICD-10'}
                    </Badge>
                  </div>
                  <CardDescription className="text-xs font-mono truncate" title={d.patientDid}>
                    Patient: {d.patientDid}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-xs text-muted-foreground pt-0">
                  <p><strong>Status:</strong> {d.status || 'ACTIVE'}</p>
                  {d.notes && <p className="italic bg-muted/40 p-2 rounded border border-border/40">&ldquo;{d.notes}&rdquo;</p>}
                  <div className="pt-2 border-t border-border/40 flex items-center justify-between text-[11px] font-mono">
                    <span>{new Date(d.createdAt).toLocaleDateString()}</span>
                    {d.blockchainTxId && <span className="text-emerald-accent">Anchored ✓</span>}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )
      )}
    </PageContainer>
  );
}
