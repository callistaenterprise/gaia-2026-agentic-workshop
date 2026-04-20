'use client'

import { useState, useTransition } from 'react'
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts'
import type { TsnePoint } from '@/backend/services/embeddingService'

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: TsnePoint }> }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-background border rounded px-3 py-2 text-sm shadow">
      <p className="font-medium">{payload[0].payload.name}</p>
    </div>
  )
}

type Props = {
  initialPoints: TsnePoint[]
  embedQuery: (query: string) => Promise<{ snackPoints: TsnePoint[]; queryPoint: TsnePoint }>
}

export function SnackEmbeddingChart({ initialPoints, embedQuery }: Props) {
  const [snackPoints, setSnackPoints] = useState(initialPoints)
  const [queryPoint, setQueryPoint] = useState<TsnePoint | null>(null)
  const [query, setQuery] = useState('')
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!query.trim()) return
    startTransition(async () => {
      const result = await embedQuery(query.trim())
      setSnackPoints(result.snackPoints)
      setQueryPoint(result.queryPoint)
    })
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="flex gap-2 max-w-sm">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. something salty and crunchy"
          className="flex-1 rounded-md border bg-background px-3 py-1.5 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
        />
        <button
          type="submit"
          disabled={isPending || !query.trim()}
          className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground disabled:opacity-50"
        >
          {isPending ? 'Computing…' : 'Search'}
        </button>
      </form>

      {snackPoints.length === 0 ? (
        <p className="text-muted-foreground text-sm">No embeddings found. Run the indexer first.</p>
      ) : (
        <ResponsiveContainer width="100%" height={500}>
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="x" type="number" name="x" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis dataKey="y" type="number" name="y" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
            <Legend />
            <Scatter name="Snacks" data={snackPoints} fill="#6366f1" opacity={0.8} />
            {queryPoint && (
              <Scatter name={`"${queryPoint.name}"`} data={[queryPoint]} fill="#f97316" opacity={1} />
            )}
          </ScatterChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
