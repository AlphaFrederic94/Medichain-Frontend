'use client';

import { useState } from 'react';
import { PageContainer } from '@/components/ehr/page-container';
import { StatCard } from '@/components/ehr/stat-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Pill, Search, Clock, CheckCircle2, Package, Calendar,
} from 'lucide-react';
import { usePatientPrescriptions } from '@/lib/hooks/use-records';
import { useAppStore } from '@/lib/store';
import type { Prescription } from '@/lib/api';

function PrescriptionCard({ rx }: { rx: Prescription }) {
  return (
    <Card className="animate-fade-in">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Pill className="size-5 text-primary" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-sm truncate">{rx.drugName}</h3>
              {rx.genericName && (
                <p className="text-xs text-muted-foreground">{rx.genericName}</p>
              )}
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant="outline" className="text-xs">{rx.dosage}</Badge>
                <Badge variant="outline" className="text-xs">{rx.frequency}</Badge>
                <Badge variant="outline" className="text-xs">{rx.durationDays} days</Badge>
              </div>
            </div>
          </div>
          <Badge
            className={
              rx.dispensed
                ? 'bg-emerald-accent/10 text-emerald-accent border-emerald-accent/20 text-xs shrink-0'
                : 'bg-primary/10 text-primary border-primary/20 text-xs shrink-0'
            }
          >
            {rx.dispensed ? (
              <><CheckCircle2 className="size-3 mr-1" /> Dispensed</>
            ) : (
              <><Clock className="size-3 mr-1" /> Active</>
            )}
          </Badge>
        </div>

        {rx.instructions && (
          <>
            <Separator className="my-3" />
            <p className="text-xs text-muted-foreground">{rx.instructions}</p>
          </>
        )}

        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="size-3" />
            Prescribed: {new Date(rx.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
          {rx.dispensedAt && (
            <span className="flex items-center gap-1">
              <Package className="size-3" />
              Dispensed: {new Date(rx.dispensedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          )}
          <span className="font-mono text-[10px]">By: {rx.prescribedBy.slice(0, 22)}…</span>
        </div>
      </CardContent>
    </Card>
  );
}

export function PatientPrescriptions() {
  const userDid = useAppStore((s) => s.userDid);
  const { data: prescriptions, isLoading } = usePatientPrescriptions(userDid);
  const [tab, setTab] = useState<'active' | 'dispensed' | 'all'>('all');
  const [search, setSearch] = useState('');

  const allRx = prescriptions ?? [];
  const active = allRx.filter((r) => !r.dispensed);
  const dispensed = allRx.filter((r) => r.dispensed);

  const filtered = (tab === 'active' ? active : tab === 'dispensed' ? dispensed : allRx).filter(
    (r) =>
      !search ||
      r.drugName.toLowerCase().includes(search.toLowerCase()) ||
      (r.genericName?.toLowerCase().includes(search.toLowerCase()) ?? false)
  );

  if (isLoading) {
    return (
      <PageContainer title="Prescriptions" subtitle="Your medication history">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="Prescriptions" subtitle="View and track your active and past prescriptions">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard
          title="Total Prescriptions"
          value={allRx.length}
          accentColor="primary"
        />
        <StatCard
          title="Active"
          value={active.length}
          accentColor="emerald-accent"
        />
        <StatCard
          title="Dispensed"
          value={dispensed.length}
          accentColor="amber-warm"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
          <TabsList>
            <TabsTrigger value="all">All ({allRx.length})</TabsTrigger>
            <TabsTrigger value="active">Active ({active.length})</TabsTrigger>
            <TabsTrigger value="dispensed">Dispensed ({dispensed.length})</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="relative sm:ml-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search prescriptions…"
            className="pl-9 h-9 w-full sm:w-64"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* List */}
      {filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map((rx) => (
            <PrescriptionCard key={rx.id} rx={rx} />
          ))}
        </div>
      ) : (
        <Card className="py-0">
          <CardContent className="py-16 text-center">
            <Pill className="size-10 mx-auto text-muted-foreground/40 mb-4" />
            <h3 className="text-base font-semibold mb-1">
              {allRx.length === 0 ? 'No prescriptions on record' : 'No matching prescriptions'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {allRx.length === 0
                ? 'Prescriptions will appear here after your first clinical visit.'
                : 'Try adjusting your search or filter.'}
            </p>
          </CardContent>
        </Card>
      )}
    </PageContainer>
  );
}
