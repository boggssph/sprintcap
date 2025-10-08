"use client"

import * as React from "react"
import { Check, ChevronDown, ChevronUp } from "lucide-react"

import { cn } from "../../lib/utils.ts"
import { Slot } from "@/components/ui/slot"

// Minimal Select implementation matching the smaller API surface used by the app
const Select: React.FC<React.PropsWithChildren<{ value?: string; onValueChange?: (v: string) => void }>> = ({ children }) => (
  <div className="relative inline-block w-full">{children}</div>
)

const SelectGroup: React.FC<React.PropsWithChildren> = ({ children }) => <div>{children}</div>

const SelectValue: React.FC<{ placeholder?: string }> = ({ placeholder }) => <span className="text-sm text-muted-foreground">{placeholder}</span>

type TriggerProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }

const SelectTrigger = React.forwardRef<HTMLButtonElement, TriggerProps>(({ className, children, asChild = false, ...props }, ref) => {
  const Comp: any = asChild ? Slot : "button"
  return (
    <Comp ref={ref as any} type={asChild ? undefined : "button"} className={cn("flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm", className)} {...props}>
      {children}
      <ChevronDown className="h-4 w-4 opacity-50" />
    </Comp>
  )
})
SelectTrigger.displayName = "SelectTrigger"

const SelectScrollUpButton: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className, ...props }) => (
  <div className={cn("flex cursor-default items-center justify-center py-1", className)} {...props}>{children || <ChevronUp className="h-4 w-4" />}</div>
)

const SelectScrollDownButton: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className, ...props }) => (
  <div className={cn("flex cursor-default items-center justify-center py-1", className)} {...props}>{children || <ChevronDown className="h-4 w-4" />}</div>
)

const SelectContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, children, ...props }, ref) => (
  <div ref={ref} className={cn("relative z-50 rounded-md border bg-popover text-popover-foreground shadow-md", className)} {...props}>
    <div className="p-1">{children}</div>
  </div>
))
SelectContent.displayName = "SelectContent"

const SelectLabel = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("px-2 py-1.5 text-sm font-semibold", className)} {...props} />
))
SelectLabel.displayName = "SelectLabel"

const SelectItem = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(({ className, children, ...props }, ref) => (
  <button ref={ref} type="button" role="option" className={cn("relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm text-left hover:bg-accent", className)} {...props}>
    <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center"><Check className="h-4 w-4" /></span>
    <span>{children}</span>
  </button>
))
SelectItem.displayName = "SelectItem"

const SelectSeparator = React.forwardRef<HTMLHRElement, React.HTMLAttributes<HTMLHRElement>>(({ className, ...props }, ref) => (
  <hr ref={ref as React.Ref<HTMLHRElement>} className={cn("-mx-1 my-1 h-px bg-muted", className)} {...props} />
))
SelectSeparator.displayName = "SelectSeparator"

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
}
