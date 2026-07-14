import { mkdirSync } from 'node:fs'
import express from 'express'
import cors from 'cors'
import Database from 'better-sqlite3'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const app = express()
const PORT = process.env.PORT ?? 3000

const DATA_DIR = path.join(__dirname, 'data')
mkdirSync(DATA_DIR, { recursive: true })

const DB_PATH = process.env.DB_PATH ?? path.join(DATA_DIR, 'data.db')

app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(express.static(path.join(__dirname, 'dist')))

// --- Database ---
const db = new Database(DB_PATH)
db.pragma('journal_mode = WAL')
db.exec(`
CREATE TABLE IF NOT EXISTS feeding (
  id TEXT PRIMARY KEY, type TEXT NOT NULL, amount INTEGER,
  durationSec INTEGER, startedAt INTEGER NOT NULL, endedAt INTEGER,
  note TEXT DEFAULT '', createdAt INTEGER NOT NULL, updatedAt INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS diaper (
  id TEXT PRIMARY KEY, type TEXT NOT NULL, color TEXT,
  consistency TEXT, hadRash INTEGER DEFAULT 0,
  recordedAt INTEGER NOT NULL, note TEXT DEFAULT '',
  createdAt INTEGER NOT NULL, updatedAt INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_f_ts ON feeding(startedAt);
CREATE INDEX IF NOT EXISTS idx_d_ts ON diaper(recordedAt);
CREATE TRIGGER IF NOT EXISTS tr_feed_upd AFTER UPDATE ON feeding
  BEGIN UPDATE feeding SET updatedAt = strftime('%s','now') WHERE id = NEW.id; END;
CREATE TRIGGER IF NOT EXISTS tr_diaper_upd AFTER UPDATE ON diaper
  BEGIN UPDATE diaper SET updatedAt = strftime('%s','now') WHERE id = NEW.id; END;
`)

const q = {
  feedByRange: db.prepare('SELECT * FROM feeding WHERE startedAt >= ? AND startedAt <= ? ORDER BY startedAt DESC'),
  feedAll: db.prepare('SELECT * FROM feeding ORDER BY startedAt DESC'),
  feedById: db.prepare('SELECT * FROM feeding WHERE id = ?'),
  insertFeed: db.prepare(`INSERT INTO feeding VALUES (@id,@type,@amount,@durationSec,@startedAt,@endedAt,@note,@createdAt,@updatedAt)
    ON CONFLICT(id) DO UPDATE SET type=excluded.type, amount=excluded.amount, durationSec=excluded.durationSec,
    startedAt=excluded.startedAt, endedAt=excluded.endedAt, note=excluded.note, updatedAt=excluded.updatedAt`),
  delFeed: db.prepare('DELETE FROM feeding WHERE id = ?'),
  diaperByRange: db.prepare('SELECT * FROM diaper WHERE recordedAt >= ? AND recordedAt <= ? ORDER BY recordedAt DESC'),
  diaperAll: db.prepare('SELECT * FROM diaper ORDER BY recordedAt DESC'),
  diaperById: db.prepare('SELECT * FROM diaper WHERE id = ?'),
  insertDiaper: db.prepare(`INSERT INTO diaper VALUES (@id,@type,@color,@consistency,@hadRash,@recordedAt,@note,@createdAt,@updatedAt)
    ON CONFLICT(id) DO UPDATE SET type=excluded.type, color=excluded.color, consistency=excluded.consistency,
    hadRash=excluded.hadRash, recordedAt=excluded.recordedAt, note=excluded.note, updatedAt=excluded.updatedAt`),
  delDiaper: db.prepare('DELETE FROM diaper WHERE id = ?'),
  countFeed: db.prepare('SELECT COUNT(*) as n FROM feeding'),
}

// --- API ---

app.get('/api/feedings', (req, res) => {
  const start = Number(req.query.start) || 0
  const end = Number(req.query.end) || Infinity
  res.json(q.feedByRange.all(start, end))
})

app.get('/api/diapers', (req, res) => {
  const start = Number(req.query.start) || 0
  const end = Number(req.query.end) || Infinity
  res.json(q.diaperByRange.all(start, end))
})

app.post('/api/feedings', (req, res) => {
  const now = Date.now()
  const body = { ...req.body, createdAt: now, updatedAt: now }
  if (!body.id) body.id = crypto.randomUUID()
  q.insertFeed.run(body)
  res.json(body)
})

app.post('/api/diapers', (req, res) => {
  const now = Date.now()
  const body = { ...req.body, createdAt: now, updatedAt: now }
  if (!body.id) body.id = crypto.randomUUID()
  q.insertDiaper.run(body)
  res.json(body)
})

app.delete('/api/feedings/:id', (req, res) => {
  q.delFeed.run(req.params.id)
  res.sendStatus(204)
})

app.delete('/api/diapers/:id', (req, res) => {
  q.delDiaper.run(req.params.id)
  res.sendStatus(204)
})

// Sync: push all local changes with timestamp
app.post('/api/sync/push', (req, res) => {
  const { feedings = [], diapers = [] } = req.body
  const tx = db.transaction(() => {
    for (const f of feedings) q.insertFeed.run(f)
    for (const d of diapers) q.insertDiaper.run(d)
  })
  tx()
  res.json({ ok: true })
})

// Sync: pull all server data newer than given timestamp
app.get('/api/sync/pull', (req, res) => {
  const since = Number(req.query.since) || 0
  const feedings = q.feedAll.all().filter((f) => f.updatedAt > since)
  const diapers = q.diaperAll.all().filter((d) => d.updatedAt > since)
  res.json({ feedings, diapers })
})

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'))
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`API server running on http://0.0.0.0:${PORT}`)
  console.log(`Database: ${DB_PATH}`)
})
