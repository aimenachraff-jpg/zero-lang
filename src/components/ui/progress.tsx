'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number
  max?: number
  showLabel?: boolean
}

function Progress({ className, value = 0, max = 100, showLabel = false, ...props }: ProgressProps) {
  const percentage = Math.max(0, Math.min(100, (value / max) * 100))

  return (
    <div className={cn('relative h-2 w-full overflow-hidden rounded-full bg-secondary', className)} {...props}>
      <div
        className="h-full bg-primary transition-all duration-300 ease-out"
        style={{ width: `${percentage}%` }}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={showLabel ? `${Math.round(percentage)}%` : undefined}
      />
      {showLabel && (
        <span className="absolute right-0 top-0 text-xs font-medium text-muted-foreground">
          {Math.round(percentage)}%
        </span>
      )}
    </div>
  )
}

export { Progress }