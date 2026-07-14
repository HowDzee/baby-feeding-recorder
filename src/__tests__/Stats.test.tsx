import { beforeEach, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Stats from '../pages/Stats'
import { resetDB } from '../db'

beforeEach(async () => { await resetDB() })
afterEach(async () => { await resetDB() })

describe('Stats page', () => {
  it('renders heading, tabs, and all stat card titles', async () => {
    await act(async () => {
      render(
        <MemoryRouter>
          <Stats />
        </MemoryRouter>
      )
    })
    expect(screen.getByText('统计')).toBeDefined()
    expect(screen.getByText('今日')).toBeDefined()
    expect(screen.getByText('7日')).toBeDefined()
    expect(screen.getByText('30日')).toBeDefined()
    // All card titles render statically
    expect(screen.getByText('吃奶次数')).toBeDefined()
    expect(screen.getByText('总奶量')).toBeDefined()
    expect(screen.getByText('总吃奶时长')).toBeDefined()
    expect(screen.getByText('尿尿次数')).toBeDefined()
    expect(screen.getByText('便便次数')).toBeDefined()
    expect(screen.getByText('红臀次数')).toBeDefined()
  })

  it('shows zeros initially', async () => {
    await act(async () => {
      render(
        <MemoryRouter>
          <Stats />
        </MemoryRouter>
      )
    })
    await new Promise((r) => setTimeout(r, 200))
    const zeros = screen.getAllByText('0')
    expect(zeros.length).toBeGreaterThanOrEqual(4)
  })
})
