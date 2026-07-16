import { beforeEach, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import History from '../pages/History'
import { resetDB } from '../db'

beforeEach(async () => { await resetDB() })
afterEach(async () => { await resetDB() })

describe('History page', () => {
  it('renders page heading and date selector', async () => {
    await act(async () => {
      render(
        <MemoryRouter>
          <History />
        </MemoryRouter>
      )
    })
    expect(screen.getByRole('heading', { name: '历史记录' })).toBeDefined()
    expect(screen.getByLabelText('选择日期')).toBeDefined()
  })

  it('renders empty state when no records', async () => {
    await act(async () => {
      render(
        <MemoryRouter>
          <History />
        </MemoryRouter>
      )
    })
    await new Promise((r) => setTimeout(r, 150))
    expect(screen.getByText(/还没有记录/)).toBeDefined()
  })

  it('renders feeding cards without crashing (no data from empty DB)', async () => {
    await act(async () => {
      render(
        <MemoryRouter>
          <History />
        </MemoryRouter>
      )
    })
    // Page renders without errors even with async data loading
    expect(screen.getByRole('heading', { name: '历史记录' })).toBeDefined()
  })
})
