"use client"

import { useSession } from 'next-auth/react'
import Link from 'next/link'

export default function ScrumMasterClient(){
  const { data: session, status } = useSession()

  const handleGoogle = async () => {
    const { signIn } = await import('next-auth/react')
    await signIn('google')
  }

  if (status === 'loading') {
    return (
      <main className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-full max-w-md bg-gray-50 p-8 rounded-md shadow text-center">
          <h2 className="text-2xl mb-6">Scrum Master</h2>
          <p className="text-sm text-gray-600">Checking authentication…</p>
        </div>
      </main>
    )
  }

  if (session) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-full max-w-md bg-gray-50 p-8 rounded-md shadow text-center">
          <h2 className="text-2xl mb-6">Welcome, {session.user?.name ?? session.user?.email}</h2>
          <p className="mb-4 text-sm text-gray-600">You're signed in as the Scrum Master candidate. If this is the first registered Scrum Master, your account will be promoted automatically.</p>
          <div className="flex gap-3 justify-center">
            <Link href="/" className="px-4 py-2 bg-black text-white rounded">Continue</Link>
            <form action="/api/auth/signout" method="post">
              <button type="submit" className="px-4 py-2 border rounded">Sign out</button>
            </form>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-md bg-gray-50 p-8 rounded-md shadow text-center">
        <h2 className="text-2xl mb-6">Scrum Master</h2>
        <p className="mb-4 text-sm text-gray-600">Sign in with Google. If this is the first registered Scrum Master, your account will be promoted automatically.</p>
        <p className="mb-2 text-xs text-gray-500">Invite-only: sign in with the email your invitation was sent to. Unauthorized sign-ins will be blocked.</p>
        <button onClick={handleGoogle} className="w-full py-3 bg-black text-white rounded">Continue with Google</button>
      </div>
    </main>
  )
}
