'use client';

import { useState, useMemo } from 'react';
import {
  Printer, Download, FileText, Activity, Droplets, Heart,
  Thermometer, Wind, Scale, Loader2,
} from 'lucide-react';
import {
  Card, CardContent, CardHeader, CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Tabs, TabsList, TabsTrigger, TabsContent,
} from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';

import { PageContainer } from '@/components/ehr/page-container';
import { Timeline, type TimelineItem } from '@/components/ehr/timeline';
import { ChainBadge } from '@/components/ehr/chain-badge';
import { ChartCard } from '@/components/ehr/chart-card';
import { DataTable, type DataTableColumn } from '@/components/ehr/data-table';
import { usePatientRecords, useVitalsHistory } from '@/lib/hooks/use-records';
import { useMyPatientProfile } from '@/lib/hooks/use-patient';
import { useAppStore } from '@/lib/store';
import type { Encounter, Diagnosis, Prescription, Vitals } from '@/lib/api';

// ── Helpers ────────────────────────────────────────────────────
function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

// ── Sub-components ─────────────────────────────────────────────

function DiagnosisStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    ACTIVE:    'bg-amber-warm/10 text-amber-warm border-amber-warm/20',
    CHRONIC:   'bg-primary/10 text-primary border-primary/20',
    RESOLVED:  'bg-emerald-accent/10 text-emerald-accent border-emerald-accent/20',
    SUSPECTED: 'bg-muted text-muted-foreground',
  };
  return (
    <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${styles[status] ?? styles.ACTIVE}`}>
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </Badge>
  );
}

function VitalPill({ icon: Icon, label, value, unit }: { icon: React.ElementType; label: string; value: string; unit: string }) {
  return (
    <div className="flex items-center gap-2 rounded-md border bg-background px-2.5 py-1.5">
      <Icon className="size-3.5 text-muted-foreground shrink-0" />
      <div className="min-w-0">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wide leading-none">{label}</p>
        <p className="text-xs font-semibold text-foreground leading-tight">
          {value} <span className="font-normal text-muted-foreground">{unit}</span>
        </p>
      </div>
    </div>
  );
}

function EncounterCard({ encounter, diagnoses, prescriptions, vitals }: {
  encounter: Encounter;
  diagnoses: Diagnosis[];
  prescriptions: Prescription[];
  vitals: Vitals | null;
}) {
  const [expanded, setExpanded] = useState(false);
  const encDiagnoses = diagnoses.filter((d) => d.encounterId === encounter.id);
  const encPrescriptions = prescriptions.filter((p) => p.encounterId === encounter.id);

  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <Badge variant="secondary" className="text-xs capitalize">
              {encounter.encounterType.toLowerCase()}
            </Badge>
            <ChainBadge verified />
          </div>
          <p className="text-sm font-medium">{encounter.chiefComplaint ?? '—'}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {formatDateTime(encounter.encounterDate)}
          </p>
          <p className="font-mono text-[10px] text-muted-foreground mt-0.5 truncate">
            Provider: {encounter.providerDid}
          </p>
        </div>
        <Button variant="outline" size="sm" className="h-7 text-xs shrink-0" onClick={() => setExpanded(!expanded)}>
          {expanded ? 'Collapse' : 'Expand'}
        </Button>
      </div>

      {expanded && (
        <div className="mt-3 space-y-4 rounded-lg border bg-muted/30 p-4 animate-fade-in">
          {encounter.chiefComplaint && (
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/15">
              <p className="text-[11px] font-bold uppercase tracking-wider text-primary mb-1">Chief Complaint / Clinical Findings</p>
              <p className="text-xs text-foreground leading-relaxed">{encounter.chiefComplaint}</p>
            </div>
          )}
          {encounter.notes ? (
            <div className="p-3 rounded-lg bg-emerald-accent/5 border border-emerald-accent/15">
              <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-accent mb-1">Clinical Notes & Treatment Plan</p>
              <p className="text-xs text-foreground leading-relaxed whitespace-pre-wrap">{encounter.notes}</p>
            </div>
          ) : (
            !encounter.chiefComplaint && (
              <p className="text-xs text-muted-foreground italic">No detailed clinical notes recorded for this encounter.</p>
            )
          )}
          {encDiagnoses.length > 0 && (
            <div>
              <p className="text-xs font-semibold mb-2 uppercase tracking-wider">Diagnoses</p>
              <div className="space-y-1.5">
                {encDiagnoses.map((d) => (
                  <div key={d.id} className="flex items-center gap-2 flex-wrap">
                    {d.icd10Code && (
                      <Badge variant="outline" className="font-mono text-[10px] px-1.5 py-0 bg-muted/60">
                        {d.icd10Code}
                      </Badge>
                    )}
                    <span className="text-xs text-foreground">{d.description}</span>
                    <DiagnosisStatusBadge status={d.status} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {encPrescriptions.length > 0 && (
            <div>
              <p className="text-xs font-semibold mb-2 uppercase tracking-wider">Prescriptions</p>
              <div className="space-y-1.5">
                {encPrescriptions.map((rx) => (
                  <div key={rx.id} className="flex items-start gap-2">
                    <Badge variant="outline" className={`text-[10px] px-1.5 py-0 shrink-0 ${
                      !rx.dispensed
                        ? 'bg-emerald-accent/10 text-emerald-accent border-emerald-accent/20'
                        : 'bg-muted/60 text-muted-foreground'
                    }`}>
                      {!rx.dispensed ? 'Active' : 'Dispensed'}
                    </Badge>
                    <div className="min-w-0">
                      <span className="text-xs font-medium">{rx.drugName}</span>
                      <span className="text-xs text-muted-foreground ml-1">— {rx.dosage}, {rx.frequency}</span>
                      {rx.instructions && (
                        <p className="text-[11px] text-muted-foreground mt-0.5 leading-tight">{rx.instructions}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {vitals && (
            <div>
              <p className="text-xs font-semibold mb-2 uppercase tracking-wider">Vitals</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {vitals.bloodPressure && <VitalPill icon={Heart} label="BP" value={vitals.bloodPressure} unit="mmHg" />}
                {vitals.temperatureC && <VitalPill icon={Thermometer} label="Temp" value={String(vitals.temperatureC)} unit="°C" />}
                {vitals.pulseRate && <VitalPill icon={Activity} label="Pulse" value={String(vitals.pulseRate)} unit="bpm" />}
                {vitals.weightKg && <VitalPill icon={Scale} label="Weight" value={String(vitals.weightKg)} unit="kg" />}
                {vitals.oxygenSat && <VitalPill icon={Wind} label="O₂ Sat" value={String(vitals.oxygenSat)} unit="%" />}
                {vitals.bloodGlucose && <VitalPill icon={Droplets} label="Glucose" value={String(vitals.bloodGlucose)} unit="mg/dL" />}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}

function VitalsTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-card px-3 py-2 shadow-md">
      <p className="text-xs font-medium text-foreground mb-1">{label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2 text-xs">
          <span className="inline-block size-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-medium text-foreground">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────
export function PatientRecords() {
  const userDid = useAppStore((s) => s.userDid);
  const { data: profile, isLoading: profileLoading } = useMyPatientProfile();
  const { data: records, isLoading: recordsLoading } = usePatientRecords(userDid);
  const { data: vitalsHistory } = useVitalsHistory(userDid);

  const isLoading = profileLoading || recordsLoading;

  const encounters = (records?.encounters ?? []).sort(
    (a, b) => new Date(b.encounterDate).getTime() - new Date(a.encounterDate).getTime()
  );
  const diagnoses = records?.diagnoses ?? [];
  const prescriptions = records?.prescriptions ?? [];
  const vitals = records?.vitals ?? [];
  const documents = records?.documents ?? [];

  // Build a map of encounter vitals for quick lookup
  const vitalsMap = useMemo(() => {
    const map = new Map<string, Vitals>();
    for (const v of vitals) {
      if (!map.has(v.encounterId)) map.set(v.encounterId, v);
    }
    return map;
  }, [vitals]);

  // Build timeline items
  const timelineItems: TimelineItem[] = useMemo(() =>
    encounters.slice(0, 8).map((enc) => ({
      date: formatDate(enc.encounterDate),
      title: `${enc.encounterType.charAt(0) + enc.encounterType.slice(1).toLowerCase()} Visit`,
      description: enc.chiefComplaint ?? '',
      type: 'consultation' as const,
      verified: true,
    })), [encounters]);

  // Vitals chart data
  const chartData = useMemo(() =>
    (vitalsHistory ?? []).slice(-6).map((v) => {
      const [sys, dia] = (v.bloodPressure ?? '0/0').split('/').map(Number);
      return {
        month: new Date(v.recordedAt).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        bpSystolic: sys ?? 0,
        bpDiastolic: dia ?? 0,
        weight: v.weightKg ?? 0,
      };
    }), [vitalsHistory]);

  // Vitals table rows
  const vitalsTableRows = useMemo(() =>
    vitals.map((v) => ({
      date: formatDateTime(v.recordedAt),
      bp: v.bloodPressure ?? '—',
      temp: v.temperatureC ? `${v.temperatureC}°C` : '—',
      pulse: v.pulseRate ? `${v.pulseRate} bpm` : '—',
      weight: v.weightKg ? `${v.weightKg} kg` : '—',
      o2: v.oxygenSat ? `${v.oxygenSat}%` : '—',
      glucose: v.bloodGlucose ? `${v.bloodGlucose} mg/dL` : '—',
    })), [vitals]);

  const vitalsColumns: DataTableColumn<(typeof vitalsTableRows)[number] & Record<string, unknown>>[] = [
    { header: 'Date', accessor: 'date', headerClassName: 'w-[150px]' },
    { header: 'BP', accessor: 'bp' },
    { header: 'Temp', accessor: 'temp' },
    { header: 'Pulse', accessor: 'pulse' },
    { header: 'Weight', accessor: 'weight' },
    { header: 'O₂', accessor: 'o2' },
    { header: 'Glucose', accessor: 'glucose' },
  ];

  if (isLoading) {
    return (
      <PageContainer title="My Records" subtitle="Loading medical history…">
        <Skeleton className="h-28 rounded-xl mb-6" />
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
      </PageContainer>
    );
  }

  const patientName = profile ? `${profile.firstName} ${profile.lastName}` : 'Patient';

  return (
    <PageContainer
      title="My Records"
      subtitle="Complete medical history and health timeline"
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Printer className="size-4" /> Print
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="size-4" /> Export
          </Button>
          <ChainBadge verified />
        </div>
      }
    >
      {/* Patient Info Bar */}
      <Card className="mb-6">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-3 min-w-0">
              <h2 className="text-lg font-bold text-foreground">{patientName}</h2>
              <div className="flex flex-wrap items-center gap-2">
                {profile?.bloodGroup && (
                  <Badge className="bg-primary/10 text-primary border-primary/20 px-2.5 py-1 text-xs font-semibold">
                    <Droplets className="size-3 mr-1" /> {profile.bloodGroup}
                  </Badge>
                )}
                {profile?.gender && (
                  <Badge variant="outline" className="text-xs capitalize">{profile.gender.toLowerCase()}</Badge>
                )}
              </div>
              <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground">
                <span>{encounters.length} total visits</span>
                <span>{prescriptions.length} prescriptions</span>
                <span>{documents.length} documents</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="all">
        <TabsList className="mb-6 flex-wrap h-auto">
          <TabsTrigger value="all">All ({encounters.length})</TabsTrigger>
          <TabsTrigger value="diagnoses">Diagnoses ({diagnoses.length})</TabsTrigger>
          <TabsTrigger value="prescriptions">Prescriptions ({prescriptions.length})</TabsTrigger>
          <TabsTrigger value="vitals">Vitals ({vitals.length})</TabsTrigger>
        </TabsList>

        {/* All Encounters */}
        <TabsContent value="all">
          {encounters.length > 0 ? (
            <>
              {/* Timeline */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-sm font-semibold">Health Timeline</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <Timeline items={timelineItems} />
                </CardContent>
              </Card>

              {/* Encounter Cards */}
              <div className="space-y-3">
                {encounters.map((enc) => (
                  <EncounterCard
                    key={enc.id}
                    encounter={enc}
                    diagnoses={diagnoses}
                    prescriptions={prescriptions}
                    vitals={vitalsMap.get(enc.id) ?? null}
                  />
                ))}
              </div>
            </>
          ) : (
            <Card className="py-0">
              <CardContent className="py-16 text-center">
                <FileText className="size-10 mx-auto text-muted-foreground/40 mb-4" />
                <h3 className="text-base font-semibold mb-1">No records yet</h3>
                <p className="text-sm text-muted-foreground">
                  Your medical records will appear here after your first clinical visit.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Diagnoses */}
        <TabsContent value="diagnoses">
          {diagnoses.length > 0 ? (
            <div className="space-y-3">
              {diagnoses.map((d) => (
                <div key={d.id} className="flex items-start gap-3 rounded-lg border bg-card p-4">
                  {d.icd10Code && (
                    <Badge variant="outline" className="font-mono text-xs px-2 py-0.5 bg-muted/60 shrink-0">
                      {d.icd10Code}
                    </Badge>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium">{d.description}</span>
                      <DiagnosisStatusBadge status={d.status} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{formatDateTime(d.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="size-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm">No diagnoses recorded</p>
            </div>
          )}
        </TabsContent>

        {/* Prescriptions */}
        <TabsContent value="prescriptions">
          {prescriptions.length > 0 ? (
            <div className="space-y-3">
              {prescriptions.map((rx) => (
                <div key={rx.id} className="flex items-start gap-3 rounded-lg border bg-card p-4">
                  <Badge
                    variant="outline"
                    className={`text-[10px] px-1.5 py-0 shrink-0 ${
                      !rx.dispensed
                        ? 'bg-emerald-accent/10 text-emerald-accent border-emerald-accent/20'
                        : 'bg-muted/60 text-muted-foreground'
                    }`}
                  >
                    {!rx.dispensed ? 'Active' : 'Dispensed'}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{rx.drugName}</p>
                    {rx.genericName && <p className="text-xs text-muted-foreground">{rx.genericName}</p>}
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {rx.dosage} · {rx.frequency} · {rx.durationDays} days
                    </p>
                    {rx.instructions && (
                      <p className="text-xs text-muted-foreground mt-1 italic">{rx.instructions}</p>
                    )}
                    <p className="text-[11px] text-muted-foreground mt-1">
                      {formatDateTime(rx.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="size-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm">No prescriptions recorded</p>
            </div>
          )}
        </TabsContent>

        {/* Vitals */}
        <TabsContent value="vitals">
          {vitals.length > 0 ? (
            <div className="space-y-6">
              {chartData.length > 1 && (
                <ChartCard title="Vitals Trends" subtitle="Blood pressure over time">
                  <div className="h-[260px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="oklch(0.908 0.015 80)" />
                        <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} tick={{ fontSize: 11 }} />
                        <YAxis tickLine={false} axisLine={false} tickMargin={8} tick={{ fontSize: 11 }} />
                        <Tooltip content={<VitalsTooltip />} />
                        <Legend wrapperStyle={{ fontSize: 12 }} iconType="circle" iconSize={8} />
                        <Line type="monotone" dataKey="bpSystolic" name="BP Systolic" stroke="oklch(0.535 0.115 30)" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                        <Line type="monotone" dataKey="weight" name="Weight (kg)" stroke="oklch(0.488 0.14 165)" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </ChartCard>
              )}
              <Card className="py-0">
                <CardContent className="p-0">
                  <DataTable
                    columns={vitalsColumns}
                    data={vitalsTableRows as ((typeof vitalsTableRows)[number] & Record<string, unknown>)[]}
                    rowKey="date"
                    maxHeight="max-h-[400px]"
                  />
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Activity className="size-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm">No vitals recorded yet</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
