import { create } from 'zustand'
import type { Feeding, Diaper } from '../types'
import {
  remoteFeedings,
  remoteDiapers,
  remoteAddFeeding,
  remoteAddDiaper,
  remoteDeleteFeeding,
  remoteDeleteDiaper,
} from '../db/remoteApi'

export interface DailyRecords {
 date: Date
 feedings: Feeding[]
 diapers: Diaper[]
}

export interface RecordsState {
 addFeeding: (inp: Parameters<typeof remoteAddFeeding>[0]) => Promise<string>
 addDiaper: (inp: Parameters<typeof remoteAddDiaper>[0]) => Promise<string>
 deleteFeeding: (id: string) => Promise<void>
 deleteDiaper: (id: string) => Promise<void>
 getDailyRecords: (start: Date, end: Date) => Promise<DailyRecords>
}

// Always remote — data lives in server-side SQLite database
const useRecordsBase = create<RecordsState>(() => ({
 addFeeding: (inp) => remoteAddFeeding(inp),
 addDiaper: (inp) => remoteAddDiaper(inp),
 deleteFeeding: (id) => remoteDeleteFeeding(id),
 deleteDiaper: (id) => remoteDeleteDiaper(id),
 getDailyRecords: async (start, end) => ({
  date: start,
  feedings: await remoteFeedings(start, end),
  diapers: await remoteDiapers(start, end),
 }),
}))

// Stable hook — never recreates the store
export function useRecords(): RecordsState {
 return useRecordsBase()
}

export default useRecordsBase
