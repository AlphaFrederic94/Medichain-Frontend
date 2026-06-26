const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

// ── Token helpers ────────────────────────────────────────────────
export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('ehr_access_token');
}

export function storeTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem('ehr_access_token', accessToken);
  localStorage.setItem('ehr_refresh_token', refreshToken);
}

export function clearTokens() {
  localStorage.removeItem('ehr_access_token');
  localStorage.removeItem('ehr_refresh_token');
}

export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('ehr_refresh_token');
}

// ── Core request ─────────────────────────────────────────────────
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  let body: unknown;
  try {
    body = await res.json();
  } catch {
    body = {};
  }

  if (!res.ok) {
    const msg =
      (body as { message?: string; error?: string })?.message ||
      (body as { error?: string })?.error ||
      `HTTP ${res.status}`;
    throw new Error(msg);
  }

  // All backend responses are wrapped in { success, data }
  const wrapped = body as { success?: boolean; data?: T };
  return (wrapped.data !== undefined ? wrapped.data : body) as T;
}

// ── Typed API surface ────────────────────────────────────────────
export const api = {
  get: <T>(path: string) => request<T>(path, { method: 'GET' }),

  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),

  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),

  delete: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'DELETE', ...(body ? { body: JSON.stringify(body) } : {}) }),
};

// ── Response types matching backend schemas ──────────────────────

export interface AuthUser {
  id: string;
  did: string;
  email: string;
  phone?: string;
  firstName: string;
  lastName: string;
  role: BackendRole;
  countryCode: string;
  licenseNo?: string;
  specialty?: string;
  facilityId?: string;
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export type BackendRole =
  | 'PATIENT'
  | 'DOCTOR'
  | 'NURSE'
  | 'PHARMACIST'
  | 'LAB_TECHNICIAN'
  | 'FACILITY_ADMIN'
  | 'MINISTRY_ADMIN'
  | 'SUPER_ADMIN';

export interface LoginResponse {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

export interface PatientProfile {
  id: string;
  userDid: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  phone?: string;
  email?: string;
  nationalId?: string;
  bloodGroup?: string;
  countryCode: string;
  languagePref: string;
  address?: string;
  city?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PatientSummary {
  patient: PatientProfile;
  totalVisits: number;
  activePrescriptions: number;
  recentDiagnoses: Diagnosis[];
  latestVitals?: Vitals;
  activeConsents: number;
  documentsCount: number;
}

export interface Allergy {
  id: string;
  patientId: string;
  substance: string;
  reaction?: string;
  severity: 'MILD' | 'MODERATE' | 'SEVERE' | 'LIFE_THREATENING';
  recordedBy?: string;
  createdAt: string;
}

export interface EmergencyContact {
  id: string;
  patientId: string;
  name: string;
  phone: string;
  relationship?: string;
  createdAt: string;
}

export interface Encounter {
  id: string;
  patientDid: string;
  providerDid: string;
  facilityId?: string;
  encounterType: 'OUTPATIENT' | 'INPATIENT' | 'EMERGENCY' | 'TELEHEALTH' | 'FOLLOW_UP';
  chiefComplaint?: string;
  notes?: string;
  encounterDate: string;
  dischargeDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Diagnosis {
  id: string;
  encounterId: string;
  patientDid: string;
  icd10Code?: string;
  description: string;
  status: 'ACTIVE' | 'RESOLVED' | 'CHRONIC' | 'SUSPECTED';
  severity?: string;
  diagnosedBy: string;
  createdAt: string;
}

export interface Prescription {
  id: string;
  encounterId: string;
  patientDid: string;
  drugName: string;
  genericName?: string;
  dosage: string;
  frequency: string;
  durationDays: number;
  instructions?: string;
  dispensed: boolean;
  dispensedAt?: string;
  dispensedBy?: string;
  prescribedBy: string;
  createdAt: string;
}

export interface Vitals {
  id: string;
  encounterId: string;
  patientDid: string;
  recordedAt: string;
  temperatureC?: number;
  bloodPressure?: string;
  pulseRate?: number;
  respiratoryRate?: number;
  weightKg?: number;
  heightCm?: number;
  bmi?: number;
  oxygenSat?: number;
  bloodGlucose?: number;
  recordedBy: string;
}

export interface MedicalDocument {
  id: string;
  encounterId: string;
  patientDid: string;
  documentType: 'LAB_RESULT' | 'XRAY' | 'SCAN' | 'DISCHARGE_SUMMARY' | 'REFERRAL' | 'OTHER';
  fileName: string;
  fileSize?: number;
  mimeType?: string;
  storagePath: string;
  uploadedBy: string;
  uploadedAt: string;
}

export interface TimelineEvent {
  date: string;
  type: string;
  title: string;
  description?: string;
  provider?: string;
  facility?: string;
}

export interface HealthSummary {
  encounters: Encounter[];
  diagnoses: Diagnosis[];
  prescriptions: Prescription[];
  vitals: Vitals[];
  documents: MedicalDocument[];
}

export interface Facility {
  id: string;
  name: string;
  facilityType: 'HOSPITAL' | 'CLINIC' | 'PHARMACY' | 'LABORATORY' | 'HEALTH_CENTER';
  registrationNo?: string;
  address?: string;
  city?: string;
  country: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  email?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Staff {
  id: string;
  userDid: string;
  firstName: string;
  lastName: string;
  role: 'DOCTOR' | 'NURSE' | 'PHARMACIST' | 'LAB_TECHNICIAN' | 'FACILITY_ADMIN';
  specialty?: string;
  licenseNo?: string;
  facilityId?: string;
  facility?: Facility;
  verified: boolean;
  bio?: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PatientSearchResult {
  userDid: string;
  firstName: string;
  lastName: string;
  gender?: string;
  bloodGroup?: string;
  city?: string;
  phone?: string;
}
