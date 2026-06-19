'use client'

import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export interface StatCardProps {
  /** Metric title */
  title: string
  /** Primary value displayed */
  value: string | number
  /** Trend direction: up, down, or neutral */
  trend?: 'up' | 'down' | 'neutral'
  /** Trend percentage (e.g. "12.5") */
  trendPercentage?: string | number
  /** Optional description below the value */
  description?: string
  /** Accent color for the bottom border. Defaults to primary (terracotta) */
  accentColor?: 'primary' | 'emerald-accent' | 'amber-warm' | 'destructive'
  /** Additional class names */
  className?: string
}

const accentMap = {
  primary: 'border-b-primary',
  'emerald-accent': 'border-b-emerald-accent',
  'amber-warm': 'border-b-amber-warm',
  destructive: 'border-b-destructive',
}

const trendIconMap = {
  up: TrendingUp,
  down: TrendingDown,
  neutral: Minus,
}

const trendColorMap = {
  up: 'text-emerald-accent',
  down: 'text-destructive',
  neutral: 'text-muted-foreground',
}

export function StatCard({
  title,
  value,
  trend = 'neutral',
  trendPercentage,
  description,
  accentColor = 'primary',
  className,
}: StatCardProps) {
  const TrendIcon = trendIconMap[trend]

  return (
    <Card
      className={cn(
        'relative overflow-hidden border-b-2 animate-float-in',
        accentMap[accentColor],
        'py-0',
        className
      )}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1.5">
            <p className="text-sm font-medium text-muted-foreground tracking-wide">
              {title}
            </p>
            <p className="text-2xl font-bold tracking-tight text-foreground">
              {value}
            </p>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>

          {trendPercentage !== undefined && (
            <div
              className={cn(
                'flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold',
                trend === 'up' && 'bg-emerald-accent/10',
                trend === 'down' && 'bg-destructive/10',
                trend === 'neutral' && 'bg-muted',
                trendColorMap[trend]
              )}
            >
              <TrendIcon className="size-3.5" />
              <span>{trendPercentage}%</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
