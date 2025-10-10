"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Slot } from "./slot"

/**
 * Minimal, accessible Select implementation (non-Radix) that preserves the
 * shadcn-style API used in the app. It's intentionally simple: controlled value
 * via props, internal open state, and proper roles for testing (combobox/listbox/option).
 */

type SelectProps = React.PropsWithChildren<{
  value?: string
  onValueChange?: (v: string) => void
  disabled?: boolean
  name?: string
  className?: string
}>

type InternalContext = {
  open: boolean
  setOpen: (v: boolean) => void
  value?: string
  onValueChange?: (v: string) => void
  listboxId: string
}

const SelectContext = React.createContext<InternalContext | null>(null)

const Select: React.FC<SelectProps> = ({ children, value, onValueChange, disabled }) => {
  const [open, setOpen] = React.useState(false)
  // unique id for listbox -> used by aria-controls
  const listboxId = React.useId()

  return (
    <SelectContext.Provider value={{ open, setOpen, value, onValueChange, listboxId }}>
      <div className="relative inline-block w-full" aria-disabled={disabled}>
        {children}
      </div>
    </SelectContext.Provider>
  )
}

type TriggerProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean; 'aria-expanded'?: boolean }

const SelectTrigger = React.forwardRef<HTMLButtonElement, TriggerProps>(
  ({ className, children, disabled, asChild = false, 'aria-expanded': ariaExpanded, ...props }, ref) => {
    const ctx = React.useContext(SelectContext)
    if (!ctx) return null

    const { open, setOpen, listboxId } = ctx

    React.useEffect(() => {
      if (typeof ariaExpanded === 'boolean') setOpen(Boolean(ariaExpanded))
    }, [ariaExpanded, setOpen])
    if (asChild) {
      return (
        <Slot
          ref={ref as unknown as React.Ref<HTMLElement>}
          role="combobox"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-haspopup="listbox"
          aria-disabled={disabled}
          onClick={() => setOpen(!open)}
          className={cn(
            "flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          {...props}
        >
          <span className="truncate">{children}</span>
          <ChevronDown className="h-4 w-4 opacity-50 ml-2" />
        </Slot>
      )
    }

    return (
      <button
        ref={ref}
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-haspopup="listbox"
        disabled={disabled}
        onClick={() => setOpen(!open)}
        className={cn(
          "flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      >
        <span className="truncate">{children}</span>
        <ChevronDown className="h-4 w-4 opacity-50 ml-2" />
      </button>
    )
  }
)
SelectTrigger.displayName = "SelectTrigger"

const SelectValue: React.FC<{ placeholder?: string } & React.HTMLAttributes<HTMLSpanElement>> = ({ placeholder }) => (
  <span className="text-sm text-muted-foreground">{placeholder}</span>
)

const SelectContent: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ children, className }) => {
  const ctx = React.useContext(SelectContext)
  if (!ctx) return null
  const { open, listboxId } = ctx

  // Only render when open to prevent overlapping issues
  if (!open) return null

  return (
    <div
      id={listboxId}
      role="listbox"
      className={cn("absolute z-50 mt-1 w-full rounded-md border bg-popover text-popover-foreground shadow-md", className)}
    >
      <div className="p-1">{children}</div>
    </div>
  )
}

const SelectItem = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, children, onClick, value, ...props }, ref) => {
    const ctx = React.useContext(SelectContext)
    if (!ctx) return null

    const { setOpen, onValueChange, value: selected } = ctx

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      // preserve any user-provided onClick handler
      if (onClick) onClick(e as unknown as React.MouseEvent<HTMLButtonElement>)
      if (value && onValueChange) onValueChange(String(value))
      setOpen(false)
    }

    return (
      <button
        ref={ref}
        type="button"
        role="option"
        aria-selected={String(value) === String(selected)}
        value={value}
        className={cn(
          "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm text-left hover:bg-accent",
          className
        )}
        onClick={handleClick}
        {...props}
      >
        {children}
      </button>
    )
  }
)
SelectItem.displayName = "SelectItem"

export { Select, SelectTrigger, SelectContent, SelectItem, SelectValue }
