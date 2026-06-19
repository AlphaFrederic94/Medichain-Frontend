'use client'

import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'

export interface FormSectionProps {
  /** Section title */
  title: string
  /** Optional description below the title */
  description?: string
  /** Form fields / content */
  children: ReactNode
  /** Additional class names */
  className?: string
}

export function FormSection({
  title,
  description,
  children,
  className,
}: FormSectionProps) {
  return (
    <section className={cn('space-y-4', className)}>
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-foreground tracking-wide">
          {title}
        </h3>
        {description && (
          <p className="text-xs text-muted-foreground leading-relaxed">
            {description}
          </p>
        )}
      </div>
      <Separator className="opacity-50" />
      <div className="space-y-4">{children}</div>
    </section>
  )
}
