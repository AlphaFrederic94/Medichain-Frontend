'use client';

import { PageContainer } from '@/components/ehr/page-container';
import { StatCard } from '@/components/ehr/stat-card';
import { DataTable, type DataTableColumn } from '@/components/ehr/data-table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  Building2, MapPin, Phone, Mail, CheckCircle2, XCircle,
  Stethoscope, Users,
} from 'lucide-react';
import { useMyProviderProfile, useFacility, useFacilities } from '@/lib/hooks/use-provider';
import type { Staff, Facility } from '@/lib/api';

type FacilityRow = Facility & Record<string, unknown>;

function FacilityInfoCard({ facility }: { facility: Facility }) {
  const typeLabel: Record<string, string> = {
    HOSPITAL: 'Hospital',
    CLINIC: 'Clinic',
    PHARMACY: 'Pharmacy',
    LABORATORY: 'Laboratory',
    HEALTH_CENTER: 'Health Center',
  };

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Building2 className="size-7 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold">{facility.name}</h2>
            <div className="flex flex-wrap gap-2 mt-1">
              <Badge variant="secondary" className="text-xs">
                {typeLabel[facility.facilityType] ?? facility.facilityType}
              </Badge>
              <Badge
                className={
                  facility.active
                    ? 'bg-emerald-accent/10 text-emerald-accent border-emerald-accent/20 text-xs'
                    : 'bg-destructive/10 text-destructive text-xs'
                }
              >
                {facility.active ? (
                  <><CheckCircle2 className="size-3 mr-1" /> Active</>
                ) : (
                  <><XCircle className="size-3 mr-1" /> Inactive</>
                )}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-4">
        <Separator />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          {(facility.address || facility.city) && (
            <div className="flex items-start gap-2 text-muted-foreground">
              <MapPin className="size-4 mt-0.5 shrink-0 text-primary" />
              <span>
                {[facility.address, facility.city, facility.country].filter(Boolean).join(', ')}
              </span>
            </div>
          )}
          {facility.phone && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="size-4 shrink-0 text-primary" />
              <span>{facility.phone}</span>
            </div>
          )}
          {facility.email && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="size-4 shrink-0 text-primary" />
              <span>{facility.email}</span>
            </div>
          )}
          {facility.registrationNo && (
            <div className="text-muted-foreground">
              <span className="font-medium text-foreground">Reg. No: </span>
              {facility.registrationNo}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function DoctorFacility() {
  const { data: providerProfile, isLoading: profileLoading } = useMyProviderProfile();
  const facilityId = providerProfile?.facilityId ?? null;
  const { data: facility, isLoading: facilityLoading } = useFacility(facilityId);
  const { data: allFacilities, isLoading: facilitiesLoading } = useFacilities();

  const isLoading = profileLoading || facilityLoading;

  const facilityColumns: DataTableColumn<FacilityRow>[] = [
    {
      header: 'Name',
      accessor: (row) => (
        <div>
          <p className="font-semibold text-sm">{(row as Facility).name}</p>
          <p className="text-xs text-muted-foreground">{(row as Facility).city}, {(row as Facility).country}</p>
        </div>
      ),
    },
    {
      header: 'Type',
      accessor: (row) => {
        const typeLabel: Record<string, string> = {
          HOSPITAL: 'Hospital', CLINIC: 'Clinic', PHARMACY: 'Pharmacy',
          LABORATORY: 'Lab', HEALTH_CENTER: 'Health Center',
        };
        return (
          <Badge variant="secondary" className="text-xs">
            {typeLabel[(row as Facility).facilityType] ?? (row as Facility).facilityType}
          </Badge>
        );
      },
      headerClassName: 'w-[140px]',
    },
    {
      header: 'Status',
      accessor: (row) => (
        <Badge
          className={
            (row as Facility).active
              ? 'bg-emerald-accent/10 text-emerald-accent border-emerald-accent/20 text-xs'
              : 'bg-muted text-muted-foreground text-xs'
          }
        >
          {(row as Facility).active ? 'Active' : 'Inactive'}
        </Badge>
      ),
      headerClassName: 'w-[100px]',
    },
  ];

  if (isLoading) {
    return (
      <PageContainer title="Facility" subtitle="Your facility information">
        <Skeleton className="h-48 rounded-xl mb-6" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="Facility"
      subtitle={facility ? `You are affiliated with ${facility.name}` : 'Your facility overview'}
    >
      {/* My Facility */}
      {facility ? (
        <>
          <FacilityInfoCard facility={facility} />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 mb-8">
            <StatCard
              title="My Role"
              value={providerProfile?.role?.replace('_', ' ') ?? '—'}
              accentColor="primary"
            />
            <StatCard
              title="Specialty"
              value={providerProfile?.specialty ?? '—'}
              accentColor="emerald-accent"
            />
            <StatCard
              title="Account Verified"
              value={providerProfile?.verified ? 'Verified' : 'Pending'}
              accentColor={providerProfile?.verified ? 'emerald-accent' : 'amber-warm'}
            />
          </div>
        </>
      ) : (
        <Card className="mb-6 animate-fade-in">
          <CardContent className="py-12 text-center">
            <Building2 className="size-10 mx-auto text-muted-foreground/40 mb-4" />
            <h3 className="text-base font-semibold mb-1">No facility assigned</h3>
            <p className="text-sm text-muted-foreground">
              Contact your facility administrator to assign you to a facility.
            </p>
          </CardContent>
        </Card>
      )}

      {/* All Facilities in the network */}
      <Card className="animate-fade-in">
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Building2 className="size-4 text-primary" />
            MediChain Network Facilities
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {facilitiesLoading ? (
            <div className="p-6"><Skeleton className="h-48 rounded-lg" /></div>
          ) : (allFacilities ?? []).length > 0 ? (
            <DataTable
              columns={facilityColumns}
              data={(allFacilities ?? []) as FacilityRow[]}
              rowKey="id"
              maxHeight="max-h-[480px]"
            />
          ) : (
            <div className="py-10 text-center text-muted-foreground">
              <p className="text-sm">No facilities found in the network</p>
            </div>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  );
}
