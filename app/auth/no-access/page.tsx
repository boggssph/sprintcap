import Link from 'next/link'

export default function NoAccess(){
  return (
    <main className="flex-1 flex items-center justify-center bg-white">
      <div className="w-full max-w-md bg-gray-50 p-8 rounded-md shadow text-center">
        <h2 className="text-2xl mb-4">Access Restricted</h2>
        <p className="mb-4 text-sm text-gray-600">Your Google account is not authorized to create or join teams here. Ask your Scrum Master to invite you.</p>
        <Link href="/">
          <span className="inline-block mt-4 px-4 py-2 bg-black text-white rounded cursor-pointer">Return Home</span>
        </Link>
      </div>
    </main>
  )
}
