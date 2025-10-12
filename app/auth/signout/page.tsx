import Link from 'next/link'

export default function SignOut(){
  return (
    <main className="flex-1 flex items-center justify-center bg-white">
      <div className="w-full max-w-md bg-gray-50 p-8 rounded-md shadow text-center">
        <h2 className="text-2xl mb-4">Signed Out Successfully</h2>
        <p className="mb-4 text-sm text-gray-600">You have been signed out of SprintCap. Thank you for using our platform!</p>
        <Link href="/">
          <span className="inline-block mt-4 px-4 py-2 bg-black text-white rounded cursor-pointer hover:bg-gray-800 transition-colors">Return to Home</span>
        </Link>
      </div>
    </main>
  )
}