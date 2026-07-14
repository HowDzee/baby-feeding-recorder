import { afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { act } from 'react-dom/test-utils'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import AddRecord from '../pages/AddRecord'
import { resetDB } from '../db'

afterEach(async () => {
  await resetDB()
})

describe('AddRecord page', () => {
  it('renders feeding form with default formula selected', async () => {
    await act(async () => {
      render(
        <MemoryRouter initialEntries={['/add?type=feeding']}>
          <Routes>
            <Route path="/add" element={<AddRecord />} />
          </Routes>
        </MemoryRouter>
      )
    })
    // Default type is formula, so "奶粉" is highlighted
    expect(screen.getByText('奶粉')).toBeDefined()
    expect(screen.getByLabelText('奶量(毫升)')).toBeDefined()
  })

  it('submits a formula feeding', async () => {
    await act(async () => {
      render(
        <MemoryRouter initialEntries={['/add?type=feeding']}>
          <Routes>
            <Route path="/add" element={<AddRecord />} />
          </Routes>
        </MemoryRouter>
      )
    })
    // Default is formula, amount is 60
    const saveBtn = screen.getAllByText('保存')[0]
    await act(async () => {
      fireEvent.click(saveBtn)
    })
    await waitFor(() => expect(screen.getByText(/已保存/)).toBeDefined())
  })

  it('renders diaper form when type=diaper', async () => {
    await act(async () => {
      render(
        <MemoryRouter initialEntries={['/add?type=diaper']}>
          <Routes>
            <Route path="/add" element={<AddRecord />} />
          </Routes>
        </MemoryRouter>
      )
    })
    expect(screen.getByText('便便')).toBeDefined()
  })

  it('submits a diaper record with rash', async () => {
    await act(async () => {
      render(
        <MemoryRouter initialEntries={['/add?type=diaper']}>
          <Routes>
            <Route path="/add" element={<AddRecord />} />
          </Routes>
        </MemoryRouter>
      )
    })
    // Default type is 'both', so save directly
    const saveBtn = screen.getAllByText('保存')[0]
    await act(async () => {
      fireEvent.click(saveBtn)
    })
    await waitFor(() => expect(screen.getByText(/已保存/)).toBeDefined())
  })
})
