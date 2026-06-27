'use client';

import { useAppStore } from '@/lib/store';
import { useAuthBootstrap } from '@/lib/hooks/use-auth';
import { LoginPage } from '@/components/ehr/login-page';
import { AppSidebar } from '@/components/ehr/app-sidebar';
import { AppHeader } from '@/components/ehr/app-header';
import { PatientDashboard } from '@/components/ehr/patient-dashboard';
import { PatientRecords } from '@/components/ehr/patient-records';
import { DoctorDashboard } from '@/components/ehr/doctor-dashboard';
import { NewVisitForm } from '@/components/ehr/new-visit-form';
import { ConsentManagement } from '@/components/ehr/consent-management';
import { AdminDashboard } from '@/components/ehr/admin-dashboard';
import { PatientPrescriptions } from '@/components/ehr/patient-prescriptions';
import { PatientDocuments } from '@/components/ehr/patient-documents';
import { PatientSettings } from '@/components/ehr/patient-settings';
import { DoctorPatientSearch } from '@/components/ehr/doctor-patient-search';
import { DoctorMyPatients } from '@/components/ehr/doctor-my-patients';
import { DoctorPrescriptions } from '@/components/ehr/doctor-prescriptions';
import { DoctorFacility } from '@/components/ehr/doctor-facility';
import { DoctorAuditLog } from '@/components/ehr/doctor-audit-log';
import { DoctorSettings } from '@/components/ehr/doctor-settings';
import { cn } from '@/lib/utils';

/* ── Page router based on current state ── */
function PageContent() {
  const currentPage = useAppStore((s) => s.currentPage);

  switch (currentPage) {
    /* Patient pages */
    case 'patient-dashboard':
      return <PatientDashboard />;
    case 'patient-records':
      return <PatientRecords />;
    case 'patient-prescriptions':
      return <PatientPrescriptions />;
    case 'patient-documents':
      return <PatientDocuments />;
    case 'patient-consents':
      return <ConsentManagement />;
    case 'patient-settings':
      return <PatientSettings />;

    /* Doctor pages */
    case 'doctor-dashboard':
      return <DoctorDashboard />;
    case 'doctor-patient-search':
      return <DoctorPatientSearch />;
    case 'doctor-my-patients':
      return <DoctorMyPatients />;
    case 'doctor-new-visit':
      return <NewVisitForm />;
    case 'doctor-prescriptions':
      return <DoctorPrescriptions />;
    case 'doctor-facility':
      return <DoctorFacility />;
    case 'doctor-audit-log':
      return <DoctorAuditLog />;
    case 'doctor-settings':
      return <DoctorSettings />;

    /* Admin pages */
    case 'admin-dashboard':
      return <AdminDashboard />;

    default:
      return <PatientDashboard />;
  }
}

/* ── Main App Shell ── */
export default function Home() {
  const { isBootstrapping } = useAuthBootstrap();
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const sidebarCollapsed = useAppStore((s) => s.sidebarCollapsed);

  if (isBootstrapping) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-sm text-muted-foreground">
        Loading session...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <AppHeader />
      <main
        className={cn(
          'transition-all duration-300 ease-in-out pt-2 pb-8',
          sidebarCollapsed ? 'md:ml-[72px]' : 'md:ml-[256px]'
        )}
      >
        <PageContent />
      </main>
      <footer
        className={cn(
          'border-t border-border py-4 px-6 text-center text-xs text-muted-foreground transition-all duration-300',
          sidebarCollapsed ? 'md:ml-[72px]' : 'md:ml-[256px]'
        )}
      >
        <div className="flex items-center justify-center gap-2">
          <span className="font-medium text-primary">MediChain</span>
          <span>·</span>
          <span>Your health story. Your chain. Secure & universal.</span>
        </div>
      </footer>
    </div>
  );
}
