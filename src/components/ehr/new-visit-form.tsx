'use client';

import { useState } from 'react';
import { PageContainer } from '@/components/ehr/page-container';
import { FormSection } from '@/components/ehr/form-section';
import { ChainBadge } from '@/components/ehr/chain-badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Search, CheckCircle2, XCircle, AlertTriangle, Loader2, Shield,
  Thermometer, Heart, Activity, Scale, Droplets, Wind, Gauge,
  Plus, Trash2, ChevronRight, ChevronLeft, Link2, Stethoscope,
} from 'lucide-react';
import { useSearchPatients, useRegisterPatientByProvider, useUpdatePatientProfileByProvider } from '@/lib/hooks/use-patient';
import { useCreateVisit, useAddDiagnosis, useCreatePrescription, useRecordVitals } from '@/lib/hooks/use-records';
import { useAppStore } from '@/lib/store';
import type { PatientSearchResult } from '@/lib/api';

const STEPS = ['Patient Verification', 'Visit Details', 'Clinical Findings', 'Review & Submit'];

interface DiagnosisEntry {
  description: string;
  status: 'ACTIVE' | 'CHRONIC' | 'RESOLVED' | 'SUSPECTED';
}

interface DrugEntry {
  drug: string;
  dosage: string;
  frequency: string;
  durationDays: string;
  instructions: string;
}

export function NewVisitForm() {
  const userDid = useAppStore((s) => s.userDid);
  const activePatientDid = useAppStore((s) => s.activePatientDid);
  const setActivePatientDid = useAppStore((s) => s.setActivePatientDid);

  const { mutate: searchPatientsApi, isPending: searchingPatient } = useSearchPatients();
  const { mutateAsync: createVisit } = useCreateVisit();
  const { mutateAsync: submitDiagnosis } = useAddDiagnosis();
  const { mutateAsync: createPrescription } = useCreatePrescription();
  const { mutateAsync: recordVitals } = useRecordVitals();
  
  const { mutateAsync: registerPatient } = useRegisterPatientByProvider();
  const { mutateAsync: updatePatientProfile } = useUpdatePatientProfileByProvider();

  const [step, setStep] = useState(0);
  const [patientDid, setPatientDid] = useState('');
  const [patientFound, setPatientFound] = useState<PatientSearchResult | null>(null);
  const [consentStatus, setConsentStatus] = useState<'unchecked' | 'granted' | 'denied'>('unchecked');
  const [visitType, setVisitType] = useState<'OUTPATIENT' | 'INPATIENT' | 'EMERGENCY' | 'TELEHEALTH'>('OUTPATIENT');
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [vitals, setVitals] = useState({
    bpSystolic: '', bpDiastolic: '', temperature: '',
    pulse: '', respiratoryRate: '', weight: '', height: '', o2Sat: '', bloodGlucose: '',
  });
  const [diagnoses, setDiagnoses] = useState<DiagnosisEntry[]>([]);
  const [drugs, setDrugs] = useState<DrugEntry[]>([]);
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [encounterId, setEncounterId] = useState('');

  // Local state for registering a new patient
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [newPatient, setNewPatient] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: 'MALE' as 'MALE' | 'FEMALE' | 'OTHER',
    bloodGroup: '',
    city: '',
    address: '',
  });

  // Auto-populate patient from activePatientDid context
  useState(() => {
    if (activePatientDid) {
      setPatientDid(activePatientDid);
      searchPatientsApi(
        { did: activePatientDid },
        {
          onSuccess: (results) => {
            if (results && results.length > 0) {
              setPatientFound(results[0]);
              setConsentStatus('granted');
            }
          },
        }
      );
      // Clear after loading to avoid sticking context on next route
      setActivePatientDid(null);
    }
  });

  const handleRegisterPatient = async () => {
    if (!newPatient.firstName || !newPatient.lastName || !newPatient.email || !newPatient.phone) {
      setSubmitError('Please fill in all required fields (First/Last name, Email, Phone).');
      return;
    }
    setRegistering(true);
    setSubmitError('');
    try {
      // 1. Create auth user (DID)
      const authRes = await registerPatient({
        email: newPatient.email,
        firstName: newPatient.firstName,
        lastName: newPatient.lastName,
        phone: newPatient.phone,
      });

      const did = authRes.data.user.did;

      // 2. Initialize and write their profile details in patient-service
      await updatePatientProfile({
        did,
        data: {
          dateOfBirth: newPatient.dateOfBirth || undefined,
          gender: newPatient.gender,
          phone: newPatient.phone,
          bloodGroup: newPatient.bloodGroup || undefined,
          city: newPatient.city || undefined,
          address: newPatient.address || undefined,
        },
      });

      // 3. Set the newly created patient as the loaded patient
      const patientResult: PatientSearchResult = {
        userDid: did,
        firstName: newPatient.firstName,
        lastName: newPatient.lastName,
        phone: newPatient.phone,
        gender: newPatient.gender,
        bloodGroup: newPatient.bloodGroup || null,
        city: newPatient.city || null,
        address: newPatient.address || null,
        dateOfBirth: newPatient.dateOfBirth || null,
        nationalId: null,
        languagePref: null,
      };

      setPatientFound(patientResult);
      setPatientDid(did);
      setConsentStatus('granted');
      setShowRegisterForm(false);
      // Auto-advance to Step 2
      setStep(1);
    } catch (err) {
      setSubmitError((err as Error).message || 'Failed to register new patient.');
    } finally {
      setRegistering(false);
    }
  };

  const bmi =
    vitals.weight && vitals.height
      ? (Number(vitals.weight) / (Number(vitals.height) / 100) ** 2).toFixed(1)
      : null;

  // ── Patient search ─────────────────────────────────────────────
  const searchPatient = () => {
    const q = patientDid.trim();
    if (!q) return;
    const isPhone = /^\+?\d/.test(q);
    searchPatientsApi(
      isPhone ? { phone: q } : { name: q },
      {
        onSuccess: (results) => {
          if (results.length > 0) {
            setPatientFound(results[0]);
            setConsentStatus('granted');
          } else {
            setPatientFound(null);
            setConsentStatus('denied');
          }
        },
        onError: () => { setPatientFound(null); setConsentStatus('denied'); },
      }
    );
  };

  // ── Diagnosis helpers ──────────────────────────────────────────
  const addDiagnosis = () =>
    setDiagnoses((prev) => [...prev, { description: '', status: 'ACTIVE' }]);

  const removeDiagnosis = (i: number) =>
    setDiagnoses((prev) => prev.filter((_, idx) => idx !== i));

  const updateDiagnosis = (i: number, key: keyof DiagnosisEntry, value: string) =>
    setDiagnoses((prev) => prev.map((d, idx) => idx === i ? { ...d, [key]: value } : d));

  // ── Drug helpers ───────────────────────────────────────────────
  const addDrug = () =>
    setDrugs((prev) => [...prev, { drug: '', dosage: '', frequency: '', durationDays: '7', instructions: '' }]);

  const removeDrug = (i: number) =>
    setDrugs((prev) => prev.filter((_, idx) => idx !== i));

  const updateDrug = (i: number, key: keyof DrugEntry, value: string) =>
    setDrugs((prev) => prev.map((d, idx) => idx === i ? { ...d, [key]: value } : d));

  // ── Submit ─────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!patientFound) return;
    setSubmitting(true);
    setSubmitError('');

    try {
      const encounter = await createVisit({
        patientDid: patientFound.userDid,
        encounterType: visitType,
        chiefComplaint,
        notes: clinicalNotes,
      });

      if (Object.values(vitals).some(Boolean)) {
        const bp =
          vitals.bpSystolic && vitals.bpDiastolic
            ? `${vitals.bpSystolic}/${vitals.bpDiastolic}`
            : undefined;
        await recordVitals({
          encounterId: encounter.id,
          patientDid: patientFound.userDid,
          bloodPressure:    bp,
          temperatureC:     vitals.temperature     ? Number(vitals.temperature)     : undefined,
          pulseRate:        vitals.pulse            ? Number(vitals.pulse)            : undefined,
          respiratoryRate:  vitals.respiratoryRate  ? Number(vitals.respiratoryRate)  : undefined,
          weightKg:         vitals.weight           ? Number(vitals.weight)           : undefined,
          heightCm:         vitals.height           ? Number(vitals.height)           : undefined,
          oxygenSat:        vitals.o2Sat            ? Number(vitals.o2Sat)            : undefined,
          bloodGlucose:     vitals.bloodGlucose     ? Number(vitals.bloodGlucose)     : undefined,
        });
      }

      for (const d of diagnoses.filter((d) => d.description.trim())) {
        await submitDiagnosis({
          encounterId: encounter.id,
          patientDid: patientFound.userDid,
          description: d.description,
          status: d.status,
        });
      }

      for (const rx of drugs.filter((d) => d.drug.trim())) {
        await createPrescription({
          encounterId: encounter.id,
          patientDid: patientFound.userDid,
          drugName: rx.drug,
          dosage: rx.dosage || '—',
          frequency: rx.frequency || '—',
          durationDays: Number(rx.durationDays) || 7,
          instructions: rx.instructions,
        });
      }

      setEncounterId(encounter.id);
      setSubmitted(true);
    } catch (err) {
      setSubmitError((err as Error).message || 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Success screen ─────────────────────────────────────────────
  if (submitted) {
    return (
      <PageContainer title="Visit Recorded" subtitle="Encounter anchored to AfriHealth Chain">
        <Card className="max-w-lg mx-auto text-center animate-float-in">
          <CardContent className="py-12 space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-accent/10 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-accent" />
            </div>
            <h2 className="text-xl font-bold">Successfully Anchored</h2>
            <p className="text-sm text-muted-foreground">
              This encounter has been immutably recorded on AfriHealth Chain.
            </p>
            <div className="pt-4">
              <ChainBadge txHash={encounterId} verified />
            </div>
            <p className="text-xs text-muted-foreground">{new Date().toLocaleString()}</p>
            <Button className="mt-6" onClick={() => window.location.reload()}>
              Record Another Visit
            </Button>
          </CardContent>
        </Card>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="New Visit"
      subtitle="Record a clinical encounter"
      actions={
        <Badge variant="outline" className="text-xs">
          Step {step + 1} of {STEPS.length}
        </Badge>
      }
    >
      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center gap-1">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center flex-1">
              <div className={`flex items-center gap-2 text-xs font-medium ${i <= step ? 'text-primary' : 'text-muted-foreground'}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  i < step ? 'bg-primary text-primary-foreground'
                  : i === step ? 'bg-primary/10 text-primary border-2 border-primary'
                  : 'bg-muted text-muted-foreground'
                }`}>
                  {i < step ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                </div>
                <span className="hidden sm:inline truncate">{s}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 rounded ${i < step ? 'bg-primary' : 'bg-border'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Step 1: Patient Verification ── */}
      {step === 0 && (
        <div className="max-w-2xl space-y-6 animate-fade-in">
          <FormSection
            title="Patient Verification"
            description="Enter the patient name or phone number to verify identity."
          >
            <div className="flex gap-3">
              <div className="flex-1">
                <Input
                  placeholder="Patient name or phone number"
                  value={patientDid}
                  onChange={(e) => setPatientDid(e.target.value)}
                  className="font-mono text-sm"
                  onKeyDown={(e) => e.key === 'Enter' && searchPatient()}
                />
              </div>
              <Button onClick={searchPatient} disabled={!patientDid || searchingPatient} className="gap-2 shrink-0">
                {searchingPatient ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                Verify
              </Button>
            </div>
          </FormSection>

          {patientFound && (
            <Card className="animate-float-in">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg shrink-0">
                    {(patientFound.firstName?.[0] ?? '') + (patientFound.lastName?.[0] ?? '')}
                  </div>
                  <div>
                    <h3 className="font-semibold">{patientFound.firstName} {patientFound.lastName}</h3>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {patientFound.bloodGroup && (
                    <Badge className="bg-primary/10 text-primary">{patientFound.bloodGroup}</Badge>
                  )}
                  {patientFound.gender && (
                    <Badge variant="outline" className="text-xs capitalize">{patientFound.gender.toLowerCase()}</Badge>
                  )}
                  {patientFound.city && (
                    <Badge variant="outline" className="text-xs">{patientFound.city}</Badge>
                  )}
                </div>
                <Separator />
                <Badge className="bg-emerald-accent/10 text-emerald-accent gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Patient Located
                </Badge>
              </CardContent>
            </Card>
          )}

          {consentStatus === 'denied' && !showRegisterForm && (
            <div className="text-center py-6 border border-dashed rounded-lg bg-card p-6">
              <p className="text-sm text-muted-foreground mb-4">Patient not found. Verify the name or phone number, or register them as a new patient.</p>
              <Button onClick={() => setShowRegisterForm(true)} className="gap-2 mx-auto">
                <Plus className="w-4 h-4" />
                Register New Patient
              </Button>
            </div>
          )}

          {showRegisterForm && (
            <Card className="animate-float-in">
              <CardHeader>
                <CardTitle className="text-sm font-semibold">Register New Patient Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {submitError && (
                  <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-xs flex items-center gap-2">
                    <XCircle className="size-4 shrink-0" />
                    <span>{submitError}</span>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      placeholder="Jane"
                      value={newPatient.firstName}
                      onChange={(e) => setNewPatient({ ...newPatient, firstName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      placeholder="Doe"
                      value={newPatient.lastName}
                      onChange={(e) => setNewPatient({ ...newPatient, lastName: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="jane.doe@example.com"
                      value={newPatient.email}
                      onChange={(e) => setNewPatient({ ...newPatient, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      placeholder="+237677123456"
                      value={newPatient.phone}
                      onChange={(e) => setNewPatient({ ...newPatient, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="dob">Date of Birth</Label>
                    <Input
                      id="dob"
                      type="date"
                      value={newPatient.dateOfBirth}
                      onChange={(e) => setNewPatient({ ...newPatient, dateOfBirth: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="gender">Gender</Label>
                    <select
                      id="gender"
                      value={newPatient.gender}
                      onChange={(e) => setNewPatient({ ...newPatient, gender: e.target.value as any })}
                      className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="blood">Blood Group</Label>
                    <Input
                      id="blood"
                      placeholder="O+"
                      value={newPatient.bloodGroup}
                      onChange={(e) => setNewPatient({ ...newPatient, bloodGroup: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      placeholder="Yaoundé"
                      value={newPatient.city}
                      onChange={(e) => setNewPatient({ ...newPatient, city: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      placeholder="Bastos, Rue 1.023"
                      value={newPatient.address}
                      onChange={(e) => setNewPatient({ ...newPatient, address: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-4">
                  <Button variant="outline" onClick={() => setShowRegisterForm(false)} disabled={registering}>
                    Cancel
                  </Button>
                  <Button onClick={handleRegisterPatient} disabled={registering} className="gap-2">
                    {registering ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    Register & Continue
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* ── Step 2: Visit Details ── */}
      {step === 1 && (
        <div className="max-w-2xl space-y-6 animate-fade-in">
          <FormSection title="Visit Type" description="Select the type of clinical encounter.">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {(['OUTPATIENT', 'INPATIENT', 'EMERGENCY', 'TELEHEALTH'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setVisitType(type)}
                  className={`p-4 rounded-lg border-2 text-center transition-all ${
                    visitType === type
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-border hover:border-primary/30'
                  }`}
                >
                  <Stethoscope className="w-5 h-5 mx-auto mb-2" />
                  <span className="text-sm font-medium capitalize">{type.toLowerCase()}</span>
                </button>
              ))}
            </div>
          </FormSection>

          <FormSection title="Chief Complaint" description="Describe the main reason for this visit.">
            <Textarea
              placeholder="Patient presents with..."
              value={chiefComplaint}
              onChange={(e) => setChiefComplaint(e.target.value)}
              rows={3}
            />
          </FormSection>

          <FormSection title="Vitals" description="Record patient vital signs.">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { key: 'bpSystolic',      label: 'BP Systolic',       icon: Heart,       unit: 'mmHg'  },
                { key: 'bpDiastolic',     label: 'BP Diastolic',      icon: Heart,       unit: 'mmHg'  },
                { key: 'temperature',     label: 'Temperature',       icon: Thermometer, unit: '°C'    },
                { key: 'pulse',           label: 'Pulse',             icon: Activity,    unit: 'bpm'   },
                { key: 'respiratoryRate', label: 'Resp. Rate',        icon: Wind,        unit: '/min'  },
                { key: 'weight',          label: 'Weight',            icon: Scale,       unit: 'kg'    },
                { key: 'height',          label: 'Height',            icon: Scale,       unit: 'cm'    },
                { key: 'o2Sat',           label: 'O₂ Saturation',    icon: Wind,        unit: '%'     },
                { key: 'bloodGlucose',    label: 'Blood Glucose',     icon: Droplets,    unit: 'mg/dL' },
              ].map((v) => (
                <div key={v.key} className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                    <v.icon className="w-3.5 h-3.5" /> {v.label}
                  </Label>
                  <div className="relative">
                    <Input
                      type="number"
                      placeholder="--"
                      value={(vitals as Record<string, string>)[v.key]}
                      onChange={(e) => setVitals({ ...vitals, [v.key]: e.target.value })}
                      className="pr-12"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                      {v.unit}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            {bmi && (
              <div className="mt-3 p-3 rounded-lg bg-muted/50 flex items-center gap-2">
                <Gauge className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">BMI: {bmi}</span>
                <span className="text-xs text-muted-foreground">
                  ({Number(bmi) < 18.5 ? 'Underweight' : Number(bmi) < 25 ? 'Normal' : Number(bmi) < 30 ? 'Overweight' : 'Obese'})
                </span>
              </div>
            )}
          </FormSection>
        </div>
      )}

      {/* ── Step 3: Clinical Findings ── */}
      {step === 2 && (
        <div className="max-w-2xl space-y-6 animate-fade-in">
          {/* Diagnoses */}
          <FormSection title="Diagnoses" description="Add one or more diagnoses for this encounter.">
            <div className="space-y-3">
              {diagnoses.map((d, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg border bg-card">
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <Input
                      placeholder="Diagnosis description…"
                      value={d.description}
                      onChange={(e) => updateDiagnosis(i, 'description', e.target.value)}
                      className="sm:col-span-2 h-8 text-sm"
                    />
                    <select
                      value={d.status}
                      onChange={(e) => updateDiagnosis(i, 'status', e.target.value)}
                      className="h-8 rounded-md border border-input bg-background px-2 text-xs"
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="CHRONIC">Chronic</option>
                      <option value="RESOLVED">Resolved</option>
                      <option value="SUSPECTED">Suspected</option>
                    </select>
                  </div>
                  <button onClick={() => removeDiagnosis(i)} className="text-muted-foreground hover:text-destructive mt-1">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <Button variant="outline" size="sm" onClick={addDiagnosis} className="gap-2 mt-3">
              <Plus className="w-4 h-4" /> Add Diagnosis
            </Button>
          </FormSection>

          {/* Prescriptions */}
          <FormSection title="Prescriptions" description="Add medications prescribed during this visit.">
            <div className="space-y-3">
              {drugs.map((drug, i) => (
                <div key={i} className="p-4 rounded-lg border bg-card space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Prescription {i + 1}</span>
                    <button onClick={() => removeDrug(i)} className="text-muted-foreground hover:text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="sm:col-span-2">
                      <Label className="text-xs text-muted-foreground">Drug Name</Label>
                      <Input
                        placeholder="e.g., Amoxicillin 500mg"
                        value={drug.drug}
                        onChange={(e) => updateDrug(i, 'drug', e.target.value)}
                        className="h-8 text-sm mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Dosage</Label>
                      <Input placeholder="e.g., 500mg" value={drug.dosage} onChange={(e) => updateDrug(i, 'dosage', e.target.value)} className="h-8 text-sm mt-1" />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Frequency</Label>
                      <Input placeholder="e.g., Twice daily" value={drug.frequency} onChange={(e) => updateDrug(i, 'frequency', e.target.value)} className="h-8 text-sm mt-1" />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Duration (days)</Label>
                      <Input type="number" placeholder="7" value={drug.durationDays} onChange={(e) => updateDrug(i, 'durationDays', e.target.value)} className="h-8 text-sm mt-1" />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Instructions</Label>
                      <Input placeholder="e.g., Take with food" value={drug.instructions} onChange={(e) => updateDrug(i, 'instructions', e.target.value)} className="h-8 text-sm mt-1" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" size="sm" onClick={addDrug} className="gap-2 mt-3">
              <Plus className="w-4 h-4" /> Add Prescription
            </Button>
          </FormSection>

          <FormSection title="Clinical Notes" description="Record detailed observations and plan.">
            <Textarea
              placeholder="Clinical findings, assessment, and management plan..."
              value={clinicalNotes}
              onChange={(e) => setClinicalNotes(e.target.value)}
              rows={5}
            />
          </FormSection>
        </div>
      )}

      {/* ── Step 4: Review & Submit ── */}
      {step === 3 && (
        <div className="max-w-2xl space-y-6 animate-fade-in">
          <Card>
            <CardHeader><CardTitle className="text-base">Encounter Summary</CardTitle></CardHeader>
            <CardContent className="space-y-4 pt-0">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Patient: </span>
                  <span className="font-medium">
                    {patientFound ? `${patientFound.firstName} ${patientFound.lastName}` : '—'}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Visit Type: </span>
                  <span className="font-medium capitalize">{visitType.toLowerCase()}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground">Chief Complaint: </span>
                  <span className="font-medium">{chiefComplaint || '—'}</span>
                </div>
              </div>

              {Object.values(vitals).some(Boolean) && (
                <>
                  <Separator />
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Vitals</p>
                    <div className="flex flex-wrap gap-2">
                      {vitals.bpSystolic && <Badge variant="outline">BP: {vitals.bpSystolic}/{vitals.bpDiastolic}</Badge>}
                      {vitals.temperature && <Badge variant="outline">Temp: {vitals.temperature}°C</Badge>}
                      {vitals.pulse && <Badge variant="outline">Pulse: {vitals.pulse} bpm</Badge>}
                      {vitals.weight && <Badge variant="outline">Weight: {vitals.weight} kg</Badge>}
                      {vitals.o2Sat && <Badge variant="outline">O₂: {vitals.o2Sat}%</Badge>}
                      {bmi && <Badge variant="outline">BMI: {bmi}</Badge>}
                    </div>
                  </div>
                </>
              )}

              {diagnoses.filter((d) => d.description).length > 0 && (
                <>
                  <Separator />
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Diagnoses</p>
                    <div className="space-y-1.5">
                      {diagnoses.filter((d) => d.description).map((d, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          <span>{d.description}</span>
                          <Badge variant="outline" className="text-xs capitalize">{d.status.toLowerCase()}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {drugs.filter((d) => d.drug).length > 0 && (
                <>
                  <Separator />
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Prescriptions</p>
                    <div className="space-y-1.5">
                      {drugs.filter((d) => d.drug).map((d, i) => (
                        <div key={i} className="text-sm">
                          <span className="font-medium">{d.drug}</span>
                          {d.dosage && <span className="text-muted-foreground"> — {d.dosage}</span>}
                          {d.frequency && <span className="text-muted-foreground"> · {d.frequency}</span>}
                          {d.durationDays && <span className="text-muted-foreground"> · {d.durationDays} days</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {clinicalNotes && (
                <>
                  <Separator />
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Clinical Notes</p>
                    <p className="text-sm whitespace-pre-wrap">{clinicalNotes}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {submitError && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
              <AlertTriangle className="size-4 shrink-0" />
              {submitError}
            </div>
          )}

          <Button
            onClick={handleSubmit}
            className="w-full h-12 gap-2"
            disabled={submitting || !patientFound}
          >
            {submitting ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Submitting to AfriHealth Chain...</>
            ) : (
              <><Link2 className="w-4 h-4" /> Submit & Anchor to Blockchain</>
            )}
          </Button>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between mt-8 pt-4 border-t">
        <Button
          variant="outline"
          onClick={() => setStep(Math.max(0, step - 1))}
          disabled={step === 0}
          className="gap-2"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </Button>
        {step < STEPS.length - 1 && (
          <Button
            onClick={() => setStep(step + 1)}
            disabled={step === 0 && !patientFound}
            className="gap-2"
          >
            Continue <ChevronRight className="w-4 h-4" />
          </Button>
        )}
      </div>
    </PageContainer>
  );
}
