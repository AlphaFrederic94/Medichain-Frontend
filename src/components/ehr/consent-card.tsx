'use client'

import { useState, useEffect } from 'react'
import { Clock, ShieldOff } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

export interface ConsentCardProps {
  /** Provider display name */
  providerName: string
  /** Provider specialty */
  specialty?: string
  /** Facility name */
  facility?: string
  /** Access type labels (e.g. "Read", "Write", "Full") */
  accessTypes: string[]
  /** Date consent was granted (ISO string) */
  grantedDate: string
  /** Expiry date/time (ISO string) */
  expiresAt: string
  /** Callback when revoke is requested */
  onRevoke?: () => void
  /** Whether the revoke action is disabled */
  revokeDisabled?: boolean
  /** Additional class names */
  className?: string
}

interface TimeRemaining {
  days: number
  hours: number
  minutes: number
  seconds: number
  expired: boolean
}

function getTimeRemaining(expiry: string): TimeRemaining {
  const now = new Date().getTime()
  const end = new Date(expiry).getTime()
  const diff = end - now

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true }
  }

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    expired: false,
  }
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const accessTypeColorMap: Record<string, string> = {
  Read: 'bg-emerald-accent/10 text-emerald-accent border-emerald-accent/20',
  Write: 'bg-amber-warm/10 text-amber-warm border-amber-warm/20',
  Full: 'bg-primary/10 text-primary border-primary/20',
  Delete: 'bg-destructive/10 text-destructive border-destructive/20',
}

export function ConsentCard({
  providerName,
  specialty,
  facility,
  accessTypes,
  grantedDate,
  expiresAt,
  onRevoke,
  revokeDisabled = false,
  className,
}: ConsentCardProps) {
  const [timeLeft, setTimeLeft] = useState<TimeRemaining>(() =>
    getTimeRemaining(expiresAt)
  )

  useEffect(() => {
    const tick = () => setTimeLeft(getTimeRemaining(expiresAt))
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [expiresAt])

  const isUrgent =
    !timeLeft.expired && timeLeft.days === 0 && timeLeft.hours < 24

  return (
    <Card
      className={cn(
        'relative overflow-hidden animate-float-in',
        'border-l-2',
        timeLeft.expired
          ? 'border-l-muted-foreground opacity-60'
          : isUrgent
            ? 'border-l-amber-warm'
            : 'border-l-primary',
        className
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <Avatar className="size-10 shrink-0 border border-border">
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
              {getInitials(providerName)}
            </AvatarFallback>
          </Avatar>

          {/* Main content */}
          <div className="flex-1 min-w-0 space-y-2.5">
            {/* Provider info */}
            <div>
              <p className="text-sm font-semibold text-foreground leading-tight">
                {providerName}
              </p>
              {specialty && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {specialty}
                </p>
              )}
              {facility && (
                <p className="text-xs text-muted-foreground">{facility}</p>
              )}
            </div>

            {/* Access type chips */}
            <div className="flex flex-wrap gap-1.5">
              {accessTypes.map((type) => (
                <Badge
                  key={type}
                  variant="outline"
                  className={cn(
                    'text-[10px] px-2 py-0 h-5 font-medium',
                    accessTypeColorMap[type] ||
                      'bg-muted text-muted-foreground border-border'
                  )}
                >
                  {type}
                </Badge>
              ))}
            </div>

            {/* Dates row */}
            <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
              <span>
                Granted:{' '}
                <span className="font-medium text-foreground">
                  {new Date(grantedDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </span>
            </div>

            {/* Countdown + Revoke */}
            <div className="flex items-center justify-between gap-3 pt-1">
              <div
                className={cn(
                  'flex items-center gap-1.5 text-xs font-mono',
                  timeLeft.expired
                    ? 'text-destructive'
                    : isUrgent
                      ? 'text-amber-warm'
                      : 'text-muted-foreground'
                )}
              >
                <Clock className="size-3.5" />
                {timeLeft.expired ? (
                  <span className="font-semibold">Expired</span>
                ) : (
                  <span className="tabular-nums">
                    {timeLeft.days > 0 && `${timeLeft.days}d `}
                    {String(timeLeft.hours).padStart(2, '0')}:
                    {String(timeLeft.minutes).padStart(2, '0')}:
                    {String(timeLeft.seconds).padStart(2, '0')}
                  </span>
                )}
              </div>

              {onRevoke && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onRevoke}
                  disabled={revokeDisabled || timeLeft.expired}
                  className="h-7 px-2.5 text-xs gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <ShieldOff className="size-3" />
                  Revoke
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
