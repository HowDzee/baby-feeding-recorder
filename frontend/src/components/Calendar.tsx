import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  subMonths,
  addMonths,
  format,
} from 'date-fns'

const WEEKDAYS = ['一', '二', '三', '四', '五', '六', '日']

export default function Calendar({ selected, onChange }: { selected: Date; onChange: (d: Date) => void }) {
  const [month, setMonth] = useState(() => startOfMonth(selected))

  const days = useMemo(() => {
    const start = startOfMonth(month)
    const end = endOfMonth(month)
    // Pad with days from previous month so Mon–Sun alignment looks natural
    const dayOffset = (start.getDay() + 6) % 7 // Mon=0 … Sun=6
    const from = new Date(start)
    from.setDate(from.getDate() - dayOffset)
    const to = new Date(end)
    to.setDate(to.getDate() + ((7 - ((end.getDay() + 6) % 7) - 1) % 7))
    return eachDayOfInterval({ start: from, end: to })
  }, [month])

  const today = useMemo(() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d }, [])

  return (
    <div className="select-none rounded-2xl bg-white p-4 shadow-sm">
      {/* header */}
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setMonth((m) => subMonths(m, 1))}
          className="rounded-full p-1.5 hover:bg-warm-100 active:bg-warm-200 text-ink-600"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <span className="text-fluid-base font-semibold text-ink-900">
          {format(month, 'yyyy年 M月')}
        </span>
        <button
          type="button"
          onClick={() => setMonth((m) => addMonths(m, 1))}
          className="rounded-full p-1.5 hover:bg-warm-100 active:bg-warm-200 text-ink-600"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* weekday headers */}
      <div className="mb-1 grid grid-cols-7 text-center text-fluid-xs text-ink-600 font-medium">
        {WEEKDAYS.map((w) => (
          <div key={w} className="py-1">{w}</div>
        ))}
      </div>

      {/* day grid */}
      <div className="grid grid-cols-7 text-center">
        {days.map((d) => {
          const inMonth = isSameMonth(d, month)
          const isSel = isSameDay(d, selected)
          const isTod = isSameDay(d, today)

          return (
            <button
              key={d.toISOString()}
              type="button"
              onClick={() => onChange(d)}
              className={[
                'relative flex items-center justify-center py-1.5 text-fluid-base rounded-full transition-colors',
                !inMonth && 'text-gray-300',
                inMonth && !isSel && !isTod && 'text-ink-900 hover:bg-warm-100',
                isTod && !isSel && 'font-bold text-coral',
                isSel && 'bg-coral text-white font-semibold shadow-sm',
              ].join(' ')}
            >
              {format(d, 'd')}
              {isTod && !isSel && (
                <span className="absolute bottom-0.5 mx-auto h-0.5 w-1 rounded-full bg-coral" />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
