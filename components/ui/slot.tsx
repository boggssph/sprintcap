"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

// Minimal Slot implementation to emulate @radix-ui/react-slot's asChild semantics.
// It clones a single child element and merges/forwards props and ref.
type ElementWithClassProp = React.ReactElement & { props: { className?: string } }

const Slot = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(
  ({ children, className, ...props }, ref) => {
    const child = React.Children.only(children) as ElementWithClassProp | null

    if (!React.isValidElement(child)) {
      return <>{children}</>
    }

    const existingClassName = (child.props && (child.props.className ?? "")) || ""
    const mergedClassName = cn(existingClassName, className)

    // cast to any to avoid strict generic mismatch from cloneElement
    return React.cloneElement(child as any, {
      ...(props as any),
      className: mergedClassName,
      ref,
    } as any)
  }
)

Slot.displayName = "Slot"

export { Slot }
