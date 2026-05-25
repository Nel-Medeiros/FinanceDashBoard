import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import { Analytics } from '../pages/Analytics'

vi.mock('../context/ExchangeRateContext', () => ({
  useExchangeRate: () => 5.85
}))

vi.mock('../api/transactions', () => ({
  getTransactions: vi.fn().mockResolvedValue([
    { id: '1', date: '2026-05-10', type: 'expense', amount: 200, currency: 'BRL', category: 'Food', description: '' },
    { id: '2', date: '2026-05-15', type: 'expense', amount: 100, currency: 'BRL', category: 'Transport', description: '' },
    { id: '3', date: '2026-05-01', type: 'income', amount: 5000, currency: 'BRL', category: 'Salary', description: '' }
  ])
}))

vi.mock('recharts', () => ({
  PieChart: ({ children }) => <div data-testid="pie-chart">{children}</div>,
  Pie: () => null,
  Cell: () => null,
  BarChart: ({ children }) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  Legend: () => null,
  ResponsiveContainer: ({ children }) => <div>{children}</div>
}))

describe('Analytics page', () => {
  it('renders the pie chart', async () => {
    render(<Analytics />)
    await waitFor(() => expect(screen.getByTestId('pie-chart')).toBeInTheDocument())
  })

  it('renders the bar chart', async () => {
    render(<Analytics />)
    await waitFor(() => expect(screen.getByTestId('bar-chart')).toBeInTheDocument())
  })

  it('renders section headings', async () => {
    render(<Analytics />)
    await waitFor(() => {
      expect(screen.getByText('Expenses by Category')).toBeInTheDocument()
      expect(screen.getByText('Monthly Income vs Expenses')).toBeInTheDocument()
    })
  })

  it('renders the currency toggle with BRL, EUR, and All options', () => {
    render(<Analytics />)
    expect(screen.getByRole('button', { name: 'BRL' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'EUR' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'All' })).toBeInTheDocument()
  })

  it('shows empty pie chart state when selected currency has no expense data', async () => {
    render(<Analytics />)
    // Mock only has BRL transactions — selecting EUR should yield no expenses
    fireEvent.click(screen.getByRole('button', { name: 'EUR' }))
    await waitFor(() => {
      expect(screen.getByText('No expense data for this month.')).toBeInTheDocument()
    })
  })
})
