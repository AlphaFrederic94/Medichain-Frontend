'use client';

import { useState } from 'react';
import { PageContainer } from '@/components/ehr/page-container';
import { StatCard } from '@/components/ehr/stat-card';
import { ChainBadge } from '@/components/ehr/chain-badge';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  FolderOpen, Search, FileText, Image, Scan, FileArchive,
  ExternalLink, Calendar, User,
} from 'lucide-react';
import { usePatientDocuments } from '@/lib/hooks/use-records';
import { useAppStore } from '@/lib/store';
import type { MedicalDocument } from '@/lib/api';

const DOCTYPE_CONFIG: Record<MedicalDocument['documentType'], { icon: React.ElementType; label: string; color: string }> = {
  LAB_RESULT:       { icon: FileText,    label: 'Lab Result',        color: 'text-primary bg-primary/10' },
  XRAY:             { icon: Scan,        label: 'X-Ray',             color: 'text-amber-warm bg-amber-warm/10' },
  SCAN:             { icon: Scan,        label: 'Scan',              color: 'text-amber-warm bg-amber-warm/10' },
  DISCHARGE_SUMMARY:{ icon: FileArchive, label: 'Discharge Summary', color: 'text-emerald-accent bg-emerald-accent/10' },
  REFERRAL:         { icon: ExternalLink, label: 'Referral',         color: 'text-primary bg-primary/10' },
  OTHER:            { icon: FileText,    label: 'Other',             color: 'text-muted-foreground bg-muted' },
};

function DocumentCard({ doc }: { doc: MedicalDocument }) {
  const cfg = DOCTYPE_CONFIG[doc.documentType];
  const Icon = cfg.icon;

  return (
    <Card className="animate-fade-in hover:shadow-md transition-shadow cursor-pointer group">
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${cfg.color}`}>
            <Icon className="size-6" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
                  {doc.fileName}
                </h3>
                <Badge variant="outline" className="text-xs mt-1">{cfg.label}</Badge>
              </div>
              <ChainBadge verified />
            </div>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="size-3" />
                {new Date(doc.uploadedAt).toLocaleDateString('en-US', {
                  month: 'short', day: 'numeric', year: 'numeric',
                })}
              </span>
              <span className="flex items-center gap-1">
                <User className="size-3" />
                <span className="font-mono text-[10px] truncate max-w-[160px]">{doc.uploadedBy}</span>
              </span>
              {doc.fileSize && (
                <span>{(doc.fileSize / 1024).toFixed(1)} KB</span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function PatientDocuments() {
  const userDid = useAppStore((s) => s.userDid);
  const { data: documents, isLoading } = usePatientDocuments(userDid);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<MedicalDocument['documentType'] | 'ALL'>('ALL');

  const allDocs = documents ?? [];
  const uniqueTypes = Array.from(new Set(allDocs.map((d) => d.documentType)));

  const filtered = allDocs.filter(
    (d) =>
      (filterType === 'ALL' || d.documentType === filterType) &&
      (!search || d.fileName.toLowerCase().includes(search.toLowerCase()))
  );

  const countByType = (type: MedicalDocument['documentType']) =>
    allDocs.filter((d) => d.documentType === type).length;

  if (isLoading) {
    return (
      <PageContainer title="Medical Documents" subtitle="Your medical files and reports">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-36 rounded-xl" />)}
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="Medical Documents" subtitle="Access your medical files, reports, and imaging">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard title="Total Documents" value={allDocs.length} accentColor="primary" />
        <StatCard title="Lab Results" value={countByType('LAB_RESULT')} accentColor="emerald-accent" />
        <StatCard title="Imaging" value={countByType('XRAY') + countByType('SCAN')} accentColor="amber-warm" />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
              filterType === 'ALL' ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted text-muted-foreground border-border'
            }`}
          >
            All ({allDocs.length})
          </button>
          {uniqueTypes.map((type) => {
            const cfg = DOCTYPE_CONFIG[type];
            return (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  filterType === type
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-muted text-muted-foreground border-border hover:border-primary/30'
                }`}
              >
                {cfg.label} ({countByType(type)})
              </button>
            );
          })}
        </div>
        <div className="relative sm:ml-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search documents…"
            className="pl-9 h-9 w-full sm:w-64"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((doc) => (
            <DocumentCard key={doc.id} doc={doc} />
          ))}
        </div>
      ) : (
        <Card className="py-0">
          <CardContent className="py-16 text-center">
            <FolderOpen className="size-10 mx-auto text-muted-foreground/40 mb-4" />
            <h3 className="text-base font-semibold mb-1">
              {allDocs.length === 0 ? 'No documents on record' : 'No matching documents'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {allDocs.length === 0
                ? 'Medical documents uploaded by your providers will appear here.'
                : 'Try adjusting your search or filter.'}
            </p>
          </CardContent>
        </Card>
      )}
    </PageContainer>
  );
}
