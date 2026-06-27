'use client';

import React, { useState } from 'react';
import { PageContainer } from '@/components/ehr/page-container';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Activity, ShieldCheck, ShieldAlert, Search, RefreshCw, Layers, Terminal } from 'lucide-react';
import { useAllBlocks, useAllBlockchainLogs, useValidateChain } from '@/lib/hooks/use-records';

export function AdminBlockchain() {
  const { data: blocks, isLoading: blocksLoading, refetch: refetchBlocks } = useAllBlocks();
  const { data: logs, isLoading: logsLoading, refetch: refetchLogs } = useAllBlockchainLogs();
  const { data: validation, isLoading: validating, refetch: validate } = useValidateChain();

  const [tab, setTab] = useState<'blocks' | 'logs'>('blocks');
  const [searchTerm, setSearchTerm] = useState('');

  const handleRefresh = () => {
    refetchBlocks();
    refetchLogs();
    validate();
  };

  const filteredBlocks = (blocks ?? []).filter((b: any) => {
    const term = searchTerm.toLowerCase();
    return String(b.index).includes(term) || (b.hash || '').toLowerCase().includes(term);
  });

  const filteredLogs = (logs ?? []).filter((l: any) => {
    const term = searchTerm.toLowerCase();
    return String(l.index).includes(term) || (l.txId || '').toLowerCase().includes(term) || JSON.stringify(l).toLowerCase().includes(term);
  });

  if (blocksLoading || logsLoading) {
    return (
      <PageContainer title="Blockchain Supervision" subtitle="Real-time audit log and cryptographic chain integrity verification">
        <Skeleton className="h-96 w-full rounded-xl" />
      </PageContainer>
    );
  }

  const isValid = validation?.valid ?? true;

  return (
    <PageContainer
      title="Blockchain Supervision"
      subtitle="Supervise immutable ledger entries, verify proof-of-work chain validity, and monitor access logs across MediChain"
    >
      {/* Integrity Status Card */}
      <Card className={`mb-6 border-2 ${isValid ? 'border-emerald-accent/40 bg-emerald-accent/5' : 'border-destructive/40 bg-destructive/5'}`}>
        <CardContent className="p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`size-12 rounded-full flex items-center justify-center ${isValid ? 'bg-emerald-accent text-white' : 'bg-destructive text-white'}`}>
              {isValid ? <ShieldCheck className="size-6" /> : <ShieldAlert className="size-6" />}
            </div>
            <div>
              <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                Cryptographic Ledger Integrity: {isValid ? 'VERIFIED ✓' : 'TAMPER DETECTED ⚠'}
              </h3>
              <p className="text-xs text-muted-foreground">
                {isValid
                  ? 'All blocks in the chain match SHA-256 hash assertions and previous block linkages.'
                  : validation?.message || 'Warning: Hash mismatch detected in blocks.'}
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="text-xs gap-2 border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground"
          >
            <RefreshCw className={`size-3.5 ${validating ? 'animate-spin' : ''}`} /> Verify & Refresh
          </Button>
        </CardContent>
      </Card>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <div className="flex gap-2 p-1 bg-muted rounded-lg border border-border/50">
          <button
            onClick={() => setTab('blocks')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-semibold transition-all ${
              tab === 'blocks' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Layers className="size-4 text-primary" /> Blocks Ledger ({blocks?.length ?? 0})
          </button>
          <button
            onClick={() => setTab('logs')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-semibold transition-all ${
              tab === 'logs' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Terminal className="size-4 text-emerald-accent" /> Raw Audit Transactions ({logs?.length ?? 0})
          </button>
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder={`Search ${tab}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-10 w-full font-mono text-xs"
          />
        </div>
      </div>

      {tab === 'blocks' ? (
        filteredBlocks.length === 0 ? (
          <Card className="p-12 text-center border-dashed">
            <Layers className="size-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-base font-semibold">No blocks generated yet</p>
          </Card>
        ) : (
          <div className="space-y-4 animate-fade-in">
            {filteredBlocks.map((b: any) => (
              <Card key={b.index || b.hash} className="border-border/60 hover:border-primary/40 transition-all bg-card overflow-hidden">
                <div className="bg-muted/40 px-4 py-2.5 border-b border-border/50 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 font-mono font-bold text-sm text-primary">
                    <span className="px-2 py-0.5 rounded bg-primary/10 border border-primary/20">Block #{b.index}</span>
                    <span className="text-xs text-muted-foreground font-normal">Nonce: {b.nonce ?? 0}</span>
                  </div>
                  <span className="text-xs text-muted-foreground font-mono">
                    {new Date(b.timestamp).toLocaleString()}
                  </span>
                </div>
                <CardContent className="p-4 font-mono text-xs space-y-2">
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase">Current Hash</span>
                    <span className="text-emerald-accent break-all font-semibold">{b.hash}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase">Previous Hash</span>
                    <span className="text-muted-foreground break-all">{b.previousHash}</span>
                  </div>
                  {b.data && (
                    <div className="pt-2 border-t border-border/30">
                      <span className="text-muted-foreground block text-[10px] uppercase mb-1">Payload Data</span>
                      <pre className="bg-background p-2.5 rounded border border-border/40 text-[11px] overflow-x-auto text-foreground">
                        {typeof b.data === 'string' ? b.data : JSON.stringify(b.data, null, 2)}
                      </pre>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )
      ) : (
        filteredLogs.length === 0 ? (
          <Card className="p-12 text-center border-dashed">
            <Terminal className="size-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-base font-semibold">No audit transactions found</p>
          </Card>
        ) : (
          <div className="space-y-3 animate-fade-in">
            {filteredLogs.map((l: any, idx: number) => (
              <Card key={l.txId || idx} className="border-border/60 p-4 font-mono text-xs bg-card space-y-1.5">
                <div className="flex items-center justify-between border-b border-border/40 pb-2 mb-2">
                  <span className="font-bold text-primary">Block #{l.index}</span>
                  <span className="text-muted-foreground text-[11px]">{new Date(l.timestamp).toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-muted-foreground text-[10px] uppercase block">Transaction Hash</span>
                  <span className="text-emerald-accent break-all">{l.txId}</span>
                </div>
                <div className="pt-1">
                  <span className="text-muted-foreground text-[10px] uppercase block mb-1">Logged Metadata</span>
                  <pre className="bg-background p-2 rounded border border-border/30 text-[11px] overflow-x-auto">
                    {JSON.stringify(l, null, 2)}
                  </pre>
                </div>
              </Card>
            ))}
          </div>
        )
      )}
    </PageContainer>
  );
}
