import './globals.css'
import BarChart from '../components/BarChart'

export default function Page() {
  const data = [
    { label: 'Back-end', capacity: 204.5, utilization: 180 },
    { label: 'Front-end', capacity: 172.5, utilization: 140 },
    { label: 'Testing', capacity: 109.5, utilization: 95 }
  ]

  return (
    <main className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-semibold mb-4">Sprint Capacity Summary (Demo)</h1>
        <div className="space-y-4">
          <BarChart data={data} />
        </div>
      </div>
    </main>
  )
}
