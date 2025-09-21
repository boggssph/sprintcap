import './globals.css'
import Link from 'next/link'

export default function Landing() {
  return (
    <main className="min-h-screen bg-white text-gray-900 flex items-center justify-center">
      <div className="max-w-3xl w-full p-10">
        <header className="mb-12 text-center">
          <h1 className="text-5xl font-light tracking-tight">Sprint Capacity</h1>
          <p className="mt-4 text-lg text-gray-600">A minimalist approach to sprint capacity planning.</p>
        </header>

        <section className="bg-gray-50 rounded-xl p-8 shadow-sm">
          <p className="text-gray-700 mb-6">Designed with clarity. Inspired by simple, tactile interfaces.</p>
          <div className="flex gap-4">
            <Link href="/setup/scrum-master" className="px-6 py-3 bg-black text-white rounded-md">Become a Scrum Master</Link>
            <Link href="/app" className="px-6 py-3 border border-gray-200 rounded-md">View Demo</Link>
          </div>
        </section>

        <footer className="mt-12 text-center text-sm text-gray-500">Built with focus — minimal dependencies.</footer>
      </div>
    </main>
  )
}
