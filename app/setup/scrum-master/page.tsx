"use client"

import { useSession } from "next-auth/react"
import Link from "next/link"

export default function SetupScrumMaster(){
  const { data: session, status } = useSession()

  const handleGoogle = async () => {
    // NOTE: we lazy-import `signIn` from `next-auth/react` at the time of user
    // interaction instead of importing it at module top-level. Importing
    // `next-auth/react` at module scope can execute code that depends on
    // runtime environment (e.g. URL detection) and may run during Next's
    // prerender/build phase, causing "Invalid URL" or similar errors.
    // Lazy-importing here prevents NextAuth from initializing at build time.
    const { signIn } = await import('next-auth/react')
    // redirect handled by next-auth
    await signIn('google')
  }

  // While the session is loading, show a simple placeholder so the UI doesn't
  // flash the unauthenticated state briefly after redirect.
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

  // If the user is signed in, show a confirmation and a quick link to continue
  // (or sign out). This ensures that after the OAuth callback redirects the
  // browser back here, the UI reflects the authenticated state.
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
