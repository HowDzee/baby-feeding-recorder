import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import useRecords from '../store/useRecords'
import useTimer from '../hooks/useTimer'
import type { FeedingType, DiaperType, Diaper } from '../types'

const FEEDING_LABEL: Record<FeedingType, string> = {
  breast_left: '左乳',
  breast_right: '右乳',
  breast_both: '双侧',
  formula: '奶粉',
}

const DIAPER_LABEL: Record<Diaper['type'], string> = {
  pee: '尿尿',
  poop: '便便',
  both: '两者',
}

function FeedingForm({ onSaved }: { onSaved: () => void }) {
  const [type, setType] = useState<FeedingType>('formula')
  const [amount, setAmount] = useState(60)
  const { elapsedSec, isRunning, start, stop } = useTimer()
  const store = useRecords()
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async () => {
    setError(null)
    try {
      if (type === 'formula') {
        await store.addFeeding({ type, amount, durationSec: null, startedAt: new Date(), endedAt: new Date(), note: '' })
      } else {
        await store.addFeeding({ type, amount: null, durationSec: elapsedSec, startedAt: new Date(), endedAt: new Date(), note: '' })
        stop()
      }
      setSaved(true)
      setTimeout(onSaved, 600)
    } catch (e) {
      setError(e instanceof Error ? e.message : '保存失败，请重试')
    }
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={(e) => { e.preventDefault(); void submit() }}>
      <div className="flex gap-2">
        {(Object.keys(FEEDING_LABEL) as FeedingType[]).map((t) => (
          <button key={t} type="button" onClick={() => { setType(t); setSaved(false); setError(null) }} className={`flex-1 rounded-xl py-2 text-fluid-base ${type === t ? 'bg-coral text-white' : 'bg-white'}`}>
            {FEEDING_LABEL[t]}
          </button>
        ))}
      </div>
      {type === 'formula' ? (
        <label className="flex items-center gap-2">
          <span>奶量(毫升)</span>
          <input type="number" min={10} max={250} step={10} value={amount} onChange={(e) => setAmount(+e.target.value)} className="w-24 rounded-xl border border-gray-300 p-2 text-fluid-base" />
        </label>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <div className="text-fluid-xl font-mono">{Math.floor(elapsedSec / 60)}:{(elapsedSec % 60).toString().padStart(2, '0')}</div>
          <button type="button" onClick={isRunning ? stop : start} className="rounded-full bg-coral px-6 py-2 text-white">{isRunning ? '结束' : '开始计时'}</button>
        </div>
      )}
      <button type="submit" className="rounded-full bg-coral py-3 text-white font-semibold">保存</button>
      <button type="button" onClick={onSaved} className="self-center text-ink-600">返回</button>
      {saved && <p className="text-center text-mint">已保存</p>}
      {error && <p className="text-center text-red-500">{error}</p>}
    </form>
  )
}

function DiaperForm({ onSaved }: { onSaved: () => void }) {
  const [type, setType] = useState<DiaperType>('both')
  const [hadRash, setHadRash] = useState(false)
  const store = useRecords()
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async () => {
    setError(null)
    try {
      await store.addDiaper({ type, color: null, consistency: null, hadRash, recordedAt: new Date(), note: '' })
      setSaved(true)
      setTimeout(onSaved, 600)
    } catch (e) {
      setError(e instanceof Error ? e.message : '保存失败，请重试')
    }
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={(e) => { e.preventDefault(); void submit() }}>
      <div className="flex gap-2">
        {(Object.keys(DIAPER_LABEL) as DiaperType[]).map((t) => (
          <button key={t} type="button" onClick={() => { setType(t); setSaved(false); setError(null) }} className={`flex-1 rounded-xl py-2 text-fluid-base ${type === t ? 'bg-mint text-white' : 'bg-white'}`}>
            {DIAPER_LABEL[t]}
          </button>
        ))}
      </div>
      <label className="flex items-center gap-2">
        <input type="checkbox" checked={hadRash} onChange={(e) => setHadRash(e.target.checked)} />
        <span>红臀 / 皮疹</span>
      </label>
      <button type="submit" className="rounded-full bg-coral py-3 text-white font-semibold">保存</button>
      <button type="button" onClick={onSaved} className="self-center text-ink-600">返回</button>
      {saved && <p className="text-center text-mint">已保存</p>}
      {error && <p className="text-center text-red-500">{error}</p>}
    </form>
  )
}

export default function AddRecord() {
  const navigate = useNavigate()
  const [search] = useSearchParams()
  const kind = search.get('type')
  return (
    <div className="mx-auto max-w-2xl p-fluid-c">
      <button type="button" onClick={() => navigate('/')} className="mb-4 flex items-center gap-1 text-ink-600">
        <ArrowLeft className="h-5 w-5" /> 返回
      </button>
      <h2 className="text-fluid-xl font-bold mb-4">添加记录</h2>
      {kind === 'feeding' ? <FeedingForm onSaved={() => navigate('/')} /> : kind === 'diaper' ? <DiaperForm onSaved={() => navigate('/')} /> : <p>请在首页选择记录类型</p>}
    </div>
  )
}
