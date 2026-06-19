'use client'

import { useState } from 'react'
import {
  Stethoscope,
  Pill,
  FlaskConical,
  FileText,
  ShieldCheck,
  HeartPulse,
  ChevronDown,
  ChevronUp,
  User,
  Building2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { ChainBadge } from './chain-badge'

export interface TimelineItem {
  /** Date of the event */
  date: string
  /** Title of the event */
  title: string
  /** Short description */
  description?: string
  /** Provider name */
  provider?: string
  /** Facility name */
  facility?: string
  /** Type of medical event */
  type: 'consultation' | 'prescription' | 'lab' | 'document' | 'vaccination' | 'verification'
  /** Blockchain transaction hash */
  txHash?: string
  /** Whether the record is blockchain-verified */
  verified?: boolean
}

export interface TimelineProps {
  /** Array of timeline items */
  items: TimelineItem[]
  /** Additional class names */
  className?: string
}

const typeConfig: Record<
  TimelineItem['type'],
  { icon: React.ElementType; color: string; bg: string; border: string }
> = {
  consultation: {
    icon: Stethoscope,
    color: 'text-primary',
    bg: 'bg-primary/10',
    border: 'border-primary/30',
  },
  prescription: {
    icon: Pill,
    color: 'text-amber-warm',
    bg: 'bg-amber-warm/10',
    border: 'border-amber-warm/30',
  },
  lab: {
    icon: FlaskConical,
    color: 'text-emerald-accent',
    bg: 'bg-emerald-accent/10',
    border: 'border-emerald-accent/30',
  },
  document: {
    icon: FileText,
    color: 'text-muted-foreground',
    bg: 'bg-muted',
    border: 'border-border',
  },
  vaccination: {
    icon: HeartPulse,
    color: 'text-emerald-accent',
    bg: 'bg-emerald-accent/10',
    border: 'border-emerald-accent/30',
  },
  verification: {
    icon: ShieldCheck,
    color: 'text-primary',
    bg: 'bg-primary/10',
    border: 'border-primary/30',
  },
}

function TimelineEntry({
  item,
  isLast,
  index,
}: {
  item: TimelineItem
  isLast: boolean
  index: number
}) {
  const [expanded, setExpanded] = useState(false)
  const config = typeConfig[item.type]
  const Icon = config.icon
  const hasDetails = item.provider || item.facility || item.txHash

  return (
    <div
      className={cn(
        'relative flex gap-4 animate-float-in',
        !isLast && 'pb-8'
      )}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Timeline line */}
      {!isLast && (
        <div className="absolute left-[17px] top-10 bottom-0 w-px bg-border" />
      )}

      {/* Icon dot */}
      <div
        className={cn(
          'relative z-10 flex size-9 shrink-0 items-center justify-center rounded-full border-2',
          config.bg,
          config.border
        )}
      >
        <Icon className={cn('size-4', config.color)} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pt-0.5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground leading-tight">
              {item.title}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">{item.date}</p>
          </div>
          {item.verified && (
            <ChainBadge
              txHash={item.txHash}
              verified={item.verified}
              className="shrink-0"
            />
          )}
        </div>

        {item.description && (
          <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
            {item.description}
          </p>
        )}

        {/* Expandable details */}
        {hasDetails && (
          <div className="mt-2">
            <button
              onClick={() => setExpanded(!expanded)}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {expanded ? (
                <ChevronUp className="size-3.5" />
              ) : (
                <ChevronDown className="size-3.5" />
              )}
              {expanded ? 'Less' : 'Details'}
            </button>

            {expanded && (
              <div className="mt-2 space-y-1.5 rounded-lg border bg-muted/30 p-3 animate-fade-in">
                {item.provider && (
                  <div className="flex items-center gap-2 text-xs">
                    <User className="size-3.5 text-muted-foreground" />
                    <span className="text-muted-foreground">Provider:</span>
                    <span className="font-medium text-foreground">
                      {item.provider}
                    </span>
                  </div>
                )}
                {item.facility && (
                  <div className="flex items-center gap-2 text-xs">
                    <Building2 className="size-3.5 text-muted-foreground" />
                    <span className="text-muted-foreground">Facility:</span>
                    <span className="font-medium text-foreground">
                      {item.facility}
                    </span>
                  </div>
                )}
                {item.txHash && (
                  <div className="flex items-center gap-2 text-xs">
                    <ShieldCheck className="size-3.5 text-primary" />
                    <span className="text-muted-foreground">TX:</span>
                    <span className="mono-hash text-foreground break-all">
                      {item.txHash}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export function Timeline({ items, className }: TimelineProps) {
  if (!items.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <FileText className="size-10 mb-3 opacity-40" />
        <p className="text-sm">No timeline events</p>
      </div>
    )
  }

  return (
    <div className={cn('space-y-0', className)}>
      {items.map((item, index) => (
        <TimelineEntry
          key={`${item.date}-${item.title}-${index}`}
          item={item}
          isLast={index === items.length - 1}
          index={index}
        />
      ))}
    </div>
  )
}
