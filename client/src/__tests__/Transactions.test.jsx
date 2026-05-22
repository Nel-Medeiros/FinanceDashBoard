import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import { Transactions } from '../pages/Transactions'

const mockTransactions = vi.hoisted(() => [
  { id: 'tx-1', date: '2026-05-01', type: 'income', amount: 5000, currency: 'BRL', category: 'Salary', description: 'Monthly salary' },
  { id: 'tx-2', date: '2026-05-15', type: 'expense', amount: 200, currency: 'BRL', category: 'Food', description: 'Groceries' },
  { id: 'tx-3', date: '2026-04-10', type: 'expense', amount: 100, currency: 'EUR', category: 'Transport', description: 'Flight' }
])

vi.mock('../api/transactions', () => ({
  getTransactions: vi.fn().mockResolvedValue(mockTransactions),
  createTransaction: vi.fn().mockResolvedValue({}),
  updateTransaction: vi.fn().mockResolvedValue({}),
  deleteTransaction: vi.fn().mockResolvedValue({})
}))

vi.mock('../api/categories', () => ({
  getCategories: vi.fn().mockResolvedValue(['Salary', 'Food', 'Transport'])
}))

describe('Transactions page', () => {
  it('renders list of transactions', async () => {
    render(<Transactions />)
    await waitFor(() => {
      expect(screen.getByText('Monthly salary')).toBeInTheDocument()
      expect(screen.getByText('Groceries')).toBeInTheDocument()
    })
  })

  it('filters by type when expense is selected', async () => {
    render(<Transactions />)
    await waitFor(() => screen.getByText('Monthly salary'))
    fireEvent.change(screen.getByLabelText('Type'), { target: { value: 'expense' } })
    await waitFor(() => {
      expect(screen.queryByText('Monthly salary')).not.toBeInTheDocument()
      expect(screen.getByText('Groceries')).toBeInTheDocument()
    })
  })

  it('shows Add Transaction button', () => {
    render(<Transactions />)
    expect(screen.getByText('Add Transaction')).toBeInTheDocument()
  })
})
