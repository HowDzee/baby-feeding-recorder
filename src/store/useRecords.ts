import { create } from 'zustand'
import type { Feeding, Diaper } from '../types'
import { addFeeding, addDiaper, deleteFeeding, deleteDiaper, getFeedingsByDate, getDiapersByDate } from '../db'
import type { FeedingType, DiaperType } from '../types'

export interface DailyRecords {
  date: Date
  feedings: Feeding[]
  diapers: Diaper[]
}

interface RecordsState {
  addFeeding: (inp: {
    type: FeedingType
    amount: number | null
    durationSec: number | null
    startedAt: Date
    endedAt: Date | null
    note: string
  }) => Promise<string>
  addDiaper: (inp: {
    type: DiaperType
    color: string | null
    consistency: string | null
    hadRash: boolean
    recordedAt: Date
    note: string
  }) => Promise<string>
  deleteFeeding: (id: string) => Promise<void>
  deleteDiaper: (id: string) => Promise<void>
  getDailyRecords: (start: Date, end: Date) => Promise<DailyRecords>
}

export default create<RecordsState>((set, get) => ({
  addFeeding: async (inp) => addFeeding(inp),
  addDiaper: async (inp) => addDiaper(inp),
  deleteFeeding: async (id) => { await deleteFeeding(id) },
  deleteDiaper: async (id) => { await deleteDiaper(id) },
  getDailyRecords: async (start, end) => ({
    date: start,
    feedings: await getFeedingsByDate(start, end),
    diapers: await getDiapersByDate(start, end)
  })
}))
