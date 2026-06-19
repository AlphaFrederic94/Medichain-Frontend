'use client';

import { PageContainer } from '@/components/ehr/page-container';
import { StatCard } from '@/components/ehr/stat-card';
import { ChartCard } from '@/components/ehr/chart-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { Building2, Activity, MapPin, Users, Stethoscope, FileText } from 'lucide-react';
import { useRecordsAnalytics } from '@/lib/hooks/use-records';
import { usePatientAnalytics } from '@/lib/hooks/use-patient';
import { useProviderAnalytics } from '@/lib/hooks/use-provider';
import { useFacilities } from '@/lib/hooks/use-provider';

const PIE_COLORS = [
  'oklch(0.535 0.115 30)',
  'oklch(0.488 0.14 165)',
  'oklch(0.75 0.15 70)',
  'oklch(0.55 0.1 250)',
  'oklch(0.6 0.012 80)',
];

function CustomTooltip({ active, payload, label }: {
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

export function AdminDashboard() {
  const { data: recordsStats, isLoading: recordsLoading } = useRecordsAnalytics();
  const { data: patientStats, isLoading: patientLoading } = usePatientAnalytics();
  const { data: providerStats, isLoading: providerLoading } = useProviderAnalytics();
  const { data: facilities, isLoading: facilitiesLoading } = useFacilities();

  const isLoading = recordsLoading || patientLoading || providerLoading;

  if (isLoading) {
    return (
      <PageContainer title="Ministry Dashboard" subtitle="Loading analytics…">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80 rounded-xl" />
          <Skeleton className="h-80 rounded-xl" />
        </div>
      </PageContainer>
    );
  }

  const registrationData = patientStats?.registrationsOverTime ?? [];
  const encounterData = recordsStats?.encountersOverTime ?? [];
  const topDiagnoses = recordsStats?.topDiagnoses ?? [];
  const facilityTypes = providerStats?.facilityTypeBreakdown ?? [];
  const visitTypes = recordsStats?.visitTypeBreakdown ?? [];

  return (
    <PageContainer
      title="Ministry Dashboard"
      subtitle="Pan-African health intelligence overview"
    >
      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Registered Patients"
          value={(patientStats?.totalPatients ?? 0).toLocaleString()}
          trend="up"
          trendPercentage="+12%"
          accentColor="primary"
        />
        <StatCard
          title="Active Facilities"
          value={(providerStats?.totalFacilities ?? 0).toLocaleString()}
          trend="up"
          trendPercentage="+5%"
          accentColor="emerald-accent"
        />
        <StatCard
          title="Records Anchored Today"
          value={(recordsStats?.encountersToday ?? 0).toLocaleString()}
          trend="up"
          trendPercentage="+18%"
          accentColor="amber-warm"
        />
        <StatCard
          title="Total Clinical Staff"
          value={(providerStats?.totalStaff ?? 0).toLocaleString()}
          trend="neutral"
          trendPercentage="0"
          accentColor="primary"
        />
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Card className="py-0 animate-fade-in">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Stethoscope className="size-5 text-primary" />
            </div>
            <div>
              <p className="text-xl font-bold">{(recordsStats?.totalEncounters ?? 0).toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Total Encounters</p>
            </div>
          </CardContent>
        </Card>
        <Card className="py-0 animate-fade-in">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-accent/10 flex items-center justify-center shrink-0">
              <FileText className="size-5 text-emerald-accent" />
            </div>
            <div>
              <p className="text-xl font-bold">{(recordsStats?.totalPrescriptions ?? 0).toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Prescriptions Issued</p>
            </div>
          </CardContent>
        </Card>
        <Card className="py-0 animate-fade-in">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-warm/10 flex items-center justify-center shrink-0">
              <Users className="size-5 text-amber-warm" />
            </div>
            <div>
              <p className="text-xl font-bold">{(recordsStats?.totalDiagnoses ?? 0).toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Diagnoses Recorded</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <ChartCard title="Patient Registrations Over Time" subtitle="Monthly new patient registrations">
          <div className="h-[280px] w-full">
            {registrationData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={registrationData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="oklch(0.908 0.015 80)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickMargin={8} />
                  <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickMargin={8} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="count"
                    name="Registrations"
                    stroke="oklch(0.535 0.115 30)"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: 'oklch(0.535 0.115 30)' }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                No registration data yet
              </div>
            )}
          </div>
        </ChartCard>

        <ChartCard title="Encounters Over Time" subtitle="Monthly clinical encounters">
          <div className="h-[280px] w-full">
            {encounterData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={encounterData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="oklch(0.908 0.015 80)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickMargin={8} />
                  <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickMargin={8} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="count"
                    name="Encounters"
                    stroke="oklch(0.488 0.14 165)"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: 'oklch(0.488 0.14 165)' }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                No encounter data yet
              </div>
            )}
          </div>
        </ChartCard>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <ChartCard title="Top Diagnoses" subtitle="Most frequent diagnoses across all facilities">
          <div className="h-[280px] w-full overflow-hidden">
            {topDiagnoses.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topDiagnoses} margin={{ top: 10, right: 10, left: -10, bottom: 0 }} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="oklch(0.908 0.015 80)" />
                  <XAxis type="number" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} width={110} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" name="Cases" fill="oklch(0.535 0.115 30)" radius={[0, 4, 4, 0]} maxBarSize={28} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                No diagnoses data yet
              </div>
            )}
          </div>
        </ChartCard>

        <ChartCard title="Facility Type Distribution" subtitle="Breakdown by facility category">
          <div className="h-[280px] w-full">
            {facilityTypes.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={facilityTypes}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={95}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="oklch(0.995 0.001 80)"
                    strokeWidth={2}
                  >
                    {facilityTypes.map((_, index) => (
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
                No facility data yet
              </div>
            )}
          </div>
        </ChartCard>
      </div>

      {/* Facilities list + Visit types */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary" /> Registered Facilities
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {facilitiesLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-lg" />)}
              </div>
            ) : (facilities ?? []).length > 0 ? (
              <div className="space-y-3 max-h-[320px] overflow-y-auto">
                {(facilities ?? []).map((f) => (
                  <div key={f.id} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/30 transition-colors">
                    <div>
                      <p className="text-sm font-medium">{f.name}</p>
                      <p className="text-xs text-muted-foreground">{f.city}, {f.country}</p>
                    </div>
                    <Badge variant="outline" className="text-xs capitalize">
                      {f.facilityType.toLowerCase().replace('_', ' ')}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No facilities registered yet</p>
            )}
          </CardContent>
        </Card>

        <ChartCard title="Visit Type Breakdown" subtitle="Distribution of encounter types across all facilities">
          <div className="h-[320px] w-full">
            {visitTypes.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={visitTypes} margin={{ top: 8, right: 16, left: 0, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="oklch(0.908 0.015 80)" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" name="Encounters" fill="oklch(0.488 0.14 165)" radius={[4, 4, 0, 0]} maxBarSize={48} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                No encounter data yet
              </div>
            )}
          </div>
        </ChartCard>
      </div>
    </PageContainer>
  );
}
