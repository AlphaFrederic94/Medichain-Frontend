import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, type Facility, type Staff } from '../api';
import { useAppStore } from '../store';

// ── Own provider profile ─────────────────────────────────────────
export function useMyProviderProfile() {
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const role = useAppStore((s) => s.role);

  return useQuery({
    queryKey: ['provider', 'me'],
    queryFn: () => api.get<Staff>('/providers/me'),
    enabled: isAuthenticated && role === 'doctor',
  });
}

export function useUpdateMyProviderProfile() {
  const qc = useQueryClient();
  const userDid = useAppStore((s) => s.userDid);

  return useMutation({
    mutationFn: (data: Partial<Staff>) =>
      api.put<Staff>(`/providers/staff/${userDid}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['provider', 'me'] });
    },
  });
}

// ── Facilities ───────────────────────────────────────────────────
export function useFacilities() {
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);

  return useQuery({
    queryKey: ['provider', 'facilities'],
    queryFn: () => api.get<Facility[]>('/providers/facilities'),
    enabled: isAuthenticated,
  });
}

export function useFacility(id: string | null) {
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);

  return useQuery({
    queryKey: ['provider', 'facility', id],
    queryFn: () => api.get<Facility>(`/providers/facilities/${id}`),
    enabled: isAuthenticated && !!id,
  });
}

export function useRegisterFacility() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      name: string;
      facilityType: string;
      address?: string;
      city?: string;
      phone?: string;
      email?: string;
    }) => api.post<Facility>('/providers/facilities', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['provider', 'facilities'] });
    },
  });
}

// ── Staff ────────────────────────────────────────────────────────
export function useStaffByDid(did: string | null) {
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);

  return useQuery({
    queryKey: ['provider', 'staff', did],
    queryFn: () => api.get<Staff>(`/providers/staff/${did}`),
    enabled: isAuthenticated && !!did,
  });
}

export function useCreateStaff() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      userDid: string;
      firstName: string;
      lastName: string;
      role: string;
      specialty?: string;
      licenseNo?: string;
      facilityId?: string;
    }) => api.post<Staff>('/providers/staff', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['provider', 'staff'] });
    },
  });
}

// ── Analytics ────────────────────────────────────────────────────
export interface ProviderAnalytics {
  totalFacilities: number;
  totalStaff: number;
  facilityTypeBreakdown: { name: string; value: number }[];
  staffRoleBreakdown: { name: string; count: number }[];
}

export function useProviderAnalytics() {
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const authUser = useAppStore((s) => s.authUser);
  const isAdmin = authUser?.role === 'MINISTRY_ADMIN' || authUser?.role === 'SUPER_ADMIN' || authUser?.role === 'FACILITY_ADMIN';

  return useQuery({
    queryKey: ['provider', 'analytics'],
    queryFn: () => api.get<ProviderAnalytics>('/providers/analytics'),
    enabled: isAuthenticated && isAdmin,
  });
}

// ── Specialties ──────────────────────────────────────────────────
export function useSpecialties() {
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);

  return useQuery({
    queryKey: ['provider', 'specialties'],
    queryFn: () => api.get<string[]>('/providers/specialties'),
    enabled: isAuthenticated,
    staleTime: 300_000,
  });
}
