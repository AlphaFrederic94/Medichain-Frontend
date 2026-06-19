'use client';

import { useState } from 'react';
import { PageContainer } from '@/components/ehr/page-container';
import { ChainBadge } from '@/components/ehr/chain-badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Search, QrCode, Loader2, UserRound, Droplets, MapPin, Phone,
  AlertTriangle, FileText, Pill,
} from 'lucide-react';
import { useSearchPatients, usePatientByDid } from '@/lib/hooks/use-patient';
import { usePatientRecords } from '@/lib/hooks/use-records';
import type { PatientSearchResult } from '@/lib/api';

function PatientDetail({ patient }: { patient: PatientSearchResult }) {
  const { data: profile } = usePatientByDid(patient.userDid);
  const { data: records, isLoading } = usePatientRecords(patient.userDid);

  const recentEncounters = (records?.encounters ?? []).slice(0, 3);
  const activePrescriptions = (records?.prescriptions ?? []).filter((p) => !p.dispensed);

  return (
    <div className="mt-6 animate-fade-in space-y-6">
      {/* Patient card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-4">
            <Avatar className="size-14">
              <AvatarFallback className="bg-primary/10 text-primary text-lg font-bold">
                {patient.firstName?.[0]}{patient.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold">{patient.firstName} {patient.lastName}</h2>
              <p className="font-mono text-xs text-muted-foreground truncate">{patient.userDid}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {patient.bloodGroup && (
                  <Badge className="bg-primary/10 text-primary border-primary/20 gap-1">
                    <Droplets className="size-3" /> {patient.bloodGroup}
                  </Badge>
                )}
                {patient.gender && (
                  <Badge variant="outline" className="text-xs capitalize">{patient.gender.toLowerCase()}</Badge>
                )}
                {patient.city && (
                  <Badge variant="outline" className="text-xs gap-1">
                    <MapPin className="size-3" /> {patient.city}
                  </Badge>
                )}
                {patient.phone && (
                  <Badge variant="outline" className="text-xs gap-1">
                    <Phone className="size-3" /> {patient.phone}
                  </Badge>
                )}
              </div>
            </div>
            <ChainBadge verified />
          </div>
        </CardHeader>
      </Card>

      {/* Health summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Encounters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <FileText className="size-4 text-primary" /> Recent Encounters
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {isLoading ? (
              <p className="text-xs text-muted-foreground text-center py-4">Loading…</p>
            ) : recentEncounters.length > 0 ? (
              <div className="space-y-3">
                {recentEncounters.map((enc) => (
                  <div key={enc.id} className="flex items-start gap-3 text-sm">
                    <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                    <div>
                      <p className="font-medium capitalize">{enc.encounterType.toLowerCase()}</p>
                      <p className="text-xs text-muted-foreground">{enc.chiefComplaint ?? '—'}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(enc.encounterDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground text-center py-4">No encounters on record</p>
            )}
          </CardContent>
        </Card>

        {/* Active Prescriptions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Pill className="size-4 text-emerald-accent" /> Active Prescriptions ({activePrescriptions.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {isLoading ? (
              <p className="text-xs text-muted-foreground text-center py-4">Loading…</p>
            ) : activePrescriptions.length > 0 ? (
              <div className="space-y-2">
                {activePrescriptions.slice(0, 4).map((rx) => (
                  <div key={rx.id} className="flex items-center justify-between text-sm py-1">
                    <span className="font-medium">{rx.drugName}</span>
                    <span className="text-xs text-muted-foreground">{rx.dosage} · {rx.frequency}</span>
                  </div>
                ))}
                {activePrescriptions.length > 4 && (
                  <p className="text-xs text-muted-foreground text-center pt-1">+{activePrescriptions.length - 4} more</p>
                )}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground text-center py-4">No active prescriptions</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Profile allergies from detailed profile */}
      {profile && (records?.diagnoses ?? []).filter((d) => d.status === 'ACTIVE').length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <AlertTriangle className="size-4 text-amber-warm" /> Active Diagnoses
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-wrap gap-2">
              {(records?.diagnoses ?? [])
                .filter((d) => d.status === 'ACTIVE' || d.status === 'CHRONIC')
                .map((d) => (
                  <Badge key={d.id} variant="outline" className="text-xs gap-1">
                    {d.icd10Code && <span className="font-mono text-primary">{d.icd10Code}</span>}
                    {d.description}
                  </Badge>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export function DoctorPatientSearch() {
  const { mutate: search, data: results, isPending, reset } = useSearchPatients();
  const [query, setQuery] = useState('');
  const [queryType, setQueryType] = useState<'did' | 'name' | 'phone'>('did');
  const [selectedPatient, setSelectedPatient] = useState<PatientSearchResult | null>(null);

  const handleSearch = () => {
    if (!query.trim()) return;
    setSelectedPatient(null);
    search(
      queryType === 'did' ? { did: query.trim() }
      : queryType === 'phone' ? { phone: query.trim() }
      : { name: query.trim() }
    );
  };

  return (
    <PageContainer
      title="Patient Search"
      subtitle="Search for patients by DID, name, or phone number"
    >
      {/* Search form */}
      <Card className="mb-6 animate-fade-in">
        <CardContent className="p-6 space-y-4">
          <div className="flex flex-wrap gap-2">
            {(['did', 'name', 'phone'] as const).map((t) => (
              <button
                key={t}
                onClick={() => { setQueryType(t); setQuery(''); reset(); setSelectedPatient(null); }}
                className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  queryType === t
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-muted text-muted-foreground border-border hover:border-primary/30'
                }`}
              >
                {t === 'did' ? 'By DID' : t === 'name' ? 'By Name' : 'By Phone'}
              </button>
            ))}
          </div>

          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder={
                  queryType === 'did' ? 'did:afrihealth:CMR-XXXXXXXX'
                  : queryType === 'phone' ? '+237 6XX XXX XXX'
                  : 'Patient name…'
                }
                className={`pl-9 ${queryType === 'did' ? 'font-mono text-sm' : ''}`}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch} disabled={isPending || !query.trim()} className="gap-2">
              {isPending ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {results && results.length === 0 && (
        <Card className="py-0">
          <CardContent className="py-12 text-center">
            <UserRound className="size-10 mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-sm text-muted-foreground">No patients found matching your search.</p>
          </CardContent>
        </Card>
      )}

      {results && results.length > 0 && !selectedPatient && (
        <div className="space-y-3 animate-fade-in">
          <p className="text-sm text-muted-foreground">{results.length} patient{results.length !== 1 ? 's' : ''} found</p>
          {results.map((patient) => (
            <Card
              key={patient.userDid}
              className="cursor-pointer hover:shadow-md hover:border-primary/30 transition-all"
              onClick={() => setSelectedPatient(patient)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <Avatar className="size-10">
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {patient.firstName?.[0]}{patient.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">{patient.firstName} {patient.lastName}</p>
                    <p className="font-mono text-xs text-muted-foreground truncate">{patient.userDid}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {patient.bloodGroup && <Badge variant="outline" className="text-xs">{patient.bloodGroup}</Badge>}
                    {patient.city && <Badge variant="outline" className="text-xs">{patient.city}</Badge>}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedPatient && (
        <div>
          <Button variant="outline" size="sm" className="mb-4" onClick={() => setSelectedPatient(null)}>
            ← Back to results
          </Button>
          <PatientDetail patient={selectedPatient} />
        </div>
      )}
    </PageContainer>
  );
}
