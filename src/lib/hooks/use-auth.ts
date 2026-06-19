import { useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { api, clearTokens, getToken, type AuthUser, type LoginResponse } from '../api';
import { useAppStore } from '../store';

interface LoginPayload {
  email: string;
  password: string;
}

interface RegisterPatientPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  countryCode?: string;
}

interface RegisterProviderPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'DOCTOR' | 'NURSE' | 'PHARMACIST' | 'FACILITY_ADMIN';
  countryCode?: string;
}

interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export function useLogin() {
  const setAuth = useAppStore((s) => s.setAuth);

  return useMutation({
    mutationFn: (payload: LoginPayload) =>
      api.post<LoginResponse>('/auth/login', payload),
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken, data.refreshToken);
    },
  });
}

export function useRegisterPatient() {
  const setAuth = useAppStore((s) => s.setAuth);

  return useMutation({
    mutationFn: (payload: RegisterPatientPayload) =>
      api.post<LoginResponse>('/auth/register/patient', payload),
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken, data.refreshToken);
    },
  });
}

export function useRegisterProvider() {
  const setAuth = useAppStore((s) => s.setAuth);

  return useMutation({
    mutationFn: (payload: RegisterProviderPayload) =>
      api.post<LoginResponse>('/auth/register/provider', payload),
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken, data.refreshToken);
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (payload: ChangePasswordPayload) =>
      api.put<{ message: string }>('/auth/password/change', payload),
  });
}

export function useAuthBootstrap() {
  const restoreAuth = useAppStore((s) => s.restoreAuth);
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      const token = getToken();
      if (!token || isAuthenticated) {
        setIsBootstrapping(false);
        return;
      }

      try {
        const user = await api.get<AuthUser>('/auth/me');
        if (!cancelled) restoreAuth(user);
      } catch {
        clearTokens();
      } finally {
        if (!cancelled) setIsBootstrapping(false);
      }
    }

    restoreSession();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, restoreAuth]);

  return { isBootstrapping };
}
