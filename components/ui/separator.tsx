"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

type SeparatorProps = React.HTMLAttributes<HTMLElement> & {
  orientation?: 'horizontal' | 'vertical'
  decorative?: boolean
}

const Separator = React.forwardRef<HTMLElement, SeparatorProps>(({ className, orientation = "horizontal", decorative = true, ...props }, ref) => (
  <hr
    ref={ref as React.Ref<HTMLHRElement>}
    aria-hidden={decorative}
    className={cn("shrink-0 bg-border", orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]", className)}
    {...props}
  />
))
Separator.displayName = "Separator"

export { Separator }
