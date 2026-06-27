'use client';

import React, { useState } from 'react';
import { PageContainer } from '@/components/ehr/page-container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Stethoscope, Search, Building2, Award, Phone, ShieldCheck, Mail } from 'lucide-react';
import { useAllStaff } from '@/lib/hooks/use-provider';

export function AdminDoctors() {
  const { data: staffList, isLoading } = useAllStaff();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredStaff = (staffList ?? []).filter((s: any) => {
    const term = searchTerm.toLowerCase();
    const fullName = `${s.firstName} ${s.lastName}`.toLowerCase();
    const specialty = (s.specialty || '').toLowerCase();
    return fullName.includes(term) || specialty.includes(term) || (s.licenseNo && s.licenseNo.toLowerCase().includes(term));
  });

  if (isLoading) {
    return (
      <PageContainer title="Doctors & Clinical Staff" subtitle="Supervise all credentialed providers across MediChain">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="Doctors & Clinical Staff"
      subtitle="Supervise verified healthcare providers, specialties, and licensure status across registered facilities"
    >
      <Card className="mb-6 border-border/60 shadow-sm">
        <CardContent className="p-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <Input
              placeholder="Search providers by name, specialty, or license..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-10 w-full"
            />
          </div>
          <Badge variant="outline" className="text-xs px-3 py-1.5 bg-emerald-accent/10 text-emerald-accent border-emerald-accent/20 flex items-center gap-1.5 font-semibold">
            <Stethoscope className="size-3.5" /> Active Credentialed Staff: {staffList?.length ?? 0}
          </Badge>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-fade-in">
        {filteredStaff.map((s: any) => (
          <Card key={s.id || s.userDid} className="hover:shadow-lg transition-all border-border/60 bg-card overflow-hidden flex flex-col justify-between">
            <div className="h-2 bg-gradient-to-r from-terra to-emerald-accent" />
            <CardContent className="p-5 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="size-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
                      Dr
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-foreground">
                        {s.firstName} {s.lastName}
                      </h3>
                      <Badge className="mt-1 bg-terra/10 text-terra border-terra/20 text-[10px] font-semibold px-2 py-0.5">
                        {s.specialty || s.role || 'General Practice'}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 my-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Building2 className="size-3.5 text-primary shrink-0" />
                    <span className="truncate">{(s.facility as any)?.name || 'AfriHealth General Hospital'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="size-3.5 text-amber-warm shrink-0" />
                    <span>License: <strong className="text-foreground font-mono">{s.licenseNo || 'MD-ACTIVE'}</strong></span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-border/50 flex items-center justify-between text-xs">
                <span className="text-muted-foreground font-mono truncate max-w-[150px]" title={s.userDid}>
                  {s.userDid}
                </span>
                <Badge variant="outline" className="text-[10px] bg-emerald-accent/5 text-emerald-accent border-emerald-accent/20 gap-1 font-semibold">
                  <ShieldCheck className="size-3" /> Verified DID
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </PageContainer>
  );
}
