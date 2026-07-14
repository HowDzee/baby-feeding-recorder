import { beforeEach, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Home from '../pages/Home'
import { resetDB } from '../db'

beforeEach(async () => { await resetDB() })
afterEach(async () => { await resetDB() })

describe('Home page', () => {
  it('renders static text content (greeting, buttons, card titles)', async () => {
    await act(async () => {
      render(
        <MemoryRouter>
          <Home />
        </MemoryRouter>
      )
    })
    expect(screen.getByText('你好，宝宝 👋')).toBeDefined()
    expect(screen.getByText('吃奶')).toBeDefined()
    expect(screen.getByText('排便')).toBeDefined()
    expect(screen.getByText('今日总奶量')).toBeDefined()
    expect(screen.getByText('今日吃奶时长')).toBeDefined()
    expect(screen.getByText('大小便次数')).toBeDefined()
    expect(screen.getByText('历史记录')).toBeDefined()
  })

  it('renders initial zero values', async () => {
    await act(async () => {
      render(
        <MemoryRouter>
          <Home />
        </MemoryRouter>
      )
    })
    // Initial state shows 0 for all stats
    const zeros = screen.getAllByText('0')
    expect(zeros.length).toBeGreaterThanOrEqual(3)
  })
})
