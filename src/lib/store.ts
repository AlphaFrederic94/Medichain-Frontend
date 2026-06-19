import { create } from 'zustand';
import { type AuthUser, type BackendRole, clearTokens, storeTokens } from './api';

export type Role = 'patient' | 'doctor' | 'admin';

// Pages that map to real backend endpoints only
export type Page =
  | 'login'
  | 'patient-dashboard'
  | 'patient-records'
  | 'patient-prescriptions'
  | 'patient-documents'
  | 'patient-consents'
  | 'patient-settings'
  | 'doctor-dashboard'
  | 'doctor-patient-search'
  | 'doctor-my-patients'
  | 'doctor-new-visit'
  | 'doctor-prescriptions'
  | 'doctor-facility'
  | 'doctor-audit-log'
  | 'doctor-settings'
  | 'admin-dashboard';

// Map backend roles to frontend role categories
export function mapRole(backendRole: BackendRole): Role {
  switch (backendRole) {
    case 'PATIENT':
      return 'patient';
    case 'DOCTOR':
    case 'NURSE':
    case 'PHARMACIST':
    case 'LAB_TECHNICIAN':
    case 'FACILITY_ADMIN':
      return 'doctor';
    case 'MINISTRY_ADMIN':
    case 'SUPER_ADMIN':
      return 'admin';
    default:
      return 'patient';
  }
}

interface AppState {
  // Auth
  isAuthenticated: boolean;
  role: Role;
  userDid: string;
  userName: string;
  userEmail: string;
  authUser: AuthUser | null;

  // Navigation
  currentPage: Page;
  sidebarCollapsed: boolean;
  mobileSidebarOpen: boolean;

  // Theme
  darkMode: boolean;

  // Actions
  setAuth: (user: AuthUser, accessToken: string, refreshToken: string) => void;
  restoreAuth: (user: AuthUser) => void;
  logout: () => void;
  navigate: (page: Page) => void;
  toggleSidebar: () => void;
  setMobileSidebarOpen: (open: boolean) => void;
  toggleDarkMode: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  isAuthenticated: false,
  role: 'patient',
  userDid: '',
  userName: '',
  userEmail: '',
  authUser: null,
  currentPage: 'login',
  sidebarCollapsed: false,
  mobileSidebarOpen: false,
  darkMode: false,

  setAuth: (user, accessToken, refreshToken) => {
    storeTokens(accessToken, refreshToken);
    const role = mapRole(user.role);
    const defaultPage: Page =
      role === 'patient'
        ? 'patient-dashboard'
        : role === 'doctor'
          ? 'doctor-dashboard'
          : 'admin-dashboard';
    set({
      isAuthenticated: true,
      role,
      userDid: user.did,
      userName: `${user.firstName} ${user.lastName}`,
      userEmail: user.email,
      authUser: user,
      currentPage: defaultPage,
    });
  },

  restoreAuth: (user) => {
    const role = mapRole(user.role);
    const defaultPage: Page =
      role === 'patient'
        ? 'patient-dashboard'
        : role === 'doctor'
          ? 'doctor-dashboard'
          : 'admin-dashboard';
    set((state) => ({
      isAuthenticated: true,
      role,
      userDid: user.did,
      userName: `${user.firstName} ${user.lastName}`,
      userEmail: user.email,
      authUser: user,
      currentPage: state.currentPage === 'login' ? defaultPage : state.currentPage,
    }));
  },

  logout: () => {
    clearTokens();
    set({
      isAuthenticated: false,
      role: 'patient',
      userDid: '',
      userName: '',
      userEmail: '',
      authUser: null,
      currentPage: 'login',
      sidebarCollapsed: false,
      mobileSidebarOpen: false,
    });
  },

  navigate: (page) => set({ currentPage: page, mobileSidebarOpen: false }),

  toggleSidebar: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  setMobileSidebarOpen: (open) => set({ mobileSidebarOpen: open }),

  toggleDarkMode: () =>
    set((state) => {
      const newMode = !state.darkMode;
      if (typeof document !== 'undefined') {
        document.documentElement.classList.toggle('dark', newMode);
      }
      return { darkMode: newMode };
    }),
}));
