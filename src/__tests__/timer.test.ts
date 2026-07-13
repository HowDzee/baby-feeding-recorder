import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import useTimer from '../hooks/useTimer'

describe('useTimer', () => {
  beforeEach(() => { vi.useFakeTimers() })
  afterEach(() => { vi.useRealTimers() })

  it('tracks elapsed seconds while running', async () => {
    const { result } = renderHook(() => useTimer())
    expect(result.current.elapsedSec).toBe(0)
    act(() => result.current.start())
    act(() => { vi.advanceTimersByTime(5000) })
    expect(result.current.elapsedSec).toBe(5)
  })

  it('stops without resetting elapsed', async () => {
    const { result } = renderHook(() => useTimer())
    act(() => { result.current.start(); vi.advanceTimersByTime(3000) })
    act(() => result.current.stop())
    act(() => { vi.advanceTimersByTime(5000) })
    expect(result.current.elapsedSec).toBe(3)
  })

  it('resets to zero', async () => {
    const { result } = renderHook(() => useTimer())
    act(() => { result.current.start(); vi.advanceTimersByTime(4000) })
    act(() => result.current.reset())
    expect(result.current.elapsedSec).toBe(0)
  })
})
