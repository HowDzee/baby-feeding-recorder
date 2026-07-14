import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { subDays, format, addDays } from 'date-fns'

export default function DateSelector({
  selected,
  onChange,
}: {
  selected: Date
  onChange: (d: Date) => void
}) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [page, setPage] = useState(selected)

  const days = useMemo(() => {
    const start = subDays(page, 10)
    return Array.from({ length: 21 }, (_, i) => subDays(start, i))
  }, [page])

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        className="rounded-full p-2 hover:bg-white active:bg-gray-100"
        onClick={() => setPage(subDays(page, 7))}
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      <div
        className="flex gap-2 overflow-x-auto py-1"
        role="listbox"
        aria-label="选择日期"
      >
        {days.map((d) => {
          const isSel = d.toDateString() === selected.toDateString()
          const isToday = d.toDateString() === today.toDateString()
          return (
            <button
              key={d.toISOString()}
              type="button"
              role="option"
              aria-selected={isSel}
              onClick={() => onChange(d)}
              className={`min-w-12 rounded-full px-3 py-2 text-fluid-xs ${
                isSel ? 'bg-coral text-white' : 'bg-white text-ink-900'
              }`}
            >
              {format(d, isToday ? '今天' : 'M/d')}
            </button>
          )
        })}
      </div>

      <button
        type="button"
        className="rounded-full p-2 hover:bg-white active:bg-gray-100"
        onClick={() => setPage(addDays(page, 7))}
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  )
}
