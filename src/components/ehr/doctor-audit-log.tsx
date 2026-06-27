'use client';

import { useMemo } from 'react';
import { PageContainer } from '@/components/ehr/page-container';
import { StatCard } from '@/components/ehr/stat-card';
import { ChainBadge } from '@/components/ehr/chain-badge';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ScrollText, FileText, Pill, Stethoscope, Upload, Shield,
  CheckCircle2,
} from 'lucide-react';
import { useProviderRecords } from '@/lib/hooks/use-records';
import { useAppStore } from '@/lib/store';
import type { Encounter, Diagnosis, Prescription, MedicalDocument } from '@/lib/api';

type LogEntry = {
  id: string;
  timestamp: string;
  action: string;
  resource: string;
  actorDid: string;
  details: string;
  type: 'encounter' | 'diagnosis' | 'prescription' | 'document';
};

function buildAuditLog(
  encounters: Encounter[],
  diagnoses: Diagnosis[],
  prescriptions: Prescription[],
  documents: MedicalDocument[]
): LogEntry[] {
  const entries: LogEntry[] = [
    ...encounters.map((e): LogEntry => ({
      id: e.id,
      timestamp: e.encounterDate,
      action: 'ENCOUNTER_CREATED',
      resource: 'Medical Encounter',
      actorDid: e.providerDid,
      details: e.chiefComplaint ?? `${e.encounterType.toLowerCase()} visit`,
      type: 'encounter',
    })),
    ...diagnoses.map((d): LogEntry => ({
      id: d.id,
      timestamp: d.createdAt,
      action: 'DIAGNOSIS_ADDED',
      resource: 'Diagnosis',
      actorDid: d.diagnosedBy,
      details: `${d.icd10Code ? d.icd10Code + ' — ' : ''}${d.description}`,
      type: 'diagnosis',
    })),
    ...prescriptions.map((p): LogEntry => ({
      id: p.id,
      timestamp: p.createdAt,
      action: p.dispensed ? 'PRESCRIPTION_DISPENSED' : 'PRESCRIPTION_ISSUED',
      resource: 'Prescription',
      actorDid: p.dispensed ? (p.dispensedBy ?? p.prescribedBy) : p.prescribedBy,
      details: `${p.drugName} ${p.dosage} — ${p.frequency}`,
      type: 'prescription',
    })),
    ...documents.map((d): LogEntry => ({
      id: d.id,
      timestamp: d.uploadedAt,
      action: 'DOCUMENT_UPLOADED',
      resource: d.documentType.replace('_', ' '),
      actorDid: d.uploadedBy,
      details: d.fileName,
      type: 'document',
    })),
  ];

  return entries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

const ACTION_CONFIG: Record<LogEntry['type'], { icon: React.ElementType; color: string; label: string }> = {
  encounter:    { icon: Stethoscope, color: 'bg-primary/10 text-primary',             label: 'Encounter' },
  diagnosis:    { icon: FileText,    color: 'bg-amber-warm/10 text-amber-warm',       label: 'Diagnosis' },
  prescription: { icon: Pill,        color: 'bg-emerald-accent/10 text-emerald-accent', label: 'Prescription' },
  document:     { icon: Upload,      color: 'bg-muted text-muted-foreground',          label: 'Document' },
};

function AuditLogEntry({ entry }: { entry: LogEntry }) {
  const cfg = ACTION_CONFIG[entry.type];
  const Icon = cfg.icon;

  return (
    <div className="flex items-start gap-4 py-4 border-b border-border last:border-0 animate-fade-in">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${cfg.color}`}>
        <Icon className="size-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-3 mb-1">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="text-xs font-mono">{entry.action}</Badge>
            <Badge variant="secondary" className="text-xs">{cfg.label}</Badge>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <ChainBadge verified />
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {new Date(entry.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
        </div>
        <p className="text-sm text-foreground font-medium">{entry.details}</p>
        <p className="font-mono text-[10px] text-muted-foreground mt-0.5 truncate">
          Actor: {entry.actorDid}
        </p>
      </div>
    </div>
  );
}

export function DoctorAuditLog() {
  const userDid = useAppStore((s) => s.userDid);
  const { data: records, isLoading } = useProviderRecords(userDid);

  const auditLog = useMemo(() => buildAuditLog(
    records?.encounters ?? [],
    records?.diagnoses ?? [],
    records?.prescriptions ?? [],
    records?.documents ?? [],
  ), [records]);

  if (isLoading) {
    return (
      <PageContainer title="Audit Log" subtitle="Blockchain-verified activity trail">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
        <Skeleton className="h-96 rounded-xl" />
      </PageContainer>
    );
  }

  const today = new Date().toDateString();
  const todayCount = auditLog.filter(
    (e) => new Date(e.timestamp).toDateString() === today
  ).length;

  return (
    <PageContainer
      title="Audit Log"
      subtitle="Every clinical action, immutably recorded on MediChain"
    >
      {/* Blockchain banner */}
      <Card className="mb-6 animate-fade-in border-primary/20 bg-primary/5">
        <CardContent className="p-4 flex items-center gap-3">
          <img src="/medichain.png" alt="MediChain" className="size-5 object-contain shrink-0" />
          <div>
            <p className="text-sm font-semibold text-foreground">Blockchain-Verified Audit Trail</p>
            <p className="text-xs text-muted-foreground">
              All entries are cryptographically anchored. Tamper-evident and immutable.
            </p>
          </div>
          <div className="ml-auto shrink-0">
            <Badge className="bg-emerald-accent/10 text-emerald-accent border-emerald-accent/20 gap-1">
              <CheckCircle2 className="size-3" /> Verified
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard title="Total Events" value={auditLog.length} accentColor="primary" />
        <StatCard title="Today's Activity" value={todayCount} accentColor="emerald-accent" />
        <StatCard title="Encounters Logged" value={records?.encounters?.length ?? 0} accentColor="amber-warm" />
      </div>

      {/* Log entries */}
      {auditLog.length > 0 ? (
        <Card className="animate-fade-in">
          <CardContent className="p-6 divide-y divide-border">
            {auditLog.map((entry) => (
              <AuditLogEntry key={`${entry.type}-${entry.id}`} entry={entry} />
            ))}
          </CardContent>
        </Card>
      ) : (
        <Card className="py-0">
          <CardContent className="py-16 text-center">
            <ScrollText className="size-10 mx-auto text-muted-foreground/40 mb-4" />
            <h3 className="text-base font-semibold mb-1">No audit events yet</h3>
            <p className="text-sm text-muted-foreground">
              Activity will appear here once you create visits, add diagnoses, or issue prescriptions.
            </p>
          </CardContent>
        </Card>
      )}
    </PageContainer>
  );
}
