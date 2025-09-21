"use client"
import { useState } from 'react'
import { signIn } from 'next-auth/react'

export default function SetupScrumMaster(){
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: any){
    e.preventDefault()
    setLoading(true)

    const res = await fetch('/api/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, name, makeScrumMaster: true }) })
    if (res.ok) {
      // sign in using credentials provider for dev
      await signIn('credentials', { redirect: true, email, name })
    } else {
      alert('Registration failed')
    }
    setLoading(false)
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-white">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-gray-50 p-8 rounded-md shadow">
        <h2 className="text-2xl mb-4">Scrum Master Setup</h2>
        <label className="block mb-2 text-sm">Name</label>
        <input className="w-full mb-4 p-2 border rounded" value={name} onChange={e=>setName(e.target.value)} />
        <label className="block mb-2 text-sm">Google Email</label>
        <input className="w-full mb-4 p-2 border rounded" value={email} onChange={e=>setEmail(e.target.value)} />
        <button className="w-full py-2 bg-black text-white rounded" disabled={loading}>{loading? 'Working...' : 'Register & Sign in'}</button>
      </form>
    </main>
  )
}
