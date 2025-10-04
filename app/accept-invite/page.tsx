"use client"
import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/navigation'

export default function AcceptInvitePage(){
  const [msg, setMsg] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const params = useSearchParams()
  const token = params?.get('token') || ''

  const [email, setEmail] = useState(params?.get('email') || '')
  const router = useRouter()

  async function handleAccept(){
    setLoading(true)
    setMsg(null)
    try {
      const res = await fetch('/api/accept-invite', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, userEmail: email }) })
      if (res.ok) {
        const data = await res.json()
        setMsg('Invitation accepted! Redirecting...')
        // Redirect after successful acceptance
        setTimeout(() => {
          if (data.redirectUrl) {
            router.push(data.redirectUrl)
          } else {
            router.push('/')
          }
        }, 2000)
      } else {
        const e = await res.json()
        setMsg('Error: ' + (e.error || 'accept failed'))
      }
    } catch (e: unknown) {
      if (e instanceof Error) {
        setMsg('Error: ' + e.message)
      } else {
        setMsg('Error: Unknown error')
      }
    }
    setLoading(false)
  }

  return (
    <main className="flex-1 flex items-center justify-center bg-white p-8">
      <div className="max-w-xl w-full bg-gray-50 p-6 rounded">
        <h2 className="text-xl mb-4">Accept Invite</h2>
        <p className="mb-4 text-sm">Token: <code>{token}</code></p>
        <label className="block mb-2 text-sm">Email</label>
        <input data-testid="accept-email-input" className="w-full mb-4 p-2 border rounded" value={email} onChange={e=>setEmail(e.target.value)} />
        <div className="flex gap-2">
          <button data-testid="accept-invite-btn" className="py-2 px-4 bg-blue-600 text-white rounded" onClick={handleAccept} disabled={loading}>{loading ? 'Working...' : 'Accept Invite'}</button>
        </div>
        {msg && <p className="mt-4 text-sm">{msg}</p>}
      </div>
    </main>
  )
}
