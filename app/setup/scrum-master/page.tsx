"use client"

export default function SetupScrumMaster(){
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
