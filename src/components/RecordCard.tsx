import type { Feeding, Diaper } from '../types'
import { Trash2 } from 'lucide-react'

function feedingLabel(t: Feeding['type']): string {
  return { formula: '奶粉', breast_left: '左乳', breast_right: '右乳', breast_both: '双侧' }[t]
}

function diaperLabel(t: Diaper['type']): string {
  return { pee: '尿尿', poop: '便便', both: '两者' }[t]
}

function fmtTime(d: Date): string {
  return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

export default function RecordCard({
  feeding,
  diaper,
  onDelete,
}: {
  feeding?: Feeding
  diaper?: Diaper
  onDelete?: (id: string) => void
}) {
  if (!feeding && !diaper) return null

  const label = feeding ? feedingLabel(feeding.type) : diaperLabel(diaper!.type)
  const sub = (() => {
    if (feeding) {
      if (feeding.type === 'formula') return `${feeding.amount ?? 0}ml`
      if (feeding.durationSec != null) return `${Math.floor(feeding.durationSec / 60)}分钟`
      return ''
    }
    if (diaper) {
      if (diaper.hadRash) return '红臀'
      return [diaper.color, diaper.consistency].filter(Boolean).join(' · ') || ''
    }
    return ''
  })()

  const time = feeding ? fmtTime(feeding.startedAt) : fmtTime(diaper!.recordedAt)
  const id = feeding?.id ?? diaper!.id

  return (
    <div style={{ containerType: 'inline-size' }} className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm">
      <div>
        <div className="font-semibold text-fluid-lg">{label}</div>
        <div className="text-fluid-xs text-ink-600">
          {time}
          {sub ? ` · ${sub}` : ''}
        </div>
      </div>
      {onDelete && (
        <button
          type="button"
          onClick={() => onDelete(id)}
          aria-label="删除"
          className="rounded-full p-2 text-warn active:bg-gray-100"
        >
          <Trash2 className="h-5 w-5" />
        </button>
      )}
    </div>
  )
}
