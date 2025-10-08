import React from 'react'

type Props = React.PropsWithChildren<{ className?: string }>

// Simple wrapper used to enforce a single page container width across the
// Scrum Master UI. Matches the overview container: `max-w-7xl` with the
// same horizontal padding and centering.
export default function CenteredContainer({ children, className = '' }: Props) {
  return (
    <div className={`${className} w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`}>{children}</div>
  )
}
