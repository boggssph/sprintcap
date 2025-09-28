"use client"

import './globals.css'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function Landing() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return
    if (session) {
      // Redirect based on role after sign-in
      const role = (session.user as any)?.role
      if (role === 'ADMIN') {
        router.push('/admin')
      } else if (role === 'SCRUM_MASTER') {
        router.push('/dashboard/scrum-master')
      } else {
        router.push('/dashboard/member')
      }
    }
  }, [session, status, router])

  const handleGoogle = async () => {
    const { signIn } = await import('next-auth/react')
    await signIn('google')
  }

  if (status === 'loading') {
    return (
      <main className="min-h-screen bg-white text-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Signing you in...</p>
        </div>
      </main>
    )
  }

  if (session) {
    return (
      <main className="min-h-screen bg-white text-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Redirecting to your dashboard...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-white text-gray-900 flex items-center justify-center">
      <div className="max-w-3xl w-full p-10">
        <header className="mb-12 text-center">
          <h1 className="text-5xl font-light tracking-tight">Sprint Capacity</h1>
          <p className="mt-4 text-lg text-gray-600">A minimalist approach to sprint capacity planning.</p>
        </header>

        <section className="bg-gray-50 rounded-xl p-8 shadow-sm">
          <p className="text-gray-700 mb-6 text-center">Designed with clarity. Inspired by simple, tactile interfaces.</p>
          <div className="text-center">
            <button onClick={handleGoogle} className="px-6 py-3 bg-black text-white rounded-md">Continue with Google</button>
          </div>
        </section>

        <footer className="mt-12 text-center text-sm text-gray-500">Built with focus — minimal dependencies.</footer>
      </div>
    </main>
  )
}
