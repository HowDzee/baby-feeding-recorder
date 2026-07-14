import { beforeEach, afterAll } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import QuickActions from '../components/QuickActions'
import Calendar from '../components/Calendar'
import RecordCard from '../components/RecordCard'
import StatCard from '../components/StatCard'
import { addFeeding, resetDB } from '../db'

beforeEach(async () => { await resetDB() })
afterAll(async () => { await resetDB() })

describe('QuickActions', () => {
  it('renders feeding and diaper buttons', () => {
    render(
      <MemoryRouter>
        <QuickActions onNavigate={(() => {}) as any} />
      </MemoryRouter>
    )
    expect(screen.getByText('吃奶')).toBeDefined()
    expect(screen.getByText('排便')).toBeDefined()
  })
})

describe('Calendar', () => {
  it('renders month header and day buttons', async () => {
    await render(
      <MemoryRouter>
        <Calendar selected={new Date('2026-07-13')} onChange={(() => {}) as any} />
      </MemoryRouter>
    )
    expect(screen.getByText('2026年')).toBeDefined()
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThan(0)
  })
})

describe('RecordCard', () => {
  it('shows feeding type label and amount', async () => {
    const id = await addFeeding({
      type: 'formula', amount: 70, durationSec: null,
      startedAt: new Date('2026-07-13T10:00:00'), endedAt: new Date('2026-07-13T10:05:00'), note: '',
    })
    render(
      <MemoryRouter>
        <RecordCard
          feeding={{ id, type: 'formula', amount: 70, durationSec: null, startedAt: new Date('2026-07-13T10:00:00'), endedAt: new Date('2026-07-13T10:05:00'), note: '', createdAt: new Date() }}
          onDelete={() => {}}
        />
      </MemoryRouter>
    )
    expect(screen.getByText('奶粉')).toBeDefined()
    expect(screen.getByText(/70ml/)).toBeDefined()
  })

  it('calls onDelete with record id when trash clicked', async () => {
    const id = await addFeeding({
      type: 'breast_left', amount: null, durationSec: 120,
      startedAt: new Date(), endedAt: new Date(), note: '',
    })
    let got = ''
    render(
      <MemoryRouter>
        <RecordCard
          feeding={{ id, type: 'breast_left', amount: null, durationSec: 120, startedAt: new Date(), endedAt: new Date(), note: '', createdAt: new Date() }}
          onDelete={(fid) => { got = fid }}
        />
      </MemoryRouter>
    )
    fireEvent.click(screen.getByLabelText('删除'))
    expect(got).toBe(id)
  })

  it('returns null when no feeding/diaper given', () => {
    const { container } = render(
      <MemoryRouter>
        <RecordCard />
      </MemoryRouter>
    )
    expect(container.firstChild).toBeNull()
  })
})

describe('StatCard', () => {
  it('renders title and value', () => {
    render(<StatCard title="总奶量" value={360} unit="ml" />)
    expect(screen.getByText('总奶量')).toBeDefined()
    expect(screen.getByText('360')).toBeDefined()
  })

  it('renders trend when provided', () => {
    render(<StatCard title="体重" value={4.5} unit="kg" trend="up" />)
    expect(screen.getByText('体重')).toBeDefined()
    const upEls = screen.queryAllByText('up')
    expect(upEls.length).toBeGreaterThan(0)
  })
})
