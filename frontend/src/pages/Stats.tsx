import { useState, useEffect, useMemo } from 'react'
import StatCard from '../components/StatCard'
import useRecords from '../store/useRecords'
import { subDays, startOfDay, endOfDay } from 'date-fns'

type Range = 'today' | '7d' | '30d'

export default function Stats() {
  const store = useRecords()
  const [range, setRange] = useState<Range>('today')

  const now = useMemo(() => new Date(), [])

  const back = useMemo(() => {
    if (range === 'today') return startOfDay(now)
    if (range === '7d') return startOfDay(subDays(now, 6))
    return startOfDay(subDays(now, 29))
  }, [range, now])

  const [records, setRecords] = useState<Awaited<ReturnType<typeof store.getDailyRecords>> | null>(null)

  useEffect(() => {
    let active = true
    store.getDailyRecords(back, endOfDay(now)).then((r) => {
      if (active) setRecords(r)
    })
    return () => { active = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [back])

  const feedingCount = (records?.feedings ?? []).length
  const totalMl = (records?.feedings ?? []).reduce((s, f) => s + (f.amount ?? 0), 0)
  const totalMin = Math.floor((records?.feedings ?? []).reduce((s, f) => s + (f.durationSec ?? 0), 0) / 60)
  const poopCount = (records?.diapers ?? []).filter((d) => d.type === 'poop' || d.type === 'both').length
  const peeCount = (records?.diapers ?? []).filter((d) => d.type === 'pee' || d.type === 'both').length
  const rashCount = (records?.diapers ?? []).filter((d) => d.hadRash).length

  return (
    <div className="mx-auto max-w-3xl p-fluid-c">
      <h1 className="text-fluid-xl font-bold">统计</h1>

      <div className="mt-4 flex gap-2">
        {(['today', '7d', '30d'] as Range[]).map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRange(r)}
            className={`flex-1 rounded-full py-2 text-fluid-base ${
              range === r ? 'bg-coral text-white' : 'bg-white'
            }`}
          >
            {{ today: '今日', '7d': '7日', '30d': '30日' }[r]}
          </button>
        ))}
      </div>

      <div
        className="mt-6 grid gap-4"
        style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))' }}
      >
        <StatCard title="吃奶次数" value={feedingCount} unit="次" />
        <StatCard title="总奶量" value={totalMl} unit="ml" />
        <StatCard title="总吃奶时长" value={totalMin} unit="分钟" />
        <StatCard title="尿尿次数" value={peeCount} unit="次" />
        <StatCard title="便便次数" value={poopCount} unit="次" />
        <StatCard title="红臀次数" value={rashCount} unit="次" />
      </div>
    </div>
  )
}
