import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  api,
  type Diagnosis,
  type Encounter,
  type HealthSummary,
  type MedicalDocument,
  type Prescription,
  type TimelineEvent,
  type Vitals,
} from '../api';
import { useAppStore } from '../store';

// ── Provider records (encounters/diagnoses/prescriptions created by a provider) ─
export function useProviderRecords(did: string | null) {
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const role = useAppStore((s) => s.role);

  return useQuery({
    queryKey: ['records', 'provider', did],
    queryFn: () => api.get<HealthSummary>(`/records/provider/${did}`),
    enabled: isAuthenticated && role === 'doctor' && !!did,
  });
}

// ── Patient records ──────────────────────────────────────────────
export function usePatientRecords(did: string | null) {
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);

  return useQuery({
    queryKey: ['records', 'patient', did],
    queryFn: () => api.get<HealthSummary>(`/records/patient/${did}`),
    enabled: isAuthenticated && !!did,
  });
}

export function usePatientTimeline(did: string | null) {
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);

  return useQuery({
    queryKey: ['records', 'timeline', did],
    queryFn: () => api.get<TimelineEvent[]>(`/records/timeline/${did}`),
    enabled: isAuthenticated && !!did,
  });
}

export function usePatientSummary(did: string | null) {
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);

  return useQuery({
    queryKey: ['records', 'summary', did],
    queryFn: () => api.get<HealthSummary>(`/records/summary/${did}`),
    enabled: isAuthenticated && !!did,
  });
}

// ── Prescriptions ────────────────────────────────────────────────
export function usePatientPrescriptions(did: string | null) {
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);

  return useQuery({
    queryKey: ['records', 'prescriptions', did],
    queryFn: () => api.get<Prescription[]>(`/records/prescriptions/${did}`),
    enabled: isAuthenticated && !!did,
  });
}

// ── Vitals ───────────────────────────────────────────────────────
export function useLatestVitals(did: string | null) {
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);

  return useQuery({
    queryKey: ['records', 'vitals', did, 'latest'],
    queryFn: () => api.get<Vitals>(`/records/vitals/${did}/latest`),
    enabled: isAuthenticated && !!did,
  });
}

export function useVitalsHistory(did: string | null) {
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);

  return useQuery({
    queryKey: ['records', 'vitals', did, 'history'],
    queryFn: () => api.get<Vitals[]>(`/records/vitals/${did}/history`),
    enabled: isAuthenticated && !!did,
  });
}

// ── Diagnoses ────────────────────────────────────────────────────
export function usePatientDiagnoses(did: string | null) {
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);

  return useQuery({
    queryKey: ['records', 'diagnoses', did],
    queryFn: () => api.get<Diagnosis[]>(`/records/diagnoses/${did}`),
    enabled: isAuthenticated && !!did,
  });
}

// ── Documents ────────────────────────────────────────────────────
export function usePatientDocuments(did: string | null) {
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);

  return useQuery({
    queryKey: ['records', 'documents', did],
    queryFn: () => api.get<MedicalDocument[]>(`/records/documents/${did}`),
    enabled: isAuthenticated && !!did,
  });
}

// ── Mutations ────────────────────────────────────────────────────
export function useCreateVisit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      patientDid: string;
      encounterType: string;
      chiefComplaint?: string;
      notes?: string;
      facilityId?: string;
    }) => api.post<Encounter>('/records/visits', data),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['records', 'patient', vars.patientDid] });
    },
  });
}

export function useAddDiagnosis() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      encounterId: string;
      patientDid: string;
      icd10Code?: string;
      description: string;
      status: string;
      severity?: string;
    }) => api.post<Diagnosis>('/records/diagnoses', data),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['records', 'diagnoses', vars.patientDid] });
    },
  });
}

export function useCreatePrescription() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      encounterId: string;
      patientDid: string;
      drugName: string;
      genericName?: string;
      dosage: string;
      frequency: string;
      durationDays: number;
      instructions?: string;
    }) => api.post<Prescription>('/records/prescriptions', data),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['records', 'prescriptions', vars.patientDid] });
    },
  });
}

export function useRecordVitals() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      encounterId: string;
      patientDid: string;
      temperatureC?: number;
      bloodPressure?: string;
      pulseRate?: number;
      respiratoryRate?: number;
      weightKg?: number;
      heightCm?: number;
      oxygenSat?: number;
      bloodGlucose?: number;
    }) => api.post<Vitals>('/records/vitals', data),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['records', 'vitals', vars.patientDid] });
    },
  });
}

export function useDispensePrescription() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api.put<Prescription>(`/records/prescriptions/${id}/dispense`, {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['records', 'prescriptions'] });
    },
  });
}

// ── Analytics ────────────────────────────────────────────────────
export interface RecordsAnalytics {
  totalEncounters: number;
  totalDiagnoses: number;
  totalPrescriptions: number;
  totalDocuments: number;
  encountersToday: number;
  visitTypeBreakdown: { name: string; value: number }[];
  topDiagnoses: { name: string; count: number }[];
  encountersOverTime: { month: string; count: number }[];
}

export function useRecordsAnalytics() {
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const authUser = useAppStore((s) => s.authUser);
  const isAdmin = authUser?.role === 'MINISTRY_ADMIN' || authUser?.role === 'SUPER_ADMIN' || authUser?.role === 'FACILITY_ADMIN';

  return useQuery({
    queryKey: ['records', 'analytics'],
    queryFn: () => api.get<RecordsAnalytics>('/records/analytics'),
    enabled: isAuthenticated && isAdmin,
  });
}

export function useUploadDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      encounterId: string;
      patientDid: string;
      documentType: string;
      fileName: string;
      storagePath: string;
      fileSize?: number;
      mimeType?: string;
    }) => api.post<MedicalDocument>('/records/documents', data),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['records', 'documents', vars.patientDid] });
    },
  });
}

// ── Blockchain Consent Hooks ─────────────────────────────────────
export interface ConsentHistoryItem {
  id: string;
  patientDid: string;
  providerDid: string;
  scopes: string[];
  expiresAt: string;
  purpose: string;
  status: 'ACTIVE' | 'REVOKED' | 'EXPIRED';
  txId?: string;
  createdAt: string;
}

export function usePatientConsentHistory(patientDid: string | null) {
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  return useQuery({
    queryKey: ['blockchain', 'consents', patientDid],
    queryFn: () => api.get<ConsentHistoryItem[]>(`/blockchain/consents/history/${patientDid}`),
    enabled: isAuthenticated && !!patientDid,
  });
}

export function useGrantConsent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      providerDid: string;
      scopes: string[];
      expiresAt: string;
      purpose: string;
    }) => api.post<{ success: boolean; data: any }>('/blockchain/consents', data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['blockchain', 'consents'] });
    },
  });
}

export function useRevokeConsent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { providerDid: string }) =>
      api.delete<{ success: boolean; data: any }>('/blockchain/consents', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['blockchain', 'consents'] });
    },
  });
}
