"use client"
import { signIn } from 'next-auth/react'

export default function SetupScrumMaster(){
  const handleGoogle = async () => {
    // redirect handled by next-auth
    await signIn('google')
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-md bg-gray-50 p-8 rounded-md shadow text-center">
        <h2 className="text-2xl mb-6">Scrum Master</h2>
        <p className="mb-4 text-sm text-gray-600">Sign in with Google. If this is the first registered Scrum Master, your account will be promoted automatically.</p>
        <button onClick={handleGoogle} className="w-full py-3 bg-black text-white rounded">Continue with Google</button>
      </div>
    </main>
  )
}
