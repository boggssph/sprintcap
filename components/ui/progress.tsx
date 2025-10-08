"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

type ProgressProps = React.HTMLAttributes<HTMLDivElement> & {
  value?: number
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, ...props }, ref) => {
    const pct = Math.max(0, Math.min(100, value))

    return (
      <div
        ref={ref}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        className={cn("relative h-2 w-full overflow-hidden rounded-full bg-primary/20", className)}
        {...props}
      >
        <div
          className="absolute left-0 top-0 h-full bg-primary transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    )
  }
)
Progress.displayName = "Progress"

export { Progress }
