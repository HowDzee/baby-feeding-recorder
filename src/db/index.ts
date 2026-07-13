import type { Feeding, Diaper, FeedingType, DiaperType } from '../types'

const DB_NAME = 'baby-recorder'

type RawFeeding = {
  id: string
  type: FeedingType
  amount: number | null
  durationSec: number | null
  startedAt: Date
  endedAt: Date | null
  note: string
  createdAt: Date
  _ts: number
  _endedTs: number | null
}

type RawDiaper = {
  id: string
  type: DiaperType
  color: string | null
  consistency: string | null
  hadRash: boolean
  recordedAt: Date
  note: string
  createdAt: Date
  _ts: number
}

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1)
    req.onupgradeneeded = () => {
      const d = req.result
      if (!d.objectStoreNames.contains('feeding')) {
        const f = d.createObjectStore('feeding', { keyPath: 'id' })
        f.createIndex('startedAt', '_ts')
      }
      if (!d.objectStoreNames.contains('diaper')) {
        const dd = d.createObjectStore('diaper', { keyPath: 'id' })
        dd.createIndex('recordedAt', '_ts')
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

function toFeeding(r: RawFeeding): Feeding {
  return { ...r, _ts: undefined as never, _endedTs: undefined as never } as unknown as Feeding
}

function toDiaper(r: RawDiaper): Diaper {
  return { ...r, _ts: undefined as never } as unknown as Diaper
}

function tx(db: IDBDatabase, store: string, mode: IDBTransactionMode) {
  const t = db.transaction(store, mode)
  return {
    store: t.objectStore(store),
    done: () =>
      new Promise<void>((resolve, reject) => {
        t.oncomplete = () => resolve()
        t.onerror = () => reject(t.error)
      })
  }
}

export async function resetDB() {
  await indexedDB.deleteDatabase(DB_NAME)
}

export async function addFeeding(item: {
  type: FeedingType
  amount: number | null
  durationSec: number | null
  startedAt: Date
  endedAt: Date | null
  note: string
}): Promise<string> {
  const raw: RawFeeding = {
    id: crypto.randomUUID(),
    ...item,
    createdAt: new Date(),
    _ts: item.startedAt.getTime(),
    _endedTs: item.endedAt ? item.endedAt.getTime() : null
  }
  const d = await open()
  try {
    const { store, done } = tx(d, 'feeding', 'readwrite')
    await new Promise<void>((resolve, reject) => {
      const r = store.put(raw)
      r.onsuccess = () => resolve()
      r.onerror = () => reject(r.error)
    })
    await done()
    return raw.id
  } finally {
    d.close()
  }
}

export async function addDiaper(item: {
  type: DiaperType
  color: string | null
  consistency: string | null
  hadRash: boolean
  recordedAt: Date
  note: string
}): Promise<string> {
  const raw: RawDiaper = {
    id: crypto.randomUUID(),
    ...item,
    createdAt: new Date(),
    _ts: item.recordedAt.getTime()
  }
  const d = await open()
  try {
    const { store, done } = tx(d, 'diaper', 'readwrite')
    await new Promise<void>((resolve, reject) => {
      const r = store.put(raw)
      r.onsuccess = () => resolve()
      r.onerror = () => reject(r.error)
    })
    await done()
    return raw.id
  } finally {
    d.close()
  }
}

export async function getFeedingsByDate(start: Date, end: Date): Promise<Feeding[]> {
  const d = await open()
  try {
    const { store, done } = tx(d, 'feeding', 'readonly')
    const range = IDBKeyRange.bound(start.getTime(), end.getTime(), false, false)
    const idx = store.index('startedAt')
    const out: Feeding[] = []
    await new Promise<void>((resolve, reject) => {
      const req = idx.openCursor(range, 'prev')
      req.onsuccess = () => {
        const cursor = req.result
        if (cursor) {
          out.push(toFeeding(cursor.value as RawFeeding))
          cursor.continue()
        } else {
          resolve()
        }
      }
      req.onerror = () => reject(req.error)
    })
    await done()
    return out
  } finally {
    d.close()
  }
}

export async function getDiapersByDate(start: Date, end: Date): Promise<Diaper[]> {
  const d = await open()
  try {
    const { store, done } = tx(d, 'diaper', 'readonly')
    const range = IDBKeyRange.bound(start.getTime(), end.getTime(), false, false)
    const idx = store.index('recordedAt')
    const out: Diaper[] = []
    await new Promise<void>((resolve, reject) => {
      const req = idx.openCursor(range, 'prev')
      req.onsuccess = () => {
        const cursor = req.result
        if (cursor) {
          out.push(toDiaper(cursor.value as RawDiaper))
          cursor.continue()
        } else {
          resolve()
        }
      }
      req.onerror = () => reject(req.error)
    })
    await done()
    return out
  } finally {
    d.close()
  }
}

export async function deleteFeeding(id: string) {
  const d = await open()
  try {
    const { store, done } = tx(d, 'feeding', 'readwrite')
    await new Promise<void>((resolve, reject) => {
      const r = store.delete(id)
      r.onsuccess = () => resolve()
      r.onerror = () => reject(r.error)
    })
    await done()
  } finally {
    d.close()
  }
}

export async function deleteDiaper(id: string) {
  const d = await open()
  try {
    const { store, done } = tx(d, 'diaper', 'readwrite')
    await new Promise<void>((resolve, reject) => {
      const r = store.delete(id)
      r.onsuccess = () => resolve()
      r.onerror = () => reject(r.error)
    })
    await done()
  } finally {
    d.close()
  }
}
