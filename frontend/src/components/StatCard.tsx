import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

export default function StatCard({
  title,
  value,
  unit,
  trend = '—',
}: {
  title: string
  value: number | string
  unit?: string
  trend?: 'up' | 'down' | '—'
}) {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <div className="text-fluid-xs text-ink-600">{title}</div>
      <div className="mt-2 flex items-end gap-1">
        <span className="text-fluid-2xl font-bold leading-none">{value}</span>
        {unit && <span className="text-fluid-base mb-1">{unit}</span>}
      </div>
      {trend !== '—' && (
        <div className="mt-2 flex items-center gap-1 text-fluid-xs text-warn">
          <TrendIcon className="h-3 w-3" />
          {trend}
        </div>
      )}
    </div>
  )
}
