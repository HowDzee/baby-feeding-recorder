/** TouchSlideDays - horizontally scrollable day selector with swipe support */
import { useState, useRef, useCallback } from 'react'

const DAYS_TO_SHOW = 14

export default function TouchSlideDays({
  selected,
  onSelect,
}: {
  selected: Date
  onSelect: (d: Date) => void
}) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  // Generate a centered window of days
  const days = Array.from({ length: DAYS_TO_SHOW }, (_, i) => {
    const d = new Date(today)
    d.setDate(d.getDate() - Math.floor(DAYS_TO_SHOW / 2) + i)
    return d
  })

  const [startIdx, setStartIdx] = useState(() => Math.floor(DAYS_TO_SHOW / 2))
  const touchStartX = useRef(0)
  const touchDelta = useRef(0)
  const [dragging, setDragging] = useState(false)

  const goPrev = useCallback(() => {
    setStartIdx((i) => Math.max(0, i - 1))
  }, [])

  const goNext = useCallback(() => {
    setStartIdx((i) => Math.min(days.length - 1, i + 1))
  }, [days.length])

  const handleTouchStart = (x: number) => {
    touchStartX.current = x
    touchDelta.current = 0
    setDragging(true)
  }

  const handleTouchMove = (x: number) => {
    if (!dragging) return
    touchDelta.current = x - touchStartX.current
  }

  const handleTouchEnd = () => {
    setDragging(false)
    if (Math.abs(touchDelta.current) > 40) {
      touchDelta.current > 0 ? goPrev() : goNext()
    }
    touchDelta.current = 0
  }

  return (
    <div className="relative select-none">
      {/* scrollable row */}
      <div
        className="flex items-center gap-2 overflow-hidden px-2"
        onTouchStart={(e) => handleTouchStart(e.touches[0].clientX)}
        onTouchMove={(e) => handleTouchMove(e.touches[0].clientX)}
        onTouchEnd={handleTouchEnd}
        onMouseDown={(e) => handleTouchStart(e.clientX)}
        onMouseMove={(e) => dragging && handleTouchMove(e.clientX)}
        onMouseUp={handleTouchEnd}
        onMouseLeave={dragging ? handleTouchEnd : undefined}
      >
        {days.slice(startIdx, startIdx + 7).map((d) => {
          const isSel = d.toDateString() === selected.toDateString()
          const isTod = d.toDateString() === today.toDateString()
          const dayName = isTod ? '今天' : d.toLocaleDateString('zh-CN', { weekday: 'short' })
          const dateNum = d.getDate()
          return (
            <button
              key={d.toISOString()}
              type="button"
              onClick={() => onSelect(d)}
              className={`flex min-w-16 flex-col items-center gap-0.5 rounded-2xl px-2 py-2 text-fluid-xs transition-all ${
                isSel
                  ? 'bg-coral text-white shadow-md scale-105'
                  : isTod
                  ? 'border border-coral text-coral'
                  : 'border border-warm-200 bg-white text-ink-900'
              }`}
            >
              <span className="text-[10px]">{dayName}</span>
              <span className="text-lg font-bold leading-none">{dateNum}</span>
            </button>
          )
        })}
      </div>

      {/* arrow buttons */}
      <button
        type="button"
        onClick={goPrev}
        disabled={startIdx === 0}
        className={`absolute left-0 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-1 shadow-md backdrop-blur ${
          startIdx === 0 ? 'opacity-30' : 'opacity-100 active:scale-95'
        }`}
      >
        <span className="text-ink-900">‹</span>
      </button>
      <button
        type="button"
        onClick={goNext}
        disabled={startIdx >= days.length - 7}
        className={`absolute right-0 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-1 shadow-md backdrop-blur ${
          startIdx >= days.length - 7 ? 'opacity-30' : 'opacity-100 active:scale-95'
        }`}
      >
        <span className="text-ink-900">›</span>
      </button>
    </div>
  )
}
