'use client';

import { useMemo, useState } from 'react';
import { PageContainer } from '@/components/ehr/page-container';
import { DataTable, type DataTableColumn } from '@/components/ehr/data-table';
import { StatCard } from '@/components/ehr/stat-card';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Users, UserRound, Calendar, ArrowRight } from 'lucide-react';
import { useProviderRecords } from '@/lib/hooks/use-records';
import { usePatientByDid } from '@/lib/hooks/use-patient';
import { useAppStore } from '@/lib/store';
import type { Encounter } from '@/lib/api';

function PatientNameCell({ patientDid }: { patientDid: string }) {
  const { data: profile, isLoading } = usePatientByDid(patientDid);
  if (isLoading) return <span className="text-xs text-muted-foreground animate-pulse">Loading name...</span>;
  if (!profile) return <span className="font-mono text-xs text-muted-foreground">{patientDid}</span>;
  return (
    <div className="flex flex-col text-left">
      <span className="font-medium text-sm text-foreground">{profile.firstName} {profile.lastName}</span>
      <span className="font-mono text-[10px] text-muted-foreground truncate max-w-[180px]">{patientDid}</span>
    </div>
  );
}

interface RosterEntry {
  patientDid: string;
  lastVisit: string;
  visits: number;
  types: string[];
}

// Derive unique patients from the doctor's own encounter history
function buildPatientRoster(encounters: Encounter[]): RosterEntry[] {
  const map = new Map<string, { patientDid: string; lastVisit: string; visits: number; typeSet: Set<string> }>();
  for (const enc of encounters) {
    const existing = map.get(enc.patientDid);
    if (!existing) {
      map.set(enc.patientDid, {
        patientDid: enc.patientDid,
        lastVisit: enc.encounterDate,
        visits: 1,
        typeSet: new Set([enc.encounterType]),
      });
    } else {
      existing.visits += 1;
      existing.typeSet.add(enc.encounterType);
      if (new Date(enc.encounterDate) > new Date(existing.lastVisit)) {
        existing.lastVisit = enc.encounterDate;
      }
    }
  }
  return Array.from(map.values())
    .sort((a, b) => new Date(b.lastVisit).getTime() - new Date(a.lastVisit).getTime())
    .map(({ typeSet, ...rest }) => ({ ...rest, types: Array.from(typeSet) }));
}

type RosterRow = RosterEntry & Record<string, unknown>;

export function DoctorMyPatients() {
  const { userDid, navigate, setActivePatientDid } = useAppStore();
  const { data: records, isLoading } = useProviderRecords(userDid);
  const [search, setSearch] = useState('');

  const roster = useMemo(() => buildPatientRoster(records?.encounters ?? []), [records]);

  const filtered = roster.filter(
    (r) =>
      !search ||
      r.patientDid.toLowerCase().includes(search.toLowerCase())
  ) as RosterRow[];

  // Stats
  const today = new Date().toDateString();
  const seenToday = (records?.encounters ?? []).filter(
    (e) => new Date(e.encounterDate).toDateString() === today
  ).map((e) => e.patientDid);
  const uniqueToday = new Set(seenToday).size;

  const columns: DataTableColumn<RosterRow>[] = [
    {
      header: 'Patient',
      accessor: (row) => (
        <div className="flex items-center gap-3">
          <Avatar className="size-8">
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
              {row.patientDid.slice(-2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <PatientNameCell patientDid={row.patientDid} />
        </div>
      ),
    },
    {
      header: 'Last Visit',
      accessor: (row) =>
        new Date(row.lastVisit).toLocaleDateString('en-US', {
          month: 'short', day: 'numeric', year: 'numeric',
        }),
      headerClassName: 'w-[160px]',
    },
    {
      header: 'Total Visits',
      accessor: (row) => (
        <Badge variant="outline" className="text-xs">
          {row.visits} visit{row.visits !== 1 ? 's' : ''}
        </Badge>
      ),
      headerClassName: 'w-[120px]',
    },
    {
      header: 'Visit Types',
      accessor: (row) => (
        <div className="flex flex-wrap gap-1">
          {(row.types as string[]).map((t) => (
            <Badge key={t} variant="secondary" className="text-xs capitalize">
              {t.toLowerCase()}
            </Badge>
          ))}
        </div>
      ),
      headerClassName: 'w-[200px]',
    },
    {
      header: '',
      accessor: (row) => (
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-xs gap-1"
          onClick={() => {
            setActivePatientDid(row.patientDid);
            navigate('doctor-patient-search');
          }}
        >
          View <ArrowRight className="size-3" />
        </Button>
      ),
      headerClassName: 'w-[100px]',
      cellClassName: 'text-right',
    },
  ];

  if (isLoading) {
    return (
      <PageContainer title="My Patients" subtitle="Your patient roster">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
        <Skeleton className="h-80 rounded-xl" />
      </PageContainer>
    );
  }

  return (
    <PageContainer title="My Patients" subtitle="Patients under your care">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard title="Total Patients" value={roster.length} accentColor="primary" />
        <StatCard title="Seen Today" value={uniqueToday} accentColor="emerald-accent" />
        <StatCard title="Total Encounters" value={records?.encounters?.length ?? 0} accentColor="amber-warm" />
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          placeholder="Search by patient DID…"
          className="pl-9 font-mono text-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      {filtered.length > 0 ? (
        <Card className="py-0">
          <CardContent className="p-0">
            <DataTable
              columns={columns}
              data={filtered}
              rowKey="patientDid"
              maxHeight="max-h-[600px]"
            />
          </CardContent>
        </Card>
      ) : (
        <Card className="py-0">
          <CardContent className="py-16 text-center">
            <Users className="size-10 mx-auto text-muted-foreground/40 mb-4" />
            <h3 className="text-base font-semibold mb-1">
              {roster.length === 0 ? 'No patient encounters yet' : 'No matching patients'}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {roster.length === 0
                ? 'Create a new visit to start building your patient roster.'
                : 'Try a different search term.'}
            </p>
            {roster.length === 0 && (
              <Button onClick={() => navigate('doctor-new-visit')}>Start New Visit</Button>
            )}
          </CardContent>
        </Card>
      )}
    </PageContainer>
  );
}
