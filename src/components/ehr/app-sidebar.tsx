'use client';

import React from 'react';
import {
  Shield,
  LayoutDashboard,
  FileText,
  Pill,
  FolderOpen,
  ShieldCheck,
  Settings,
  Search,
  Users,
  PlusCircle,
  Building2,
  ScrollText,
  LogOut,
  HelpCircle,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from '@/components/ui/tooltip';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from '@/components/ui/sheet';
import { useAppStore, type Page, type Role } from '@/lib/store';

// ── Navigation config ──────────────────────────────────────────
interface NavItem {
  label: string;
  icon: React.ElementType;
  page: Page;
}

const PATIENT_NAV: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, page: 'patient-dashboard' },
  { label: 'My Records', icon: FileText, page: 'patient-records' },
  { label: 'Prescriptions', icon: Pill, page: 'patient-prescriptions' },
  { label: 'Documents', icon: FolderOpen, page: 'patient-documents' },
  { label: 'My Consents', icon: ShieldCheck, page: 'patient-consents' },
  { label: 'Settings', icon: Settings, page: 'patient-settings' },
];

const DOCTOR_NAV: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, page: 'doctor-dashboard' },
  { label: 'Patient Search', icon: Search, page: 'doctor-patient-search' },
  { label: 'My Patients', icon: Users, page: 'doctor-my-patients' },
  { label: 'New Visit', icon: PlusCircle, page: 'doctor-new-visit' },
  { label: 'Prescriptions', icon: Pill, page: 'doctor-prescriptions' },
  { label: 'Facility', icon: Building2, page: 'doctor-facility' },
  { label: 'Audit Log', icon: ScrollText, page: 'doctor-audit-log' },
  { label: 'Settings', icon: Settings, page: 'doctor-settings' },
];

const ADMIN_NAV: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, page: 'admin-dashboard' },
];

function getNavItems(role: Role): NavItem[] {
  switch (role) {
    case 'patient':
      return PATIENT_NAV;
    case 'doctor':
      return DOCTOR_NAV;
    case 'admin':
      return ADMIN_NAV;
  }
}

// ── Helpers ────────────────────────────────────────────────────
function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// ── Sidebar content (shared between desktop & mobile) ─────────
function SidebarContent({ collapsed }: { collapsed: boolean }) {
  const {
    role,
    userName,
    userPhoto,
    currentPage,
    navigate,
    toggleSidebar,
    logout,
  } = useAppStore();

  const navItems = getNavItems(role);

  return (
    <div className="flex h-full flex-col bg-background">
      {/* ── Logo ─────────────────────────────────────────── */}
      <div className="flex h-16 items-center gap-2 px-4 border-b border-border">
        <img src="/medichain.png" alt="MediChain Logo" className="size-8 shrink-0 object-contain" />
        {!collapsed && (
          <span className="text-lg font-bold tracking-tight text-primary whitespace-nowrap">
            MediChain
          </span>
        )}
      </div>

      {/* ── User section ─────────────────────────────────── */}
      {!collapsed && (
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <Avatar className="size-9 shrink-0">
            <AvatarImage src={userPhoto || undefined} alt={userName} className="object-cover" />
            <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
              {getInitials(userName)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium truncate">{userName}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide truncate">{role}</p>
          </div>
        </div>
      )}

      {collapsed && (
        <div className="flex justify-center py-3 border-b border-border">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Avatar className="size-9">
                  <AvatarImage src={userPhoto || undefined} alt={userName} className="object-cover" />
                  <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                    {getInitials(userName)}
                  </AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent side="right" className="flex flex-col items-start gap-1">
                <span className="font-medium">{userName}</span>
                <span className="text-[10px] text-primary-foreground/80 uppercase">{role}</span>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}

      {/* ── Navigation ───────────────────────────────────── */}
      <ScrollArea className="flex-1 py-2">
        <nav className="flex flex-col gap-0.5 px-2">
          {navItems.map((item) => {
            const isActive = currentPage === item.page;
            const Icon = item.icon;

            if (collapsed) {
              return (
                <TooltipProvider key={item.page}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                          'mx-auto size-10 shrink-0',
                          isActive
                            ? 'bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary'
                            : 'text-muted-foreground hover:text-foreground'
                        )}
                        onClick={() => navigate(item.page)}
                      >
                        <Icon className="size-5" />
                        <span className="sr-only">{item.label}</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">{item.label}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              );
            }

            return (
              <Button
                key={item.page}
                variant="ghost"
                className={cn(
                  'h-10 justify-start gap-3 px-3 font-normal',
                  isActive
                    ? 'bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary font-medium'
                    : 'text-muted-foreground hover:text-foreground'
                )}
                onClick={() => navigate(item.page)}
              >
                <Icon className="size-5 shrink-0" />
                <span className="truncate">{item.label}</span>
              </Button>
            );
          })}
        </nav>
      </ScrollArea>

      {/* ── Bottom actions ───────────────────────────────── */}
      <div className="mt-auto border-t border-border">
        {/* Collapse toggle (desktop only — rendered by parent) */}
        <div className="hidden md:block">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-3 px-3 rounded-none h-10 text-muted-foreground hover:text-foreground"
            onClick={toggleSidebar}
          >
            {collapsed ? (
              <ChevronsRight className="size-5 shrink-0" />
            ) : (
              <ChevronsLeft className="size-5 shrink-0" />
            )}
            {!collapsed && <span>Collapse</span>}
          </Button>
        </div>

        <Separator />

        {collapsed ? (
          <div className="flex flex-col items-center gap-1 py-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-10 text-muted-foreground hover:text-foreground"
                    onClick={logout}
                  >
                    <LogOut className="size-5" />
                    <span className="sr-only">Logout</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">Logout</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-10 text-muted-foreground hover:text-foreground"
                  >
                    <HelpCircle className="size-5" />
                    <span className="sr-only">Help</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">Help</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        ) : (
          <div className="flex flex-col gap-0.5 p-2">
            <Button
              variant="ghost"
              size="sm"
              className="justify-start gap-3 px-3 h-9 text-muted-foreground hover:text-foreground"
              onClick={logout}
            >
              <LogOut className="size-4 shrink-0" />
              <span>Logout</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="justify-start gap-3 px-3 h-9 text-muted-foreground hover:text-foreground"
            >
              <HelpCircle className="size-4 shrink-0" />
              <span>Help</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main export ────────────────────────────────────────────────
export function AppSidebar() {
  const { sidebarCollapsed, mobileSidebarOpen, setMobileSidebarOpen } =
    useAppStore();

  return (
    <>
      {/* ── Desktop sidebar ───────────────────────────────── */}
      <aside
        className={cn(
          'hidden md:flex flex-col fixed inset-y-0 left-0 z-30 border-r border-border transition-all duration-300 ease-in-out',
          sidebarCollapsed ? 'w-[72px]' : 'w-[256px]'
        )}
      >
        <SidebarContent collapsed={sidebarCollapsed} />
      </aside>

      {/* ── Mobile sidebar (Sheet overlay) ────────────────── */}
      <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
        <SheetContent side="left" className="w-[280px] p-0">
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          <SidebarContent collapsed={false} />
        </SheetContent>
      </Sheet>
    </>
  );
}
