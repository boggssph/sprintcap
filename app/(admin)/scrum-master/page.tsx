import dynamic from 'next/dynamic'

// Load client-only component dynamically to avoid importing `next-auth/react`
// at module scope in a server component. This prevents NextAuth from
// initializing during prerender/build time.
const ScrumMasterDashboardClient = dynamic(() => import('../../../components/ScrumMasterDashboardClient'), { ssr: false })

export default function ScrumMasterDashboard(){
  return <ScrumMasterDashboardClient />
}