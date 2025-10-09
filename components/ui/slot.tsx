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

    // Use a narrow props shape for cloneElement to avoid using `any` while
    // still allowing arbitrary HTML attributes to be forwarded.
    const forwardProps = props as Record<string, unknown>
    return React.cloneElement(child, {
      ...forwardProps,
      className: mergedClassName,
      // cloneElement accepts ref in the second argument
      ref,
    } as unknown as Record<string, unknown>)
  }
)

Slot.displayName = "Slot"

export { Slot }
