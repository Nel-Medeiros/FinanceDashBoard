import { render, screen, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import { Dashboard } from '../pages/Dashboard'

vi.mock('../context/ExchangeRateContext', () => ({
  useExchangeRate: () => 5.85
}))

vi.mock('../api/accounts', () => ({
  getAccounts: vi.fn().mockResolvedValue([
    { id: '1', name: 'Wise', bank: 'Wise', currency: 'EUR', balance: 1000, updatedAt: '2026-05-22' },
    { id: '2', name: 'Nubank', bank: 'Nubank', currency: 'BRL', balance: 5850, updatedAt: '2026-05-22' }
  ])
}))

vi.mock('../api/transactions', () => ({
  getTransactions: vi.fn().mockResolvedValue([
    { id: 'tx-1', date: '2026-05-10', type: 'income', amount: 3000, currency: 'BRL', category: 'Salary', description: '' },
    { id: 'tx-2', date: '2026-05-15', type: 'expense', amount: 200, currency: 'BRL', category: 'Food', description: '' }
  ])
}))

describe('Dashboard', () => {
  it('displays the exchange rate', async () => {
    render(<Dashboard />)
    await waitFor(() => expect(screen.getByText(/5\.85/)).toBeInTheDocument())
  })

  it('shows total savings as EUR equivalent', async () => {
    render(<Dashboard />)
    // EUR: 1000 + (5850 / 5.85) = 1000 + 1000 = €2000.00
    await waitFor(() => expect(screen.getByText(/2000\.00/)).toBeInTheDocument())
  })

  it('renders the goal progress bar', async () => {
    render(<Dashboard />)
    await waitFor(() => expect(screen.getByRole('progressbar')).toBeInTheDocument())
  })

  it('shows monthly income and expense summary cards', async () => {
    render(<Dashboard />)
    await waitFor(() => {
      expect(screen.getByText('Income This Month')).toBeInTheDocument()
      expect(screen.getByText('Expenses This Month')).toBeInTheDocument()
      expect(screen.getByText('Net This Month')).toBeInTheDocument()
    })
  })
})
