import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  api,
  type Allergy,
  type EmergencyContact,
  type PatientProfile,
  type PatientSearchResult,
  type PatientSummary,
} from '../api';
import { useAppStore } from '../store';

// ── Own patient profile ──────────────────────────────────────────
export function useMyPatientProfile() {
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const role = useAppStore((s) => s.role);

  return useQuery({
    queryKey: ['patient', 'me'],
    queryFn: () => api.get<PatientProfile>('/patients/me'),
    enabled: isAuthenticated && role === 'patient',
  });
}

export function useMyPatientSummary() {
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const role = useAppStore((s) => s.role);

  return useQuery({
    queryKey: ['patient', 'me', 'summary'],
    queryFn: () => api.get<PatientSummary>('/patients/me/summary'),
    enabled: isAuthenticated && role === 'patient',
  });
}

export function useMyAllergies() {
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const role = useAppStore((s) => s.role);

  return useQuery({
    queryKey: ['patient', 'me', 'allergies'],
    queryFn: () => api.get<Allergy[]>('/patients/me/allergies'),
    enabled: isAuthenticated && role === 'patient',
  });
}

export function useMyEmergencyContacts() {
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const role = useAppStore((s) => s.role);

  return useQuery({
    queryKey: ['patient', 'me', 'emergency-contacts'],
    queryFn: () => api.get<EmergencyContact[]>('/patients/me/emergency-contacts'),
    enabled: isAuthenticated && role === 'patient',
  });
}

// ── Patient profile mutations ────────────────────────────────────
export function useUpdateMyProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<PatientProfile>) =>
      api.put<PatientProfile>('/patients/me', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['patient', 'me'] });
    },
  });
}

export function useUpdateAllergies() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (allergies: Array<{ substance: string; reaction?: string; severity: string }>) =>
      api.put<Allergy[]>('/patients/me/allergies', { allergies }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['patient', 'me', 'allergies'] });
    },
  });
}

export function useAddEmergencyContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (contact: { name: string; phone: string; relationship?: string }) =>
      api.post<EmergencyContact>('/patients/me/emergency-contacts', contact),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['patient', 'me', 'emergency-contacts'] });
    },
  });
}

export function useDeleteEmergencyContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api.delete<{ message: string }>(`/patients/me/emergency-contacts/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['patient', 'me', 'emergency-contacts'] });
    },
  });
}

// ── Provider: get patient by DID ─────────────────────────────────
export function usePatientByDid(did: string | null) {
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);

  return useQuery({
    queryKey: ['patient', did],
    queryFn: () => api.get<PatientProfile>(`/patients/${did}`),
    enabled: isAuthenticated && !!did,
  });
}

// ── Analytics ────────────────────────────────────────────────────
export interface PatientAnalytics {
  totalPatients: number;
  registrationsOverTime: { month: string; count: number }[];
}

export function usePatientAnalytics() {
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const authUser = useAppStore((s) => s.authUser);
  const isAdmin = authUser?.role === 'MINISTRY_ADMIN' || authUser?.role === 'SUPER_ADMIN' || authUser?.role === 'FACILITY_ADMIN';

  return useQuery({
    queryKey: ['patient', 'analytics'],
    queryFn: () => api.get<PatientAnalytics>('/patients/analytics'),
    enabled: isAuthenticated && isAdmin,
  });
}

// ── Patient search ───────────────────────────────────────────────
export function useSearchPatients() {
  return useMutation({
    mutationFn: (query: { did?: string; phone?: string; name?: string }) =>
      api.post<PatientSearchResult[]>('/patients/search', query),
  });
}
