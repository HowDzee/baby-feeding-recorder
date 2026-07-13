import { describe, it, expect, afterEach } from 'vitest'
import useRecords from '../store/useRecords'
import { resetDB, addFeeding, addDiaper, getFeedingsByDate, getDiapersByDate } from '../db'

describe('store', () => {
  afterEach(async () => { await resetDB() })

  it('adds feeding and fetches daily list', async () => {
    const store = useRecords.getState()
    await store.addFeeding({ type: 'formula', amount: 60, durationSec: null, startedAt: new Date('2026-07-13T08:00:00'), endedAt: new Date('2026-07-13T08:05:00'), note: '' })
    const list = await store.getDailyRecords(new Date('2026-07-13T00:00:00'), new Date('2026-07-13T23:59:59'))
    expect(list.feedings).toHaveLength(1)
    expect(list.diapers).toHaveLength(0)
    expect(list.date).toBeInstanceOf(Date)
  })

  it('deletes a feeding and returns empty list', async () => {
    const store = useRecords.getState()
    const id = await store.addFeeding({ type: 'breast_left', amount: null, durationSec: 180, startedAt: new Date(), endedAt: new Date('2026-07-13T09:00:00'), note: '' })
    await store.deleteFeeding(id)
    const list = await store.getDailyRecords(new Date('2026-07-13T00:00:00'), new Date('2026-07-13T23:59:59'))
    expect(list.feedings).toHaveLength(0)
  })

  it('adds diaper with hadRash flag', async () => {
    const store = useRecords.getState()
    await store.addDiaper({ type: 'poop', color: '绿色', consistency: '稀水', hadRash: true, recordedAt: new Date('2026-07-13T07:30:00'), note: '' })
    const list = await store.getDailyRecords(new Date('2026-07-13T00:00:00'), new Date('2026-07-13T23:59:59'))
    expect(list.diapers).toHaveLength(1)
    expect(list.diapers[0].hadRash).toBe(true)
    expect(list.diapers[0].color).toBe('绿色')
  })
})
