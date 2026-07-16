import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ClipboardList, Settings } from 'lucide-react'
import QuickActions from '../components/QuickActions'
import StatCard from '../components/StatCard'
import DailyTimeline from '../components/charts/DailyTimeline'
import useRecords from '../store/useRecords'

export default function Home() {
  const navigate = useNavigate()
  const store = useRecords()

  const now = useMemo(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  }, [])
  const endOfDay = useMemo(() => new Date(now.getTime() + 86_399_999), [now])

  const [records, setRecords] = useState<Awaited<ReturnType<typeof store.getDailyRecords>> | null>(null)

  useEffect(() => {
    let active = true
    store.getDailyRecords(now, endOfDay).then((r) => {
      if (active) setRecords(r)
    })
    return () => { active = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [now, endOfDay])

  const totalMl = (records?.feedings ?? []).reduce((s, f) => s + (f.amount ?? 0), 0)
  const totalMin = Math.floor((records?.feedings ?? []).reduce((s, f) => s + (f.durationSec ?? 0), 0) / 60)
  const diaperCount = (records?.diapers ?? []).length

  return (
    <div className="mx-auto max-w-2xl p-fluid-c">
      <header className="py-fluid-c">
        <h1 className="text-fluid-2xl font-bold">你好，宝宝 👋</h1>
        <p className="text-fluid-lg text-ink-600 mt-1">今天吃了吗？</p>
      </header>

      <section style={{ containerType: 'inline-size' }}>
        <QuickActions onNavigate={(t) => navigate(`/add?type=${t}`)} />
      </section>

      <section
        className="grid gap-4 mt-8"
        style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))' }}
      >
        <StatCard title="今日总奶量" value={totalMl} unit="ml" />
        <StatCard title="今日吃奶时长" value={totalMin} unit="分钟" />
        <StatCard title="大小便次数" value={diaperCount} unit="次" />
      </section>

      <DailyTimeline feedings={records?.feedings ?? []} diapers={records?.diapers ?? []} />

<nav className="mt-8 flex flex-wrap justify-center gap-3">
  <button
    type="button"
    onClick={() => navigate('/history')}
    className="flex items-center gap-2 rounded-full bg-white px-6 py-3 shadow-sm text-fluid-lg font-semibold active:scale-95"
  >
    <ClipboardList className="h-5 w-5" />
    历史记录
  </button>
  <button
    type="button"
    onClick={() => navigate('/settings')}
    className="flex items-center gap-2 rounded-full bg-white px-6 py-3 shadow-sm text-fluid-lg font-semibold active:scale-95"
  >
    <Settings className="h-5 w-5" />
    设置
  </button>
</nav>
    </div>
  )
}
