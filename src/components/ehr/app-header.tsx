'use client';

import React from 'react';
import { Sun, Moon, Bell, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAppStore, type Page } from '@/lib/store';

// ── Page title map ─────────────────────────────────────────────
const PAGE_TITLES: Record<Page, string> = {
  login: 'Login',
  'patient-dashboard': 'Dashboard',
  'patient-records': 'My Records',
  'patient-prescriptions': 'Prescriptions',
  'patient-documents': 'Documents',
  'patient-consents': 'My Consents',
  'patient-settings': 'Settings',
  'doctor-dashboard': 'Dashboard',
  'doctor-patient-search': 'Patient Search',
  'doctor-my-patients': 'My Patients',
  'doctor-new-visit': 'New Visit',
  'doctor-prescriptions': 'Prescriptions',
  'doctor-facility': 'Facility',
  'doctor-audit-log': 'Audit Log',
  'doctor-settings': 'Settings',
  'admin-dashboard': 'Dashboard',
};

// ── Helpers ────────────────────────────────────────────────────
function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

const ROLE_LABELS: Record<string, string> = {
  patient: 'Patient',
  doctor: 'Doctor',
  admin: 'Admin',
};

// ── Component ──────────────────────────────────────────────────
export function AppHeader() {
  const {
    currentPage,
    role,
    userName,
    userPhoto,
    darkMode,
    toggleDarkMode,
    sidebarCollapsed,
    setMobileSidebarOpen,
  } = useAppStore();

  const pageTitle = PAGE_TITLES[currentPage] ?? 'Dashboard';

  return (
    <header
      className={cn(
        'sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-border bg-background/95 backdrop-blur-sm px-4 md:px-6 transition-all duration-300 ease-in-out',
        sidebarCollapsed ? 'md:ml-[72px]' : 'md:ml-[256px]'
      )}
    >
      {/* ── Left: Mobile hamburger + Page title ─────────────── */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden shrink-0"
        onClick={() => setMobileSidebarOpen(true)}
        aria-label="Open navigation menu"
      >
        <Menu className="size-5" />
      </Button>

      <h1 className="text-lg font-semibold tracking-tight truncate">
        {pageTitle}
      </h1>

      {/* ── Right actions ───────────────────────────────────── */}
      <div className="ml-auto flex items-center gap-2">
        {/* Dark mode toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleDarkMode}
          aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          className="text-muted-foreground hover:text-foreground"
        >
          {darkMode ? <Sun className="size-5" /> : <Moon className="size-5" />}
        </Button>

        {/* Notification bell */}
        <Button
          variant="ghost"
          size="icon"
          className="relative text-muted-foreground hover:text-foreground"
          aria-label="Notifications"
        >
          <Bell className="size-5" />
          <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white">
            3
          </span>
        </Button>

        <Separator orientation="vertical" className="mx-1 h-6 hidden sm:block" />

        {/* User info */}
        <div className="hidden sm:flex items-center gap-2.5">
          <Avatar className="size-8">
            <AvatarImage src={userPhoto || undefined} alt={userName} className="object-cover" />
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
              {getInitials(userName)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-medium leading-tight truncate max-w-[120px]">
              {userName}
            </span>
            <Badge
              variant="secondary"
              className="mt-0.5 w-fit text-[10px] px-1.5 py-0 leading-4 h-4"
            >
              {ROLE_LABELS[role] ?? role}
            </Badge>
          </div>
        </div>
      </div>
    </header>
  );
}
