"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

/** Minimal tooltip implementation: simple hover/focus content rendering. */

const TooltipProvider: React.FC<React.PropsWithChildren> = ({ children }) => <>{children}</>

const Tooltip: React.FC<React.PropsWithChildren<{ content?: React.ReactNode }>> = ({ children }) => <>{children}</>

import { Slot } from "./slot"

type TooltipTriggerProps = React.HTMLAttributes<HTMLElement> & { asChild?: boolean; 'data-open'?: boolean }

const TooltipTrigger = React.forwardRef<HTMLElement, TooltipTriggerProps>(({ children, asChild = false, 'data-open': dataOpen, ...props }, ref) => {
  const Comp: any = asChild ? Slot : "span"
  // dataOpen is accepted for typing parity with other controlled components
  return (
    <Comp ref={ref as any} {...props}>
      {children}
    </Comp>
  )
})
TooltipTrigger.displayName = "TooltipTrigger"

const TooltipContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, children, ...props }, ref) => (
  <div ref={ref} role="tooltip" className={cn("z-50 overflow-hidden rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground", className)} {...props}>
    {children}
  </div>
))
TooltipContent.displayName = "TooltipContent"

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
