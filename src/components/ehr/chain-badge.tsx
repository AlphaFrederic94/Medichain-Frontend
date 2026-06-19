'use client'

import { ShieldCheck, ShieldAlert } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

export interface ChainBadgeProps {
  /** Blockchain transaction hash */
  txHash?: string
  /** Whether the record is verified on-chain */
  verified?: boolean
  /** Additional class names */
  className?: string
}

function truncateHash(hash: string): string {
  if (hash.length <= 16) return hash
  return `${hash.slice(0, 8)}...${hash.slice(-6)}`
}

export function ChainBadge({
  txHash,
  verified = true,
  className,
}: ChainBadgeProps) {
  const Icon = verified ? ShieldCheck : ShieldAlert
  const label = verified ? 'Chain Verified' : 'Unverified'

  const badge = (
    <Badge
      className={cn(
        'gap-1.5 px-2.5 py-1 text-xs font-medium transition-all cursor-default select-none',
        verified
          ? 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/15'
          : 'bg-muted text-muted-foreground border-border hover:bg-muted/80',
        verified && 'chain-glow',
        className
      )}
    >
      <Icon
        className={cn(
          'size-3.5',
          verified && 'animate-chain-pulse rounded-full'
        )}
      />
      <span>{label}</span>
      {txHash && (
        <span className="mono-hash ml-1 opacity-60">
          {truncateHash(txHash)}
        </span>
      )}
    </Badge>
  )

  if (txHash) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex">{badge}</span>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          className="bg-foreground text-background font-normal"
        >
          <div className="space-y-1">
            <p className="text-[10px] uppercase tracking-widest opacity-60">
              Transaction Hash
            </p>
            <p className="mono-hash text-xs break-all">{txHash}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    )
  }

  return badge
}
