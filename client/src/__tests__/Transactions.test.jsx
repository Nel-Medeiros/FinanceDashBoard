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
  getCategories: vi.fn().mockResolvedValue(['Salary', 'Food', 'Transport']),
  addCategory: vi.fn().mockResolvedValue(['Salary', 'Food', 'Transport', 'Groceries']),
  deleteCategory: vi.fn().mockResolvedValue(['Salary', 'Transport'])
}))

vi.mock('../context/ExchangeRateContext', () => ({
  useExchangeRate: () => 5.85
}))

describe('Transactions page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })
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

  it('shows EUR equivalent note for BRL transactions', async () => {
    render(<Transactions />)
    // tx-2: R$200 / 5.85 = 34.19
    await waitFor(() => {
      expect(screen.getByText('≈ €34.19')).toBeInTheDocument()
    })
  })

  it('shows Manage button in the header', () => {
    render(<Transactions />)
    expect(screen.getByRole('button', { name: /manage/i })).toBeInTheDocument()
  })

  it('toggles ManageCategoriesPanel when Manage button is clicked', async () => {
    render(<Transactions />)
    await waitFor(() => screen.getByText('Monthly salary'))
    expect(screen.queryByText('Manage Categories')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /manage/i }))
    expect(screen.getByText('Manage Categories')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /manage/i }))
    expect(screen.queryByText('Manage Categories')).not.toBeInTheDocument()
  })

  it('re-fetches categories after a category is deleted', async () => {
    const { getCategories, deleteCategory } = await import('../api/categories')
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    render(<Transactions />)
    await waitFor(() => screen.getByText('Monthly salary'))
    fireEvent.click(screen.getByRole('button', { name: /manage/i }))
    fireEvent.click(screen.getByLabelText('Delete Food'))
    await waitFor(() => {
      expect(deleteCategory).toHaveBeenCalledWith('Food')
      expect(getCategories).toHaveBeenCalledTimes(2)
    })
  })
})
