"use client"

import { SessionProvider } from "next-auth/react"
import { Toaster } from 'sonner'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider
      refetchInterval={5 * 60} // Refetch session every 5 minutes
      refetchOnWindowFocus={true}
    >
      {/* Global toast provider for user-facing notifications */}
      <Toaster richColors position="top-right" />
      {children}
    </SessionProvider>
  )
}
