'use client';

import {
  Share2,
  Droplets,
  AlertTriangle,
  Heart,
  Calendar,
  ArrowRight,
  Plus,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

import { PageContainer } from '@/components/ehr/page-container';
import { StatCard } from '@/components/ehr/stat-card';
import { ChainBadge } from '@/components/ehr/chain-badge';
import { Timeline, type TimelineItem } from '@/components/ehr/timeline';
import { ConsentCard } from '@/components/ehr/consent-card';
import { ChartCard } from '@/components/ehr/chart-card';
import { useMyPatientProfile, useMyAllergies } from '@/lib/hooks/use-patient';
import { usePatientRecords, useVitalsHistory } from '@/lib/hooks/use-records';
import { useAppStore } from '@/lib/store';
import type { Vitals } from '@/lib/api';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function vitalsToChartPoint(v: Vitals) {
  const date = new Date(v.recordedAt);
  const label = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
  const [sys, dia] = (v.bloodPressure ?? '0/0').split('/').map(Number);
  return {
    month: label,
    bpSystolic: sys || 0,
    bpDiastolic: dia || 0,
    weight: v.weightKg ?? 0,
  };
}

function VitalsTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) {
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

// ─── Component ───────────────────────────────────────────────────────────────

export function PatientDashboard() {
  const userDid = useAppStore((s) => s.userDid);
  const navigate = useAppStore((s) => s.navigate);

  const { data: profile, isLoading: profileLoading } = useMyPatientProfile();
  const { data: records, isLoading: recordsLoading } = usePatientRecords(userDid);
  const { data: vitalsHistory } = useVitalsHistory(userDid);
  const { data: allergies } = useMyAllergies();

  // Compute stats directly from records (patient summary endpoint doesn't include these)
  const totalVisits = records?.encounters?.length ?? 0;
  const activePrescriptions = (records?.prescriptions ?? []).filter((p) => !p.dispensed).length;
  const documentsCount = records?.documents?.length ?? 0;

  const isLoading = profileLoading || recordsLoading;

  const chartData = (vitalsHistory ?? []).map(vitalsToChartPoint).slice(-6);

  const timelineItems: TimelineItem[] = (records?.encounters ?? [])
    .slice(0, 5)
    .map((enc) => ({
      date: new Date(enc.encounterDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }),
      title: enc.encounterType.charAt(0) + enc.encounterType.slice(1).toLowerCase(),
      description: enc.chiefComplaint ?? '',
      type: 'consultation' as const,
      verified: true,
    }));

  const allergyNames = (allergies ?? []).map((a) => a.substance);
  const chronicConditions = (records?.diagnoses ?? [])
    .filter((d) => d.status === 'CHRONIC')
    .map((d) => d.description);

  if (isLoading) {
    return (
      <PageContainer title="Patient Dashboard" subtitle="Loading your health data…">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-40 rounded-xl mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <Skeleton className="lg:col-span-3 h-80 rounded-xl" />
          <Skeleton className="lg:col-span-2 h-80 rounded-xl" />
        </div>
      </PageContainer>
    );
  }

  const patientName = profile
    ? `${profile.firstName} ${profile.lastName}`
    : 'Patient';

  return (
    <PageContainer
      title="Patient Dashboard"
      subtitle={`Welcome back, ${patientName}`}
      actions={
        <>
          <Button variant="outline" size="sm" className="gap-2">
            <Share2 className="size-4" />
            Share My Records
          </Button>
          <ChainBadge verified={true} />
        </>
      }
    >
      {/* ── Stats Row ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatCard
          title="Total Visits"
          value={totalVisits}
          trend={totalVisits > 0 ? 'up' : 'neutral'}
          trendPercentage={totalVisits > 0 ? `${totalVisits} visit${totalVisits !== 1 ? 's' : ''}` : '0'}
          accentColor="primary"
        />
        <StatCard
          title="Active Prescriptions"
          value={activePrescriptions}
          trend="neutral"
          trendPercentage="0"
          accentColor="emerald-accent"
        />
        <StatCard
          title="Medical Documents"
          value={documentsCount}
          trend="neutral"
          trendPercentage="0"
          accentColor="amber-warm"
        />
        <StatCard
          title="Known Allergies"
          value={(allergies ?? []).length}
          trend="neutral"
          trendPercentage="0"
          accentColor="primary"
        />
      </div>

      {/* ── Health Summary Card ──────────────────────────────────────────── */}
      <Card className="mb-6 animate-fade-in">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Health Summary</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            {profile?.bloodGroup && (
              <>
                <Badge className="gap-1.5 bg-primary/10 text-primary border-primary/20 hover:bg-primary/15 px-3 py-1 text-sm font-semibold">
                  <Droplets className="size-3.5" />
                  {profile.bloodGroup}
                </Badge>
                <Separator orientation="vertical" className="h-6" />
              </>
            )}

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground mr-1">Allergies:</span>
              {allergyNames.length > 0 ? (
                allergyNames.map((a) => (
                  <Badge
                    key={a}
                    variant="outline"
                    className="bg-destructive/8 text-destructive border-destructive/20 text-xs px-2.5 py-0.5"
                  >
                    <AlertTriangle className="size-3 mr-1" />
                    {a}
                  </Badge>
                ))
              ) : (
                <span className="text-xs text-muted-foreground">None on record</span>
              )}
            </div>

            {chronicConditions.length > 0 && (
              <>
                <Separator orientation="vertical" className="h-6" />
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground mr-1">Conditions:</span>
                  {chronicConditions.map((c) => (
                    <Badge
                      key={c}
                      variant="outline"
                      className="bg-amber-warm/10 text-amber-warm border-amber-warm/20 text-xs px-2.5 py-0.5"
                    >
                      <Heart className="size-3 mr-1" />
                      {c}
                    </Badge>
                  ))}
                </div>
              </>
            )}
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="size-4" />
              <span>
                Last updated:{' '}
                <span className="font-medium text-foreground">
                  {profile
                    ? new Date(profile.updatedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })
                    : '—'}
                </span>
              </span>
            </div>
            <Button
              variant="link"
              size="sm"
              className="gap-1.5 text-primary p-0 h-auto"
              onClick={() => navigate('patient-records')}
            >
              View Full Records
              <ArrowRight className="size-3.5" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── Two-Column Layout ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
        {/* Left column — Recent Activity Timeline */}
        <div className="lg:col-span-3">
          <Card className="h-full animate-fade-in">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {timelineItems.length > 0 ? (
                <Timeline items={timelineItems} />
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                  <Loader2 className="size-6 mb-2 opacity-30" />
                  <p className="text-sm">No visit history yet</p>
                </div>
              )}
              <div className="mt-6 flex justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 text-primary border-primary/30 hover:bg-primary/5"
                  onClick={() => navigate('patient-records')}
                >
                  View All Records
                  <ArrowRight className="size-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column — Active Consents */}
        <div className="lg:col-span-2">
          <Card className="h-full animate-fade-in">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Active Consents</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                <p className="text-sm text-muted-foreground text-center py-6">
                  Consent data is managed via your blockchain profile.
                </p>
              </div>
              <Separator className="my-4" />
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-2 text-primary border-primary/30 hover:bg-primary/5"
                onClick={() => navigate('patient-consents')}
              >
                <Plus className="size-4" />
                Manage Consents
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── Vitals Chart ────────────────────────────────────────────────── */}
      {chartData.length > 0 ? (
        <ChartCard
          title="Vitals Trends"
          subtitle="Blood pressure over time"
          action={
            <Badge variant="outline" className="text-xs text-muted-foreground">
              Last {chartData.length} records
            </Badge>
          }
        >
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="oklch(0.908 0.015 80)" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} tick={{ fontSize: 11 }} />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} tick={{ fontSize: 11 }} />
                <Tooltip content={<VitalsTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12 }} iconType="circle" iconSize={8} />
                <Line
                  type="monotone"
                  dataKey="bpSystolic"
                  name="BP Systolic"
                  stroke="oklch(0.535 0.115 30)"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: 'oklch(0.535 0.115 30)' }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="weight"
                  name="Weight (kg)"
                  stroke="oklch(0.488 0.14 165)"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: 'oklch(0.488 0.14 165)' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      ) : (
        <Card className="animate-fade-in">
          <CardContent className="py-10 text-center text-muted-foreground">
            <p className="text-sm">No vitals recorded yet. Vitals data will appear here after your first visit.</p>
          </CardContent>
        </Card>
      )}
    </PageContainer>
  );
}
