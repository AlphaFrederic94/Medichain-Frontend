'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { PageContainer } from '@/components/ehr/page-container';
import { ChainBadge } from '@/components/ehr/chain-badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Search, Loader2, UserRound, Droplets, MapPin, Phone,
  AlertTriangle, FileText, Pill, Activity, Upload, Download,
} from 'lucide-react';
import { useSearchPatients, usePatientByDid } from '@/lib/hooks/use-patient';
import { usePatientRecords, useUploadDocument } from '@/lib/hooks/use-records';
import { useAppStore } from '@/lib/store';
import type { MedicalDocument, PatientSearchResult } from '@/lib/api';

const MAX_FILE_SIZE = 5 * 1024 * 1024;

function formatDate(value?: string) {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Unable to read selected file'));
    reader.readAsDataURL(file);
  });
}

function DocumentLink({ doc }: { doc: MedicalDocument }) {
  const canDownload = doc.storagePath.startsWith('data:');
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border bg-background px-3 py-2 text-sm">
      <div className="min-w-0">
        <p className="font-medium truncate">{doc.fileName}</p>
        <p className="text-xs text-muted-foreground">{doc.documentType.replaceAll('_', ' ').toLowerCase()} � {formatDate(doc.uploadedAt)}</p>
      </div>
      {canDownload && (
        <Button asChild variant="ghost" size="icon" className="size-8 shrink-0">
          <a href={doc.storagePath} download={doc.fileName} aria-label={`Download ${doc.fileName}`}>
            <Download className="size-4" />
          </a>
        </Button>
      )}
    </div>
  );
}

function PatientDetail({ patient }: { patient: PatientSearchResult }) {
  const { data: profile } = usePatientByDid(patient.userDid);
  const { data: records, isLoading } = usePatientRecords(patient.userDid);
  const { mutateAsync: uploadDocument, isPending: uploading } = useUploadDocument();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploadError, setUploadError] = useState('');
  const [documentType, setDocumentType] = useState<MedicalDocument['documentType']>('OTHER');

  const display = {
    firstName: profile?.firstName || patient.firstName || 'Patient',
    lastName: profile?.lastName || patient.lastName || '',
    gender: profile?.gender || patient.gender,
    bloodGroup: profile?.bloodGroup || patient.bloodGroup,
    city: profile?.city || patient.city,
    phone: profile?.phone || patient.phone,
  };

  const encounters = records?.encounters ?? [];
  const diagnoses = records?.diagnoses ?? [];
  const prescriptions = records?.prescriptions ?? [];
  const vitals = records?.vitals ?? [];
  const documents = records?.documents ?? [];
  const activePrescriptions = prescriptions.filter((p) => !p.dispensed);
  const activeDiagnoses = diagnoses.filter((d) => d.status === 'ACTIVE' || d.status === 'CHRONIC');

  const docsByEncounter = useMemo(() => {
    const map = new Map<string, MedicalDocument[]>();
    for (const doc of documents) {
      if (!doc.encounterId) continue;
      map.set(doc.encounterId, [...(map.get(doc.encounterId) ?? []), doc]);
    }
    return map;
  }, [documents]);

  const standaloneDocuments = documents.filter((doc) => !doc.encounterId);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setUploadError('');
    if (file.size > MAX_FILE_SIZE) {
      setUploadError('Medical records must be 5 MB or smaller.');
      return;
    }
    try {
      const storagePath = await readFileAsDataUrl(file);
      await uploadDocument({
        patientDid: patient.userDid,
        documentType,
        fileName: file.name,
        storagePath,
        fileSize: file.size,
        mimeType: file.type || 'application/octet-stream',
      });
    } catch (err) {
      setUploadError((err as Error).message || 'Upload failed.');
    }
  };

  return (
    <div className="mt-6 animate-fade-in space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="size-14">
                <AvatarFallback className="bg-primary/10 text-primary text-lg font-bold">
                  {display.firstName?.[0]}{display.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <h2 className="text-lg font-bold">{display.firstName} {display.lastName}</h2>
                <div className="flex flex-wrap gap-2 mt-2">
                  {display.bloodGroup && <Badge className="bg-primary/10 text-primary border-primary/20 gap-1"><Droplets className="size-3" /> {display.bloodGroup}</Badge>}
                  {display.gender && <Badge variant="outline" className="text-xs capitalize">{display.gender.toLowerCase()}</Badge>}
                  {display.city && <Badge variant="outline" className="text-xs gap-1"><MapPin className="size-3" /> {display.city}</Badge>}
                  {display.phone && <Badge variant="outline" className="text-xs gap-1"><Phone className="size-3" /> {display.phone}</Badge>}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <select value={documentType} onChange={(e) => setDocumentType(e.target.value as MedicalDocument['documentType'])} className="h-9 rounded-md border border-input bg-background px-2 text-xs" aria-label="Document type">
                <option value="OTHER">Other</option>
                <option value="LAB_RESULT">Lab Result</option>
                <option value="XRAY">X-Ray</option>
                <option value="SCAN">Scan</option>
                <option value="DISCHARGE_SUMMARY">Discharge Summary</option>
                <option value="REFERRAL">Referral</option>
              </select>
              <input ref={inputRef} type="file" className="hidden" onChange={handleUpload} />
              <Button size="sm" className="gap-2" disabled={uploading} onClick={() => inputRef.current?.click()}>
                {uploading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
                Upload
              </Button>
              <ChainBadge verified />
            </div>
          </div>
        </CardHeader>
        {uploadError && <CardContent className="pt-0"><p className="rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">{uploadError}</p></CardContent>}
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Visits</p><p className="text-2xl font-bold">{encounters.length}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Active Prescriptions</p><p className="text-2xl font-bold">{activePrescriptions.length}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Diagnoses</p><p className="text-2xl font-bold">{diagnoses.length}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Documents</p><p className="text-2xl font-bold">{documents.length}</p></CardContent></Card>
      </div>

      {activeDiagnoses.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-sm font-semibold flex items-center gap-2"><AlertTriangle className="size-4 text-amber-warm" /> Active Diagnoses</CardTitle></CardHeader>
          <CardContent className="pt-0 flex flex-wrap gap-2">
            {activeDiagnoses.map((d) => <Badge key={d.id} variant="outline" className="text-xs">{d.icd10Code ? `${d.icd10Code} ` : ''}{d.description}</Badge>)}
          </CardContent>
        </Card>
      )}

      {standaloneDocuments.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-sm font-semibold flex items-center gap-2"><FileText className="size-4 text-primary" /> Uploaded Documents</CardTitle></CardHeader>
          <CardContent className="pt-0 grid grid-cols-1 md:grid-cols-2 gap-3">
            {standaloneDocuments.map((doc) => <DocumentLink key={doc.id} doc={doc} />)}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="text-sm font-semibold flex items-center gap-2"><FileText className="size-4 text-primary" /> Complete Visit History</CardTitle></CardHeader>
        <CardContent className="pt-0">
          {isLoading ? (
            <p className="text-sm text-muted-foreground text-center py-8">Loading records...</p>
          ) : encounters.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No encounters on record</p>
          ) : (
            <div className="space-y-4">
              {encounters.map((enc) => {
                const encDiagnoses = diagnoses.filter((d) => d.encounterId === enc.id);
                const encPrescriptions = prescriptions.filter((p) => p.encounterId === enc.id);
                const encVitals = vitals.filter((v) => v.encounterId === enc.id);
                const encDocs = docsByEncounter.get(enc.id) ?? [];
                return (
                  <div key={enc.id} className="rounded-lg border bg-card p-4 space-y-3">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <Badge variant="secondary" className="text-xs capitalize">{enc.encounterType.toLowerCase()}</Badge>
                        <h3 className="mt-2 text-sm font-semibold">{enc.chiefComplaint || 'Visit'}</h3>
                        <p className="text-xs text-muted-foreground">{formatDate(enc.encounterDate)}</p>
                      </div>
                      <ChainBadge verified />
                    </div>
                    {enc.notes && <p className="text-sm text-muted-foreground whitespace-pre-wrap">{enc.notes}</p>}
                    {encVitals.length > 0 && <Separator />}
                    {encVitals.map((v) => (
                      <div key={v.id}>
                        <p className="text-xs font-semibold uppercase tracking-wide mb-2 flex items-center gap-1"><Activity className="size-3" /> Vitals</p>
                        <div className="flex flex-wrap gap-2 text-xs">
                          {v.bloodPressure && <Badge variant="outline">BP {v.bloodPressure}</Badge>}
                          {v.temperatureC && <Badge variant="outline">Temp {v.temperatureC} C</Badge>}
                          {v.pulseRate && <Badge variant="outline">Pulse {v.pulseRate}</Badge>}
                          {v.respiratoryRate && <Badge variant="outline">Resp {v.respiratoryRate}</Badge>}
                          {v.weightKg && <Badge variant="outline">Weight {v.weightKg} kg</Badge>}
                          {v.heightCm && <Badge variant="outline">Height {v.heightCm} cm</Badge>}
                          {v.bmi && <Badge variant="outline">BMI {v.bmi}</Badge>}
                          {v.oxygenSat && <Badge variant="outline">O2 {v.oxygenSat}%</Badge>}
                          {v.bloodGlucose && <Badge variant="outline">Glucose {v.bloodGlucose}</Badge>}
                        </div>
                      </div>
                    ))}
                    {encDiagnoses.length > 0 && <Separator />}
                    {encDiagnoses.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide mb-2">Diagnoses</p>
                        <div className="flex flex-wrap gap-2">{encDiagnoses.map((d) => <Badge key={d.id} variant="outline">{d.description} � {d.status.toLowerCase()}</Badge>)}</div>
                      </div>
                    )}
                    {encPrescriptions.length > 0 && <Separator />}
                    {encPrescriptions.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide mb-2 flex items-center gap-1"><Pill className="size-3" /> Prescriptions</p>
                        <div className="space-y-2">{encPrescriptions.map((rx) => <div key={rx.id} className="text-sm"><span className="font-medium">{rx.drugName}</span><span className="text-muted-foreground"> - {rx.dosage}, {rx.frequency}, {rx.durationDays} days</span></div>)}</div>
                      </div>
                    )}
                    {encDocs.length > 0 && <Separator />}
                    {encDocs.length > 0 && <div className="grid grid-cols-1 md:grid-cols-2 gap-2">{encDocs.map((doc) => <DocumentLink key={doc.id} doc={doc} />)}</div>}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function DoctorPatientSearch() {
  const { mutate: search, data: results, isPending, reset } = useSearchPatients();
  const [query, setQuery] = useState('');
  const [queryType, setQueryType] = useState<'name' | 'phone'>('name');
  const [selectedPatient, setSelectedPatient] = useState<PatientSearchResult | null>(null);

  const activePatientDid = useAppStore((s) => s.activePatientDid);
  const setActivePatientDid = useAppStore((s) => s.setActivePatientDid);

  useEffect(() => {
    if (activePatientDid) {
      setSelectedPatient({ userDid: activePatientDid, firstName: '', lastName: '' });
      setActivePatientDid(null);
    }
  }, [activePatientDid, setActivePatientDid]);

  const handleSearch = () => {
    if (!query.trim()) return;
    setSelectedPatient(null);
    search(queryType === 'phone' ? { phone: query.trim() } : { name: query.trim() });
  };

  return (
    <PageContainer title="Patient Search" subtitle="Search for patients by name or phone number">
      <Card className="mb-6 animate-fade-in">
        <CardContent className="p-6 space-y-4">
          <div className="flex flex-wrap gap-2">
            {(['name', 'phone'] as const).map((t) => (
              <button key={t} onClick={() => { setQueryType(t); setQuery(''); reset(); setSelectedPatient(null); }} className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-all ${queryType === t ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted text-muted-foreground border-border hover:border-primary/30'}`}>
                {t === 'name' ? 'By Name' : 'By Phone'}
              </button>
            ))}
          </div>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input placeholder={queryType === 'phone' ? '+237 6XX XXX XXX' : 'Patient name...'} className="pl-9" value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} />
            </div>
            <Button onClick={handleSearch} disabled={isPending || !query.trim()} className="gap-2">
              {isPending ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {results && results.length === 0 && (
        <Card className="py-0"><CardContent className="py-12 text-center"><UserRound className="size-10 mx-auto text-muted-foreground/40 mb-3" /><p className="text-sm text-muted-foreground">No patients found matching your search.</p></CardContent></Card>
      )}

      {results && results.length > 0 && !selectedPatient && (
        <div className="space-y-3 animate-fade-in">
          <p className="text-sm text-muted-foreground">{results.length} patient{results.length !== 1 ? 's' : ''} found</p>
          {results.map((patient) => (
            <Card key={patient.userDid} className="cursor-pointer hover:shadow-md hover:border-primary/30 transition-all" onClick={() => setSelectedPatient(patient)}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <Avatar className="size-10"><AvatarFallback className="bg-primary/10 text-primary font-semibold">{patient.firstName?.[0]}{patient.lastName?.[0]}</AvatarFallback></Avatar>
                  <div className="flex-1 min-w-0"><p className="font-semibold text-sm">{patient.firstName} {patient.lastName}</p><p className="text-xs text-muted-foreground">Patient record</p></div>
                  <div className="flex items-center gap-2 shrink-0">{patient.bloodGroup && <Badge variant="outline" className="text-xs">{patient.bloodGroup}</Badge>}{patient.city && <Badge variant="outline" className="text-xs">{patient.city}</Badge>}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedPatient && (
        <div>
          <Button variant="outline" size="sm" className="mb-4" onClick={() => setSelectedPatient(null)}>Back to results</Button>
          <PatientDetail patient={selectedPatient} />
        </div>
      )}
    </PageContainer>
  );
}
