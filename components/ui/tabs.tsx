"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

/** Minimal Tabs implementation that preserves the exported API used across
 * the app. It's a controlled tab set using local state and simple role
 * attributes for accessibility. Not a full-featured replacement but good for
 * tests and basic UI.
 */

type TabsProps = React.PropsWithChildren<{ defaultValue?: string; value?: string; onValueChange?: (v: string) => void; className?: string }>

const TabsContext = React.createContext<null | { value?: string; setValue: (v: string) => void }>(null)

const Tabs: React.FC<TabsProps> = ({ children, defaultValue, value: valueProp, onValueChange, className }) => {
  const [valueState, setValueState] = React.useState<string | undefined>(defaultValue)

  React.useEffect(() => {
    if (typeof valueProp === 'string') setValueState(valueProp)
  }, [valueProp])

  const setValue = React.useCallback((v: string) => {
    setValueState(v)
    onValueChange?.(v)
  }, [onValueChange])

  return (
    <TabsContext.Provider value={{ value: valueState, setValue }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  )
}

const TabsList = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} role="tablist" className={cn("inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground", className)} {...props} />
))
TabsList.displayName = "TabsList"

import { Slot } from "./slot"

type TabsTriggerProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean; value?: string }

const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(({ className, asChild = false, value, ...props }, ref) => {
  const ctx = React.useContext(TabsContext)
  const isActive = ctx?.value === value

  if (asChild) {
    return (
      <Slot
        ref={ref as unknown as React.Ref<HTMLElement>}
        role="tab"
        aria-selected={isActive}
        data-state={isActive ? 'active' : 'inactive'}
        className={cn("inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium transition-all", className)}
        onClick={() => value && ctx?.setValue(value)}
        {...props}
      />
    )
  }

  return (
    <button
      ref={ref}
      role="tab"
      aria-selected={isActive}
      data-state={isActive ? 'active' : 'inactive'}
      className={cn("inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium transition-all", className)}
      onClick={() => value && ctx?.setValue(value)}
      {...props}
    />
  )
})
TabsTrigger.displayName = "TabsTrigger"

const TabsContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { value?: string }>(({ className, value, children, ...props }, ref) => {
  const ctx = React.useContext(TabsContext)
  if (typeof value === 'string' && ctx?.value !== value) return null
  return (
    <div ref={ref} role="tabpanel" className={cn("mt-2", className)} {...props}>
      {children}
    </div>
  )
})
TabsContent.displayName = "TabsContent"

export { Tabs, TabsList, TabsTrigger, TabsContent }
