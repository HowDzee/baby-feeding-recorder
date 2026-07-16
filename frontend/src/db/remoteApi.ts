import type { Feeding, Diaper, FeedingType, DiaperType } from '../types'

const API = (import.meta.env.VITE_API_BASE ?? '').replace(/\/+$/, '')

function toFeeding(r: Record<string, unknown>): Feeding {
	return {
		id: r.id as string,
		type: r.type as FeedingType,
		amount: (r.amount ?? null) as number | null,
		durationSec: (r.durationSec ?? null) as number | null,
		startedAt: new Date(r.startedAt as number),
		endedAt: r.endedAt != null ? new Date(r.endedAt as number) : null,
		note: (r.note ?? '') as string,
		createdAt: new Date(r.createdAt as number),
	}
}

function toDiaper(r: Record<string, unknown>): Diaper {
	return {
		id: r.id as string,
		type: r.type as DiaperType,
		color: (r.color ?? null) as string | null,
		consistency: (r.consistency ?? null) as string | null,
		hadRash: !!(r.hadRash as boolean),
		recordedAt: new Date(r.recordedAt as number),
		note: (r.note ?? '') as string,
		createdAt: new Date(r.createdAt as number),
	}
}

async function api(path: string, method = 'GET', body?: unknown) {
	const res = await fetch(`${API}${path}`, {
		method,
		headers: { 'Content-Type': 'application/json' },
		body: body != null ? JSON.stringify(body) : undefined,
	})
	if (!res.ok) throw new Error(`API ${method} ${path} -> ${res.status}`)
	return res
}

export function isRemoteMode(): boolean {
	return API.length > 0
}

export async function remoteFeedings(start: Date, end: Date): Promise<Feeding[]> {
	const res = await api(`/api/feedings?start=${start.getTime()}&end=${end.getTime()}`)
	const data = (await res.json()) as Record<string, unknown>[]
	return data.map(toFeeding)
}

export async function remoteDiapers(start: Date, end: Date): Promise<Diaper[]> {
	const res = await api(`/api/diapers?start=${start.getTime()}&end=${end.getTime()}`)
	const data = (await res.json()) as Record<string, unknown>[]
	return data.map(toDiaper)
}

export async function remoteAddFeeding(input: {
	type: FeedingType
	amount: number | null
	durationSec: number | null
	startedAt: Date
	endedAt: Date | null
	note: string
}): Promise<string> {
	// Server generates ID — send body only
	const body = {
		type: input.type,
		amount: input.amount,
		durationSec: input.durationSec,
		startedAt: input.startedAt.getTime(),
		endedAt: input.endedAt?.getTime() ?? null,
		note: input.note,
	}
	const res = await api('/api/feedings', 'POST', body)
	const row = (await res.json()) as { id: string }
	return row.id
}

export async function remoteAddDiaper(input: {
	type: DiaperType
	color: string | null
	consistency: string | null
	hadRash: boolean
	recordedAt: Date
	note: string
}): Promise<string> {
	const body = {
		type: input.type,
		color: input.color,
		consistency: input.consistency,
		hadRash: input.hadRash ? 1 : 0,
		recordedAt: input.recordedAt.getTime(),
		note: input.note,
	}
	const res = await api('/api/diapers', 'POST', body)
	const row = (await res.json()) as { id: string }
	return row.id
}

export async function remoteDeleteFeeding(id: string): Promise<void> {
	await api(`/api/feedings/${encodeURIComponent(id)}`, 'DELETE')
}

export async function remoteDeleteDiaper(id: string): Promise<void> {
	await api(`/api/diapers/${encodeURIComponent(id)}`, 'DELETE')
}

export async function remoteReset(): Promise<void> {
	throw new Error('reset not supported in remote mode')
}
