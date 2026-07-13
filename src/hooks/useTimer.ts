import { useState, useEffect, useCallback } from 'react'

export interface TimerResult {
  elapsedSec: number
  isRunning: boolean
  start: () => void
  stop: () => void
  reset: () => void
}

export default function useTimer(initial = 0): TimerResult {
  const [elapsed, setElapsed] = useState(initial)
  const [running, setRunning] = useState(false)

  const start = useCallback(() => { setRunning(true) }, [])
  const stop = useCallback(() => { setRunning(false) }, [])
  const reset = useCallback(() => { setElapsed(0) }, [])

  useEffect(() => {
    if (!running) return
    const id = window.setInterval(() => {
      setElapsed(p => p + 1)
    }, 1000)
    return () => window.clearInterval(id)
  }, [running])

  return { elapsedSec: elapsed, isRunning: running, start, stop, reset }
}
