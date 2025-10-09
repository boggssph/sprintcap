"use client"

import * as React from "react"
import { X } from "lucide-react"
import { Slot } from "./slot"

import { cn } from "@/lib/utils"

/** Minimal non-Radix Dialog implementation preserving the exported API used
 * across the app. This provides an overlay, centered content, a trigger to
 * open/close, and simple header/footer/title/description helpers. It's
 * intentionally lightweight and made to satisfy tests and basic UI needs.
 */

type DialogState = {
  open: boolean
  setOpen: (v: boolean) => void
}

const DialogContext = React.createContext<DialogState | null>(null)

type DialogProps = React.PropsWithChildren<{ open?: boolean; defaultOpen?: boolean; onOpenChange?: (open: boolean) => void }>

const Dialog: React.FC<DialogProps> = ({ children, defaultOpen, open: openProp, onOpenChange }) => {
  const [openState, setOpenState] = React.useState<boolean>(() => !!defaultOpen)

  // If component is controlled via `open` prop, sync local state
  React.useEffect(() => {
    if (typeof openProp === 'boolean') setOpenState(openProp)
  }, [openProp])

  // Wrapped setter that also notifies parent via onOpenChange when present
  const setOpen = React.useCallback((v: boolean) => {
    setOpenState(v)
    onOpenChange?.(v)
  }, [onOpenChange])

  return <DialogContext.Provider value={{ open: openState, setOpen }}>{children}</DialogContext.Provider>
}

type TriggerProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }

const DialogTrigger = React.forwardRef<HTMLButtonElement, TriggerProps>(({ children, onClick, asChild = false, ...props }, ref) => {
  const ctx = React.useContext(DialogContext)
  if (!ctx) return null
  const { setOpen } = ctx

  if (asChild) {
    return (
      <Slot
        ref={ref as unknown as React.Ref<HTMLElement>}
        onClick={(e: React.MouseEvent) => {
          const cast = onClick as unknown as ((ev: React.MouseEvent) => void) | undefined
          cast?.(e)
          setOpen(true)
        }}
        {...props}
      >
        {children}
      </Slot>
    )
  }

  return (
    <button
      ref={ref}
      type="button"
      onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
        const cast = onClick as unknown as ((ev: React.MouseEvent<HTMLButtonElement>) => void) | undefined
        cast?.(e)
        setOpen(true)
      }}
      {...props}
    >
      {children}
    </button>
  )
})
DialogTrigger.displayName = "DialogTrigger"

const DialogPortal: React.FC<React.PropsWithChildren> = ({ children }) => {
  // keep simple: render in place (tests don't require real portal)
  return <>{children}</>
}

const DialogClose = React.forwardRef<HTMLButtonElement, TriggerProps>(({ children, onClick, asChild = false, ...props }, ref) => {
  const ctx = React.useContext(DialogContext)
  if (!ctx) return null
  const { setOpen } = ctx

  if (asChild) {
    return (
      <Slot
        ref={ref as unknown as React.Ref<HTMLElement>}
        onClick={(e: React.MouseEvent) => {
          const cast = onClick as unknown as ((ev: React.MouseEvent) => void) | undefined
          cast?.(e)
          setOpen(false)
        }}
        {...props}
      >
        {children}
      </Slot>
    )
  }

  return (
    <button
      ref={ref}
      type="button"
      onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
        const cast = onClick as unknown as ((ev: React.MouseEvent<HTMLButtonElement>) => void) | undefined
        cast?.(e)
        setOpen(false)
      }}
      {...props}
    >
      {children}
    </button>
  )
})
DialogClose.displayName = "DialogClose"

const DialogOverlay = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("fixed inset-0 z-50 bg-black/50 backdrop-blur-sm", className)}
    {...props}
  />
))
DialogOverlay.displayName = "DialogOverlay"

const DialogContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, children, ...props }, ref) => {
  const ctx = React.useContext(DialogContext)
  if (!ctx) return null

  const { open, setOpen } = ctx

  if (!open) return null

  return (
    <DialogPortal>
      <DialogOverlay onClick={() => setOpen(false)} />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        className={cn(
          "fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg border bg-white p-6 shadow-lg",
          className
        )}
        {...props}
      >
        {children}
        <button
          aria-label="Close"
          className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100"
          onClick={() => setOpen(false)}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
      </div>
    </DialogPortal>
  )
})
DialogContent.displayName = "DialogContent"

const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)} {...props} />
)
DialogHeader.displayName = "DialogHeader"

const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)} {...props} />
)
DialogFooter.displayName = "DialogFooter"

const DialogTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(({ className, ...props }, ref) => (
  <h2 ref={ref} className={cn("text-lg font-semibold leading-none tracking-tight", className)} {...props} />
))
DialogTitle.displayName = "DialogTitle"

const DialogDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
))
DialogDescription.displayName = "DialogDescription"

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}
