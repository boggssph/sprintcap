import React from 'react'

type Item = {
  label: string
  capacity: number
  utilization: number
}

export default function BarChart({ data }: { data: Item[] }) {
  const max = Math.max(...data.map(d => Math.max(d.capacity, d.utilization)))
  const width = 600
  const height = data.length * 48

  return (
    <div className="bg-white shadow rounded p-4">
      <svg width={width} height={height} role="img" aria-label="Capacity chart">
        {data.map((d, i) => {
          const y = i * 48 + 12
          const capWidth = (d.capacity / max) * (width - 150)
          const useWidth = (d.utilization / max) * (width - 150)

          return (
            <g key={d.label} transform={`translate(0, ${y})`}>
              <text x={8} y={12} fontSize={12} fill="#111827">{d.label}</text>
              <rect x={120} y={0} width={capWidth} height={14} fill="#c7d2fe" rx={4} />
              <rect x={120} y={0} width={useWidth} height={14} fill="#4f46e5" rx={4} />
              <text x={120 + Math.max(useWidth, capWidth) + 8} y={12} fontSize={12} fill="#111827">{d.utilization}/{d.capacity}</text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
