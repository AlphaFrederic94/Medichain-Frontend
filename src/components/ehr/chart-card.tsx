'use client'

import type { ReactNode } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardAction } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export interface ChartCardProps {
  /** Chart card title */
  title: string
  /** The chart component(s) to render */
  children: ReactNode
  /** Optional action button in the header (e.g., time range selector) */
  action?: ReactNode
  /** Optional subtitle/description */
  subtitle?: string
  /** Additional class names */
  className?: string
}

export function ChartCard({
  title,
  children,
  action,
  subtitle,
  className,
}: ChartCardProps) {
  return (
    <Card className={cn('animate-fade-in', className)}>
      <CardHeader>
        <div className="space-y-0.5">
          <CardTitle className="text-base font-semibold">{title}</CardTitle>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
        {action && <CardAction>{action}</CardAction>}
      </CardHeader>
      <CardContent className="pt-0">
        <div className="w-full">{children}</div>
      </CardContent>
    </Card>
  )
}
