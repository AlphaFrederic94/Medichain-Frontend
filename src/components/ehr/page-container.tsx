'use client'

import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface PageContainerProps {
  /** Page title */
  title: string
  /** Optional subtitle */
  subtitle?: string
  /** Action buttons in the header */
  actions?: ReactNode
  /** Page content */
  children: ReactNode
  /** Additional class names for the container */
  className?: string
}

export function PageContainer({
  title,
  subtitle,
  actions,
  children,
  className,
}: PageContainerProps) {
  return (
    <div
      className={cn(
        'mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6',
        className
      )}
    >
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
        <div className="space-y-1 min-w-0">
          <h1 className="text-2xl font-bold text-foreground tracking-tight truncate">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-3 shrink-0">{actions}</div>
        )}
      </div>

      {/* Content */}
      <div className="animate-fade-in">{children}</div>
    </div>
  )
}
