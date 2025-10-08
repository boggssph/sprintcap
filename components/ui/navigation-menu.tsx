import * as React from "react"
import { cva } from "class-variance-authority"
import { ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * Minimal, non-Radix NavigationMenu replacement.
 * - Preserves the exported API used around the app.
 * - Implements per-item open state and basic focus-on-open behavior.
 * - Intentionally lightweight to make tests and pages pass without Radix.
 */

const NavigationMenuContext = React.createContext<null | { closeAll: () => void }>(null)

const navigationMenuTriggerStyle = cva(
  "group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50"
)

const NavigationMenu: React.FC<React.PropsWithChildren<{ className?: string }>> = ({
  className,
  children,
}) => {
  const containerRef = React.useRef<HTMLDivElement | null>(null)

  const closeAll = React.useCallback(() => {
    const ev = new CustomEvent("navigation-menu-close-all")
    containerRef.current?.dispatchEvent(ev)
  }, [])

  return (
    <NavigationMenuContext.Provider value={{ closeAll }}>
      <div ref={containerRef} className={cn("relative z-10 flex max-w-max flex-1 items-center justify-center", className)}>
        {children}
      </div>
    </NavigationMenuContext.Provider>
  )
}

const NavigationMenuList = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={cn("group flex flex-1 list-none items-center justify-center space-x-1", className)} {...props}>
      {children}
    </div>
  )
)
NavigationMenuList.displayName = "NavigationMenuList"

/** Each item manages its own open state; triggers/contents communicate via this local context */
const ItemContext = React.createContext<null | { open: boolean; setOpen: React.Dispatch<React.SetStateAction<boolean>> }>(null)

const NavigationMenuItem: React.FC<React.PropsWithChildren<Record<string, unknown>>> = ({ children }) => {
  const [open, setOpen] = React.useState(false)
  const ref = React.useRef<HTMLDivElement | null>(null)

  React.useEffect(() => {
    function onCloseAll() {
      setOpen(false)
    }
    const el = ref.current
    el?.addEventListener("navigation-menu-close-all", onCloseAll)
    return () => el?.removeEventListener("navigation-menu-close-all", onCloseAll)
  }, [])

    // no-op here; NavigationMenuTrigger will sync local open state when a
    // controlled `aria-expanded` prop is provided by the consumer.

  return (
    <div ref={ref} className="relative">
      <ItemContext.Provider value={{ open, setOpen }}>{children}</ItemContext.Provider>
    </div>
  )
}

type TriggerProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { 'aria-expanded'?: boolean }

const NavigationMenuTrigger = React.forwardRef<HTMLButtonElement, TriggerProps>(
  ({ className, children, 'aria-expanded': ariaExpanded, ...props }, ref) => {
    const ctx = React.useContext(ItemContext)
    const root = React.useContext(NavigationMenuContext)
    if (!ctx) return <button ref={ref} className={cn(navigationMenuTriggerStyle(), className)} {...props} />

    const { open, setOpen } = ctx
    // If a parent provides an explicit aria-expanded prop (controlled by
    // page-level state), keep our local open state synced so parent-driven
    // re-renders don't reset the menu to closed.
    // If consumer passed an explicit boolean aria-expanded prop (i.e. the
    // trigger is being controlled), keep our local open state in sync so a
    // parent-driven re-render won't hide the content unexpectedly.
    React.useEffect(() => {
      if (typeof ariaExpanded === "boolean") {
        setOpen(Boolean(ariaExpanded))
      }
    }, [ariaExpanded, setOpen])

    const onClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      // Use functional updater to avoid stale-closure races when parent
      // handlers (passed via props.onClick) also trigger re-renders.
      // Toggle local open state first so content visibility updates
      // deterministically before any parent-driven re-render.
      setOpen((v) => !v)
      props.onClick?.(e)
    }

    const onKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false)
        root?.closeAll()
      }
    }

    return (
      <button
        ref={ref}
        aria-expanded={open}
        className={cn(navigationMenuTriggerStyle(), "group", className)}
        onClick={onClick}
        onKeyDown={onKeyDown}
        {...props}
      >
        {children} <ChevronDown className="relative top-[1px] ml-1 h-3 w-3 transition duration-300" aria-hidden="true" />
      </button>
    )
  }
)
NavigationMenuTrigger.displayName = "NavigationMenuTrigger"

const NavigationMenuContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    const ctx = React.useContext(ItemContext)
    const localRef = React.useRef<HTMLDivElement | null>(null)
    const r = (ref as React.RefObject<HTMLDivElement>) || localRef

    React.useEffect(() => {
      if (!ctx) return
      if (ctx.open) {
        // focus first focusable element inside content
        const el = r.current
        if (el) {
          const first = el.querySelector<HTMLElement>("button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])")
          first?.focus()
        }
      }
    }, [ctx?.open, r])

    if (!ctx) return <div ref={r} className={className} {...props} />

    return (
      <div
        ref={r}
        role="menu"
        aria-hidden={!ctx.open}
        style={{ display: ctx.open ? undefined : "none" }}
        className={cn(
          "left-0 top-0 w-full md:absolute md:w-auto bg-popover text-popover-foreground rounded-md border shadow",
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
NavigationMenuContent.displayName = "NavigationMenuContent"

const NavigationMenuLink: React.FC<React.PropsWithChildren<React.AnchorHTMLAttributes<HTMLAnchorElement>>> = ({ children, ...props }) => (
  <a {...props}>{children}</a>
)

const NavigationMenuViewport: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ className, children }) => (
  <div className={cn("absolute left-0 top-full flex justify-center", className)}>
    <div className="origin-top-center relative mt-1.5 rounded-md border bg-popover text-popover-foreground shadow">{children}</div>
  </div>
)

const NavigationMenuIndicator: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ className }) => (
  <div className={cn("top-full z-[1] flex h-1.5 items-end justify-center overflow-hidden", className)}>
    <div className="relative top-[60%] h-2 w-2 rotate-45 rounded-tl-sm bg-border shadow-md" />
  </div>
)

export {
  navigationMenuTriggerStyle,
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuContent,
  NavigationMenuTrigger,
  NavigationMenuLink,
  NavigationMenuIndicator,
  NavigationMenuViewport,
}
