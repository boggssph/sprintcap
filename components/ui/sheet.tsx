"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Slot } from "./slot"

/** Minimal non-Radix Sheet (drawer) implementation that preserves the exported
 * API. Uses the same class names and cva variants so consumer styling stays
 * consistent. It's intentionally minimal and uses an internal open state.
 */

type SheetState = { open: boolean; setOpen: (v: boolean) => void }
const SheetContext = React.createContext<SheetState | null>(null)

const Sheet: React.FC<React.PropsWithChildren<{ defaultOpen?: boolean }>> = ({ children, defaultOpen }) => {
  const [open, setOpen] = React.useState(!!defaultOpen)
  return <SheetContext.Provider value={{ open, setOpen }}>{children}</SheetContext.Provider>
}

type TriggerProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean; open?: boolean }

const SheetTrigger = React.forwardRef<HTMLButtonElement, TriggerProps>(({ children, onClick, asChild = false, open: openProp, ...props }, ref) => {
  const ctx = React.useContext(SheetContext)
  if (!ctx) return null
  const { setOpen } = ctx

  React.useEffect(() => {
    if (typeof openProp === 'boolean') setOpen(Boolean(openProp))
  }, [openProp, setOpen])

  const Comp: any = asChild ? Slot : "button"

  return (
    <Comp
      ref={ref}
      type={asChild ? undefined : "button"}
      onClick={(e: any) => {
        onClick?.(e)
        setOpen(true)
      }}
      {...props}
    >
      {children}
    </Comp>
  )
})
SheetTrigger.displayName = "SheetTrigger"

const SheetClose = React.forwardRef<HTMLButtonElement, TriggerProps>(({ children, onClick, asChild = false, open: openProp, ...props }, ref) => {
  const ctx = React.useContext(SheetContext)
  if (!ctx) return null
  const { setOpen } = ctx

  React.useEffect(() => {
    if (typeof openProp === 'boolean') setOpen(Boolean(openProp))
  }, [openProp, setOpen])

  const Comp: any = asChild ? Slot : "button"

  return (
    <Comp
      ref={ref}
      type={asChild ? undefined : "button"}
      onClick={(e: any) => {
        onClick?.(e)
        setOpen(false)
      }}
      {...props}
    >
      {children}
    </Comp>
  )
})
SheetClose.displayName = "SheetClose"
const SheetPortal: React.FC<React.PropsWithChildren> = ({ children }) => <>{children}</>

const SheetOverlay = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("fixed inset-0 z-50 bg-black/80", className)} {...props} />
))
SheetOverlay.displayName = "SheetOverlay"

const sheetVariants = cva(
  "fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out",
  {
    variants: {
      side: {
        top: "inset-x-0 top-0 border-b",
        bottom: "inset-x-0 bottom-0 border-t",
        left: "inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm",
        right: "inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm",
      },
    },
    defaultVariants: { side: "right" },
  }
)

interface SheetContentProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof sheetVariants> {}

const SheetContent = React.forwardRef<HTMLDivElement, SheetContentProps>(({ side = "right", className, children, ...props }, ref) => {
  const ctx = React.useContext(SheetContext)
  if (!ctx) return null
  const { open, setOpen } = ctx
  if (!open) return null

  return (
    <SheetPortal>
      <SheetOverlay onClick={() => setOpen(false)} />
      <div ref={ref} className={cn(sheetVariants({ side }), className)} {...props}>
        <button className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100" onClick={() => setOpen(false)}>
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
        {children}
      </div>
    </SheetPortal>
  )
})
SheetContent.displayName = "SheetContent"

const SheetHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col space-y-2 text-center sm:text-left", className)} {...props} />
)
SheetHeader.displayName = "SheetHeader"

const SheetFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)} {...props} />
)
SheetFooter.displayName = "SheetFooter"

const SheetTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(({ className, ...props }, ref) => (
  <h3 ref={ref} className={cn("text-lg font-semibold text-foreground", className)} {...props} />
))
SheetTitle.displayName = "SheetTitle"

const SheetDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
))
SheetDescription.displayName = "SheetDescription"

export {
  Sheet,
  SheetPortal,
  SheetOverlay,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
}
