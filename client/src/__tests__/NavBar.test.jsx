import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import { NavBar } from '../components/NavBar'

const mockToggleTheme = vi.fn()

vi.mock('../context/ThemeContext', () => ({
  useTheme: () => ({ theme: 'light', toggleTheme: mockToggleTheme })
}))

function renderNavBar() {
  return render(<MemoryRouter><NavBar /></MemoryRouter>)
}

describe('NavBar', () => {
  it('renders all navigation links', () => {
    renderNavBar()
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Accounts')).toBeInTheDocument()
    expect(screen.getByText('Transactions')).toBeInTheDocument()
    expect(screen.getByText('Analytics')).toBeInTheDocument()
  })

  it('calls toggleTheme when theme button is clicked', () => {
    renderNavBar()
    fireEvent.click(screen.getByRole('button', { name: /toggle theme/i }))
    expect(mockToggleTheme).toHaveBeenCalledTimes(1)
  })
})
