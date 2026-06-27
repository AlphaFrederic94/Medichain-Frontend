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
  | 'admin-dashboard'
  | 'admin-patients'
  | 'admin-doctors'
  | 'admin-records'
  | 'admin-blockchain';

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
  userPhoto: string | null;
  authUser: AuthUser | null;

  // Navigation
  currentPage: Page;
  sidebarCollapsed: boolean;
  mobileSidebarOpen: boolean;

  // Patient Context
  activePatientDid: string | null;
  setActivePatientDid: (did: string | null) => void;

  // Theme
  darkMode: boolean;

  // Actions
  setAuth: (user: AuthUser, accessToken: string, refreshToken: string) => void;
  restoreAuth: (user: AuthUser) => void;
  setUserPhoto: (photo: string | null) => void;
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
  userPhoto: null,
  authUser: null,
  currentPage: 'login',
  sidebarCollapsed: false,
  mobileSidebarOpen: false,
  activePatientDid: null,
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
    const savedPhoto = typeof window !== 'undefined' ? localStorage.getItem('user_photo_' + user.did) : null;
    set({
      isAuthenticated: true,
      role,
      userDid: user.did,
      userName: `${user.firstName} ${user.lastName}`,
      userEmail: user.email,
      userPhoto: savedPhoto,
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
    const savedPhoto = typeof window !== 'undefined' ? localStorage.getItem('user_photo_' + user.did) : null;
    set((state) => ({
      isAuthenticated: true,
      role,
      userDid: user.did,
      userName: `${user.firstName} ${user.lastName}`,
      userEmail: user.email,
      userPhoto: savedPhoto || state.userPhoto,
      authUser: user,
      currentPage: state.currentPage === 'login' ? defaultPage : state.currentPage,
    }));
  },

  setUserPhoto: (photo) =>
    set((state) => {
      if (typeof window !== 'undefined' && state.userDid) {
        if (photo) localStorage.setItem('user_photo_' + state.userDid, photo);
        else localStorage.removeItem('user_photo_' + state.userDid);
      }
      return { userPhoto: photo };
    }),

  logout: () => {
    clearTokens();
    set({
      isAuthenticated: false,
      role: 'patient',
      userDid: '',
      userName: '',
      userEmail: '',
      userPhoto: null,
      authUser: null,
      currentPage: 'login',
      sidebarCollapsed: false,
      mobileSidebarOpen: false,
      activePatientDid: null,
    });
  },

  navigate: (page) => set({ currentPage: page, mobileSidebarOpen: false }),
  setActivePatientDid: (did) => set({ activePatientDid: did }),

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
