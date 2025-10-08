import React from 'react'
import CenteredContainer from './CenteredContainer'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

type Props = React.PropsWithChildren<{ className?: string; title?: string; subtitle?: string; actions?: React.ReactNode }>

export default function MainShell({ children, className = '', title, subtitle, actions }: Props) {
  return (
    <CenteredContainer className={cn('py-6', className)}>
      <div className="w-full">
        {/* If title or subtitle provided, render a thin header above the main content to give consistent page rhythm */}
        {title ? (
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900">{title}</h1>
              {subtitle && <p className="text-sm text-slate-600 mt-1">{subtitle}</p>}
            </div>
            {actions ? <div>{actions}</div> : null}
          </div>
        ) : null}

        <div className="space-y-6">{children}</div>
      </div>
    </CenteredContainer>
  )
}

// Section helper wraps children in a shadcn Card so pages can compose consistent cards.
export function MainShellSection({ children, className = '' }: React.PropsWithChildren<{ className?: string }>) {
  return (
    <Card className={cn('mx-auto w-full', className)}>
      <CardContent>{children}</CardContent>
    </Card>
  )
}
