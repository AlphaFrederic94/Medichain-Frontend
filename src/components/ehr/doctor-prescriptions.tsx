'use client';

import { useState } from 'react';
import { PageContainer } from '@/components/ehr/page-container';
import { StatCard } from '@/components/ehr/stat-card';
import { DataTable, type DataTableColumn } from '@/components/ehr/data-table';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Pill, Search, CheckCircle2, Clock, Package, Loader2,
} from 'lucide-react';
import { useProviderRecords, useDispensePrescription } from '@/lib/hooks/use-records';
import { usePatientByDid } from '@/lib/hooks/use-patient';
import { useAppStore } from '@/lib/store';
import type { Prescription } from '@/lib/api';

function PatientNameCell({ patientDid }: { patientDid: string }) {
  const { data: profile, isLoading } = usePatientByDid(patientDid);
  if (isLoading) return <span className="text-xs text-muted-foreground animate-pulse">Loading name...</span>;
  if (!profile) return <span className="text-xs text-muted-foreground">Patient record</span>;
  return (
    <div className="flex flex-col text-left">
      <span className="font-medium text-sm text-foreground">{profile.firstName} {profile.lastName}</span>
    </div>
  );
}

type PrescriptionRow = Prescription & Record<string, unknown>;

export function DoctorPrescriptions() {
  const userDid = useAppStore((s) => s.userDid);
  const role = useAppStore((s) => s.role);
  const authUser = useAppStore((s) => s.authUser);

  // For doctors: show prescriptions they wrote (from their own records view)
  const { data: records, isLoading } = useProviderRecords(userDid);
  const { mutate: dispense, isPending: dispensing } = useDispensePrescription();

  const [tab, setTab] = useState<'all' | 'pending' | 'dispensed'>('all');
  const [search, setSearch] = useState('');

  // All prescriptions this provider has written (if authUser is null show all)
  const allRx = (records?.prescriptions ?? []).filter(
    (p) => !authUser || p.prescribedBy === authUser.did
  );
  const pending = allRx.filter((r) => !r.dispensed);
  const dispensed = allRx.filter((r) => r.dispensed);

  const filtered = (tab === 'pending' ? pending : tab === 'dispensed' ? dispensed : allRx).filter(
    (r) =>
      !search ||
      r.drugName.toLowerCase().includes(search.toLowerCase()) ||
      r.patientDid.toLowerCase().includes(search.toLowerCase())
  );

  const isPharmacist = authUser?.role === 'PHARMACIST';

  const columns: DataTableColumn<PrescriptionRow>[] = [
    {
      header: 'Drug',
      accessor: (row) => (
        <div>
          <p className="font-semibold text-sm">{(row as Prescription).drugName}</p>
          {(row as Prescription).genericName && (
            <p className="text-xs text-muted-foreground">{(row as Prescription).genericName}</p>
          )}
        </div>
      ),
    },
    {
      header: 'Patient',
      accessor: (row) => (
        <PatientNameCell patientDid={(row as Prescription).patientDid} />
      ),
    },
    {
      header: 'Dosage',
      accessor: (row) => (
        <div className="text-xs space-y-0.5">
          <p>{(row as Prescription).dosage}</p>
          <p className="text-muted-foreground">{(row as Prescription).frequency}</p>
        </div>
      ),
      headerClassName: 'w-[140px]',
    },
    {
      header: 'Duration',
      accessor: (row) => `${(row as Prescription).durationDays}d`,
      headerClassName: 'w-[80px]',
    },
    {
      header: 'Date',
      accessor: (row) =>
        new Date((row as Prescription).createdAt).toLocaleDateString('en-US', {
          month: 'short', day: 'numeric',
        }),
      headerClassName: 'w-[100px]',
    },
    {
      header: 'Status',
      accessor: (row) => {
        const rx = row as Prescription;
        return (
          <Badge
            className={
              rx.dispensed
                ? 'bg-emerald-accent/10 text-emerald-accent border-emerald-accent/20 text-xs'
                : 'bg-primary/10 text-primary border-primary/20 text-xs'
            }
          >
            {rx.dispensed ? (
              <><CheckCircle2 className="size-3 mr-1" /> Dispensed</>
            ) : (
              <><Clock className="size-3 mr-1" /> Active</>
            )}
          </Badge>
        );
      },
      headerClassName: 'w-[130px]',
    },
    ...(isPharmacist ? [{
      header: '',
      accessor: (row: PrescriptionRow) => {
        const rx = row as Prescription;
        if (rx.dispensed) return null;
        return (
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs gap-1"
            disabled={dispensing}
            onClick={() => dispense(rx.id)}
          >
            {dispensing ? <Loader2 className="size-3 animate-spin" /> : <Package className="size-3" />}
            Dispense
          </Button>
        );
      },
      headerClassName: 'w-[120px]',
      cellClassName: 'text-right',
    }] : []),
  ];

  if (isLoading) {
    return (
      <PageContainer title="Prescriptions" subtitle="Manage issued prescriptions">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
        <Skeleton className="h-80 rounded-xl" />
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="Prescriptions"
      subtitle={isPharmacist ? 'Review and dispense prescriptions' : 'Prescriptions you have issued'}
    >
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard title="Total Issued" value={allRx.length} accentColor="primary" />
        <StatCard title="Active" value={pending.length} accentColor="amber-warm" />
        <StatCard title="Dispensed" value={dispensed.length} accentColor="emerald-accent" />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
          <TabsList>
            <TabsTrigger value="all">All ({allRx.length})</TabsTrigger>
            <TabsTrigger value="pending">Active ({pending.length})</TabsTrigger>
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

      {/* Table */}
      {filtered.length > 0 ? (
        <Card className="py-0">
          <CardContent className="p-0">
            <DataTable
              columns={columns}
              data={filtered as PrescriptionRow[]}
              rowKey="id"
              maxHeight="max-h-[600px]"
            />
          </CardContent>
        </Card>
      ) : (
        <Card className="py-0">
          <CardContent className="py-16 text-center">
            <Pill className="size-10 mx-auto text-muted-foreground/40 mb-4" />
            <h3 className="text-base font-semibold mb-1">
              {allRx.length === 0 ? 'No prescriptions issued yet' : 'No matching prescriptions'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {allRx.length === 0
                ? 'Prescriptions will appear here after you complete a visit.'
                : 'Try adjusting your search or filter.'}
            </p>
          </CardContent>
        </Card>
      )}
    </PageContainer>
  );
}
