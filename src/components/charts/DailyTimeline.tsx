import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import type { Feeding, Diaper } from '../../types'

function fmtTime(d: Date): string {
  return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

export default function DailyTimeline({ feedings, diapers }: { feedings: Feeding[]; diapers: Diaper[] }) {
  const feedingData = useMemo(
    () =>
      feedings.map((f) => ({
        time: fmtTime(f.startedAt),
        value: f.type === 'formula' ? (f.amount ?? 0) : (f.durationSec ?? 0) / 60,
        kind: f.type === 'formula' ? '奶粉' : '亲喂',
      })),
    [feedings],
  )

  const diaperItems = useMemo(
    () =>
      diapers.map((d) => ({
        time: fmtTime(d.recordedAt),
        type: d.type === 'pee' ? '尿尿' : d.type === 'poop' ? '便便' : '两者',
        rash: d.hadRash,
      })),
    [diapers],
  )

  const totalMl = feedings.reduce((s, f) => s + (f.amount ?? 0), 0)
  const breastMin = Math.floor(feedings.filter((f) => f.type !== 'formula').reduce((s, f) => s + (f.durationSec ?? 0), 0) / 60)

  if (feedings.length === 0 && diapers.length === 0) return null

  return (
    <section className="mt-6 rounded-2xl bg-white p-fluid-c shadow-sm">
      <h2 className="text-fluid-lg font-semibold text-ink-900">今日概览</h2>

      <div className="mt-3 flex gap-3">
        <div className="flex-1 rounded-xl bg-coral/10 p-3 text-center">
          <div className="text-fluid-2xl font-bold text-coral">{totalMl}</div>
          <div className="text-fluid-xs text-ink-600">总奶量 (ml)</div>
        </div>
        <div className="flex-1 rounded-xl bg-mint/10 p-3 text-center">
          <div className="text-fluid-2xl font-bold text-mint">{breastMin}</div>
          <div className="text-fluid-xs text-ink-600">亲喂时长 (分钟)</div>
        </div>
        <div className="flex-1 rounded-xl bg-warn/10 p-3 text-center">
          <div className="text-fluid-2xl font-bold text-warn">{diapers.length}</div>
          <div className="text-fluid-xs text-ink-600">排便次数</div>
        </div>
      </div>

      {feedingData.length > 0 && (
        <div className="mt-4">
          <p className="text-fluid-xs text-ink-600 mb-1">
            吃奶记录 {feedings[0].type === 'formula' ? '· 奶量 ml' : '· 亲喂 分钟'}
          </p>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={feedingData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#888' }} />
              <YAxis tick={{ fontSize: 10, fill: '#888' }} />
              <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {feedingData.map((entry) => (
                  <Cell key={entry.time} fill={entry.kind === '奶粉' ? '#FF8FA3' : '#7DD3C0'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="flex gap-4">
            <span className="flex items-center gap-1 text-fluid-xs text-ink-600">
              <span className="inline-block h-2 w-2.5 rounded-full bg-coral" /> 奶粉(ml)
            </span>
            <span className="flex items-center gap-1 text-fluid-xs text-ink-600">
              <span className="inline-block h-2 w-2.5 rounded-full bg-mint" /> 亲喂(分钟)
            </span>
          </div>
        </div>
      )}

      {diaperItems.length > 0 && (
        <div className="mt-4">
          <p className="text-fluid-xs text-ink-600 mb-2">排便情况</p>
          <div className="flex flex-wrap gap-2">
            {diaperItems.map((d, i) => (
              <span
                key={i}
                className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-fluid-xs ${
                  d.rash ? 'bg-warn/15 text-warn' : 'bg-mint/15 text-mint'
                }`}
              >
                {d.time} · {d.type}
                {d.rash && ' ⚠️'}
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
