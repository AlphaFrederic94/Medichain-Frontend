'use client';

import { useMemo, useState } from 'react';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { PlusCircle, Search, QrCode, Filter, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';

import { PageContainer } from '@/components/ehr/page-container';
import { StatCard } from '@/components/ehr/stat-card';
import { DataTable, type DataTableColumn } from '@/components/ehr/data-table';
import { ChartCard } from '@/components/ehr/chart-card';
import { useAppStore } from '@/lib/store';
import { useMyProviderProfile } from '@/lib/hooks/use-provider';
import { useProviderRecords } from '@/lib/hooks/use-records';
import { useSearchPatients } from '@/lib/hooks/use-patient';
import type { PatientSearchResult } from '@/lib/api';

/* ─────────────────────────── Pie chart colours ──────────────────────────── */
const PIE_COLORS = [
  'oklch(0.535 0.115 30)',
  'oklch(0.488 0.14 165)',
  'oklch(0.75 0.15 70)',
  'oklch(0.6 0.012 80)',
];


/* ─────────────────────────── Component ──────────────────────────────────── */
export function DoctorDashboard() {
  const { navigate, userDid, setActivePatientDid } = useAppStore();

  const { data: providerProfile, isLoading: profileLoading } = useMyProviderProfile();
  const { data: records } = useProviderRecords(userDid);

  const { mutate: searchPatients, data: searchResults, isPending: searching } = useSearchPatients();
  const [searchQuery, setSearchQuery] = useState('');

  // Compute stats from real records
  const today = new Date().toDateString();
  const encountersToday = (records?.encounters ?? []).filter(
    (e) => new Date(e.encounterDate).toDateString() === today
  ).length;
  const activePrescriptions = (records?.prescriptions ?? []).filter(
    (p) => !p.dispensed
  ).length;
  const documentsUploaded = (records?.documents ?? []).length;

  // Compute chart data from real records
  const visitTypeMap = new Map<string, number>();
  for (const enc of records?.encounters ?? []) {
    const label = enc.encounterType.charAt(0) + enc.encounterType.slice(1).toLowerCase();
    visitTypeMap.set(label, (visitTypeMap.get(label) ?? 0) + 1);
  }
  const visitTypesData = Array.from(visitTypeMap.entries()).map(([name, value]) => ({ name, value }));

  const diagnosisCountMap = new Map<string, number>();
  for (const d of records?.diagnoses ?? []) {
    diagnosisCountMap.set(d.description, (diagnosisCountMap.get(d.description) ?? 0) + 1);
  }
  const diagnosesData = Array.from(diagnosisCountMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));

  /* ──────────── Search result columns ──────────── */
  const searchColumns: DataTableColumn<PatientSearchResult & Record<string, unknown>>[] = useMemo(
    () => [
      {
        header: 'Name',
        accessor: (row) => (
          <span className="font-medium">{(row as PatientSearchResult).firstName} {(row as PatientSearchResult).lastName}</span>
        ),
      },
      {
        header: 'DID',
        accessor: (row) => (
          <span className="font-mono text-xs text-muted-foreground truncate max-w-[180px] inline-block">
            {(row as PatientSearchResult).userDid}
          </span>
        ),
      },
      {
        header: 'Blood Group',
        accessor: (row) => (row as PatientSearchResult).bloodGroup ?? '—',
        headerClassName: 'w-[100px]',
      },
      {
        header: 'City',
        accessor: (row) => (row as PatientSearchResult).city ?? '—',
        headerClassName: 'w-[120px]',
      },
      {
        header: '',
        accessor: (row) => (
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            onClick={() => {
              setActivePatientDid((row as PatientSearchResult).userDid);
              navigate('doctor-patient-search');
            }}
          >
            Open
          </Button>
        ),
        headerClassName: 'w-[80px]',
        cellClassName: 'text-right',
      },
    ],
    [navigate, setActivePatientDid]
  );

  /* ──────────── Custom tooltip for bar chart ──────────── */
  const barTooltip = ({ active, payload, label }: Record<string, unknown>) => {
    if (!active || !(payload as unknown[])?.length) return null;
    const p = (payload as Array<{ value: number }>)[0];
    return (
      <div className="rounded-md border bg-card px-3 py-2 text-xs shadow-md">
        <p className="font-semibold text-foreground">{label as string}</p>
        <p className="text-muted-foreground">{p.value} cases</p>
      </div>
    );
  };

  /* ──────────── Custom label for pie chart ──────────── */
  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: Record<string, number>) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" className="text-xs font-semibold">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  if (profileLoading) {
    return (
      <PageContainer title="Doctor Dashboard" subtitle="Loading your clinical overview…">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-80 rounded-xl mb-8" />
      </PageContainer>
    );
  }

  const specialtyLabel = providerProfile?.specialty ?? '—';
  const facilityLabel = providerProfile?.facility?.name ?? '—';

  return (
    <PageContainer
      title="Doctor Dashboard"
      subtitle="Welcome back. Here's your clinical overview for today."
      actions={
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2">
            <Badge variant="secondary" className="text-xs font-semibold">{specialtyLabel}</Badge>
            <span className="text-sm text-muted-foreground">{facilityLabel}</span>
          </div>
          <Button onClick={() => navigate('doctor-new-visit')} className="gap-1.5">
            <PlusCircle className="size-4" />
            New Visit
          </Button>
        </div>
      }
    >
      {/* ── Stats Row ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Encounters Today"
          value={encountersToday}
          trend="neutral"
          trendPercentage="0"
          accentColor="primary"
        />
        <StatCard
          title="Pending Prescriptions"
          value={activePrescriptions}
          trend="neutral"
          trendPercentage="0"
          accentColor="emerald-accent"
        />
        <StatCard
          title="Documents on File"
          value={documentsUploaded}
          trend="neutral"
          trendPercentage="0"
          accentColor="amber-warm"
        />
        <StatCard
          title="Account Verified"
          value={providerProfile?.verified ? 'Yes' : 'Pending'}
          accentColor="primary"
        />
      </div>

      {/* ── Patient Search Section ───────────────────────────────────── */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-foreground mb-4">Patient Search</h2>
        <Card className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search by DID, name, or phone number"
                className="pl-9 h-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchQuery.trim()) {
                    const q = searchQuery.trim();
                    searchPatients(
                      q.startsWith('did:') ? { did: q }
                      : /^\+?\d/.test(q) ? { phone: q }
                      : { name: q }
                    );
                  }
                }}
              />
            </div>
            <Button
              variant="outline"
              className="gap-1.5 h-10 shrink-0"
              disabled={searching || !searchQuery.trim()}
              onClick={() => {
                const q = searchQuery.trim();
                searchPatients(
                  q.startsWith('did:') ? { did: q }
                  : /^\+?\d/.test(q) ? { phone: q }
                  : { name: q }
                );
              }}
            >
              {searching ? <Loader2 className="size-4 animate-spin" /> : <QrCode className="size-4" />}
              Search
            </Button>
          </div>

          {searchResults && searchResults.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2.5">
                Search Results
              </p>
              <DataTable<PatientSearchResult & Record<string, unknown>>
                columns={searchColumns}
                data={searchResults as (PatientSearchResult & Record<string, unknown>)[]}
                rowKey="userDid"
                maxHeight="max-h-64"
              />
            </div>
          )}

          {searchResults && searchResults.length === 0 && (
            <p className="mt-4 text-sm text-muted-foreground text-center py-4">
              No patients found matching your search.
            </p>
          )}

          <div className="mt-4 flex items-center justify-between border-t pt-3">
            <p className="text-xs text-muted-foreground">
              Search the AfriHealth Chain patient registry
            </p>
            <Button
              variant="link"
              size="sm"
              className="text-primary h-auto p-0 text-xs"
              onClick={() => navigate('doctor-patient-search')}
            >
              Advanced Search →
            </Button>
          </div>
        </Card>
      </section>

      {/* ── Quick Stats Charts ───────────────────────────────────────── */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Top Diagnoses" subtitle="Your most frequent diagnoses">
          <div className="h-[280px]">
            {diagnosesData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={diagnosesData} margin={{ top: 8, right: 16, left: 0, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="oklch(0.908 0.015 80)" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'oklch(0.495 0.02 30)' }} axisLine={false} tickLine={false} interval={0} />
                  <YAxis tick={{ fontSize: 11, fill: 'oklch(0.495 0.02 30)' }} axisLine={false} tickLine={false} width={32} allowDecimals={false} />
                  <Tooltip content={barTooltip as any} cursor={{ fill: 'oklch(0.535 0.115 30 / 0.06)' }} />
                  <Bar dataKey="count" fill="oklch(0.535 0.115 30)" radius={[4, 4, 0, 0]} maxBarSize={48} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                No diagnoses recorded yet
              </div>
            )}
          </div>
        </ChartCard>

        <ChartCard title="Visit Types" subtitle="Distribution of your encounter types">
          <div className="h-[280px]">
            {visitTypesData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={visitTypesData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomLabel}
                    outerRadius={100}
                    innerRadius={50}
                    dataKey="value"
                    strokeWidth={2}
                    stroke="oklch(0.995 0.001 80)"
                  >
                    {visitTypesData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number, name: string) => [value, name] as [number, string]}
                    contentStyle={{ borderRadius: '8px', border: '1px solid oklch(0.908 0.015 80)', fontSize: '12px' }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    iconSize={8}
                    formatter={(value: string) => <span className="text-xs text-foreground">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                No encounters recorded yet
              </div>
            )}
          </div>
        </ChartCard>
      </section>
    </PageContainer>
  );
}
