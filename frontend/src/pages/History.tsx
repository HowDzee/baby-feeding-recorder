import { useState, useEffect, useMemo } from 'react'
import Calendar from '../components/Calendar'
import RecordCard from '../components/RecordCard'
import DayCharts from '../components/charts/DayCharts'
import useRecords from '../store/useRecords'

export default function History() {
  const store = useRecords()

  const [timestamp, setTimestamp] = useState(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d.getTime()
  })

  const start = useMemo(() => {
    const d = new Date(timestamp)
    d.setHours(0, 0, 0, 0)
    return d
  }, [timestamp])
  const end = useMemo(() => new Date(start.getTime() + 86_399_999), [start])

  const [records, setRecords] = useState<Awaited<ReturnType<typeof store.getDailyRecords>> | null>(null)

  useEffect(() => {
    let active = true
    store.getDailyRecords(start, end).then((r) => {
      if (active) setRecords(r)
    })
    return () => { active = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [start, end])

  const feedings = records?.feedings ?? []
  const diapers = records?.diapers ?? []

  const deleteFeeding = async (id: string) => {
    await store.deleteFeeding(id)
    setRecords((prev) => prev ? { ...prev, feedings: prev.feedings.filter((f) => f.id !== id) } : prev)
  }

  const deleteDiaper = async (id: string) => {
    await store.deleteDiaper(id)
    setRecords((prev) => prev ? { ...prev, diapers: prev.diapers.filter((d) => d.id !== id) } : prev)
  }

  const isEmpty = feedings.length === 0 && diapers.length === 0

  return (
    <div className="mx-auto max-w-2xl p-fluid-c">
      <h1 className="text-fluid-xl font-bold mb-4">历史记录</h1>
      <Calendar selected={new Date(timestamp)} onChange={(d) => setTimestamp(d.getTime())} />

      {!isEmpty && <DayCharts feedings={feedings} diapers={diapers} />}

      {isEmpty ? (
        <div className="mt-20 text-center text-fluid-lg text-ink-600">这一天还没有记录</div>
      ) : (
        <div className="mt-4 flex flex-col gap-3">
          {feedings.map((f) => (
            <RecordCard key={f.id} feeding={f} onDelete={deleteFeeding} />
          ))}
          {diapers.map((d) => (
            <RecordCard key={d.id} diaper={d} onDelete={deleteDiaper} />
          ))}
        </div>
      )}
    </div>
  )
}
