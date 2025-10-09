"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

/** Minimal tooltip implementation: simple hover/focus content rendering. */

const TooltipProvider: React.FC<React.PropsWithChildren<{ delayDuration?: number }>> = ({ children }) => <>{children}</>

const Tooltip: React.FC<React.PropsWithChildren<{ content?: React.ReactNode }>> = ({ children }) => <>{children}</>

import { Slot } from "./slot"

type TooltipTriggerProps = React.HTMLAttributes<HTMLElement> & { asChild?: boolean; 'data-open'?: boolean }

const TooltipTrigger = React.forwardRef<HTMLElement, TooltipTriggerProps>(({ children, asChild = false, ...props }, ref) => {
  if (asChild) {
    return (
      <Slot ref={ref as unknown as React.Ref<HTMLElement>} {...props}>
        {children}
      </Slot>
    )
  }

  return (
    <span ref={ref as unknown as React.Ref<HTMLElement>} {...props}>
      {children}
    </span>
  )
})
TooltipTrigger.displayName = "TooltipTrigger"

type TooltipContentProps = React.HTMLAttributes<HTMLDivElement> & { side?: 'top' | 'right' | 'bottom' | 'left'; align?: 'start' | 'center' | 'end'; hidden?: boolean }

const TooltipContent = React.forwardRef<HTMLDivElement, TooltipContentProps>(({ className, children, hidden, side, align, ...props }, ref) => (
  <div
    ref={ref}
    role="tooltip"
    data-side={side}
    data-align={align}
    hidden={hidden}
    className={cn("z-50 overflow-hidden rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground", className)}
    {...props}
  >
    {children}
  </div>
))
TooltipContent.displayName = "TooltipContent"

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
