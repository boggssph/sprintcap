import React from "react"
import { cn } from "@/lib/utils"

type MenuItem = { id: string; label: string; href?: string; children?: MenuItem[] }

export interface ScrumMasterNavProps {
  items: MenuItem[]
  className?: string
  sticky?: boolean
}

export const ScrumMasterNav: React.FC<ScrumMasterNavProps> = ({ items, className, sticky = true }) => {
  const [open, setOpen] = React.useState(false)

  // simple handler to toggle mobile menu
  const toggle = () => setOpen((v) => !v)

  // data attribute for breakpoint awareness in CSS (not strictly necessary)
  return (
    <nav
      data-testid="scrummaster-nav"
      className={cn(
        // base: center the nav, make it sticky on desktop (>=bp) if sticky=true
        // We apply sticky via CSS classes: on md (>=bp) use sticky; on small screens flow.
        `w-full ${sticky ? `md:sticky md:top-0 md:z-40` : ""}`,
        className
      )}
    >
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex w-full items-center justify-center">
          {/* Desktop / large: horizontal menu */}
          <ul className="hidden sm:flex items-center space-x-2" role="menubar">
            {items.map((it) => (
              <li key={it.id} role="none">
                <a role="menuitem" href={it.href} className="inline-flex h-9 items-center px-4 py-2 text-sm font-medium rounded-md" >
                  {it.label}
                </a>
              </li>
            ))}
          </ul>

          {/* Mobile: hamburger */}
          <div className="sm:hidden w-full">
            <div className="flex items-center justify-between">
              <button
                aria-expanded={open}
                aria-label="Toggle navigation"
                onClick={toggle}
                className="inline-flex items-center rounded-md p-2"
                data-testid="scrummaster-nav-toggle"
              >
                <span className="sr-only">Toggle navigation</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={open ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                </svg>
              </button>
            </div>
            {open && (
              <ul className="mt-2 space-y-1" role="menu">
                {items.map((it) => (
                  <li key={it.id}>
                    <a role="menuitem" href={it.href} className="block w-full px-4 py-2 text-left text-sm">
                      {it.label}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default ScrumMasterNav
