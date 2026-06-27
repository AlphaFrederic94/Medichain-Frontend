'use client';

import React, { useState } from 'react';
import { PageContainer } from '@/components/ehr/page-container';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Users, Search, UserCheck, UserPlus, Phone, MapPin, Building2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAllPatients, useAssignDoctor } from '@/lib/hooks/use-patient';
import { useAllStaff } from '@/lib/hooks/use-provider';

export function AdminPatients() {
  const { data: patients, isLoading: patientsLoading } = useAllPatients();
  const { data: staffList, isLoading: staffLoading } = useAllStaff();
  const { mutateAsync: assignDoctor, isPending: assigning } = useAssignDoctor();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);
  const [selectedDoctorDid, setSelectedDoctorDid] = useState('');

  const doctors = (staffList ?? []).filter((s: any) => s.role === 'DOCTOR' || s.specialty);

  const filteredPatients = (patients ?? []).filter((p: any) => {
    const term = searchTerm.toLowerCase();
    const fullName = `${p.firstName} ${p.lastName}`.toLowerCase();
    return fullName.includes(term) || (p.phone && p.phone.includes(term)) || (p.userDid && p.userDid.toLowerCase().includes(term));
  });

  const handleOpenAssign = (patient: any) => {
    setSelectedPatient(patient);
    setSelectedDoctorDid(patient.assignedDoctorDid || '');
  };

  const handleSaveAssignment = async () => {
    if (!selectedPatient || !selectedDoctorDid) return;
    const doc = doctors.find((d: any) => d.userDid === selectedDoctorDid);
    const docName = doc ? `Dr. ${doc.firstName} ${doc.lastName}` : 'Assigned Doctor';
    
    await assignDoctor({
      did: selectedPatient.userDid,
      assignedDoctorDid: selectedDoctorDid,
      assignedDoctorName: docName,
    });
    setSelectedPatient(null);
  };

  if (patientsLoading || staffLoading) {
    return (
      <PageContainer title="Patients & Assignment" subtitle="Supervise registered patients and assign clinical providers">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="Patients & Assignment"
      subtitle="Supervise registered patients and manage primary clinical doctor assignments across MediChain facilities"
    >
      {/* Search Bar */}
      <Card className="mb-6 border-border/60 shadow-sm">
        <CardContent className="p-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <Input
              placeholder="Search patients by name, phone, or DID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-10 w-full"
            />
          </div>
          <Badge variant="outline" className="text-xs px-3 py-1.5 bg-primary/5 text-primary border-primary/20 flex items-center gap-1.5">
            <Users className="size-3.5" /> Total Patients: {patients?.length ?? 0}
          </Badge>
        </CardContent>
      </Card>

      {/* Patient Grid / List */}
      {filteredPatients.length === 0 ? (
        <Card className="p-12 text-center border-dashed">
          <AlertCircle className="size-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-base font-semibold text-foreground">No patients found</p>
          <p className="text-xs text-muted-foreground">Try adjusting your search filters.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
          {filteredPatients.map((p: any) => (
            <Card key={p.id || p.userDid} className="hover:shadow-md transition-all border-border/60 bg-card">
              <CardContent className="p-5 flex flex-col justify-between h-full">
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="size-11 rounded-full bg-terra/10 text-terra flex items-center justify-center font-bold text-base">
                        {p.firstName?.[0]}{p.lastName?.[0]}
                      </div>
                      <div>
                        <h3 className="font-semibold text-base text-foreground flex items-center gap-2">
                          {p.firstName} {p.lastName}
                        </h3>
                        <p className="text-xs text-muted-foreground font-mono truncate max-w-[200px]" title={p.userDid}>
                          {p.userDid}
                        </p>
                      </div>
                    </div>
                    {p.bloodGroup && (
                      <Badge className="bg-amber-warm/10 text-amber-warm border-amber-warm/20 font-bold text-xs">
                        {p.bloodGroup}
                      </Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 my-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Phone className="size-3.5 text-primary" />
                      <span>{p.phone || 'No phone'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="size-3.5 text-primary" />
                      <span>{p.city || p.address || 'Lagos, NG'}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-border/50 mt-2 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-muted-foreground block font-medium">Assigned Doctor</span>
                    {p.assignedDoctorName ? (
                      <span className="text-xs font-semibold text-emerald-accent flex items-center gap-1 mt-0.5">
                        <CheckCircle2 className="size-3.5" /> {p.assignedDoctorName}
                      </span>
                    ) : (
                      <span className="text-xs text-amber-warm font-medium flex items-center gap-1 mt-0.5">
                        <AlertCircle className="size-3.5" /> Unassigned
                      </span>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenAssign(p)}
                    className="text-xs h-8 border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground gap-1.5"
                  >
                    <UserPlus className="size-3.5" /> Assign Doctor
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Assign Doctor Dialog */}
      <Dialog open={!!selectedPatient} onOpenChange={(open) => !open && setSelectedPatient(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <UserCheck className="size-5 text-primary" /> Assign Primary Doctor
            </DialogTitle>
            <DialogDescription className="text-xs">
              Assign or reassign a primary supervising physician for <strong>{selectedPatient?.firstName} {selectedPatient?.lastName}</strong>.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-xs font-medium">Select Doctor / Facility Provider</Label>
              <select
                value={selectedDoctorDid}
                onChange={(e) => setSelectedDoctorDid(e.target.value)}
                className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">-- Choose a doctor --</option>
                {doctors.map((d: any) => (
                  <option key={d.userDid} value={d.userDid}>
                    Dr. {d.firstName} {d.lastName} ({d.specialty || 'General Practice'})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" size="sm" onClick={() => setSelectedPatient(null)}>Cancel</Button>
            <Button size="sm" onClick={handleSaveAssignment} disabled={!selectedDoctorDid || assigning} className="bg-primary text-primary-foreground">
              {assigning ? 'Saving...' : 'Confirm Assignment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
