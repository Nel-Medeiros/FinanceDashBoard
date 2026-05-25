# Original Currency Display Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show transaction amounts in their original currency throughout the app, with EUR equivalents as secondary info, and add a currency filter to Analytics charts.

**Architecture:** Three isolated frontend-only changes — Transactions page gets a EUR note for BRL rows, Dashboard replaces fixed 3-card row with dynamic per-currency cards, Analytics adds a BRL/EUR/All toggle that filters both charts. No backend changes required; currency field is already stored on each transaction.

**Tech Stack:** React, Vitest + React Testing Library, Tailwind CSS, Recharts, ExchangeRateContext (live rate via context hook)

---

## File Map

| File | Change |
|------|--------|
| `client/src/pages/Transactions.jsx` | Import `useExchangeRate`; add EUR note to BRL rows |
| `client/src/__tests__/Transactions.test.jsx` | Add `ExchangeRateContext` mock; add EUR note test |
| `client/src/pages/Dashboard.jsx` | Replace fixed 3-card row with dynamic per-currency cards |
| `client/src/__tests__/Dashboard.test.jsx` | Update label assertions; add mixed-currency test |
| `client/src/pages/Analytics.jsx` | Add `currency` state; filter transactions; update chart formatters |
| `client/src/__tests__/Analytics.test.jsx` | Add currency toggle tests |

---

### Task 1: Transactions — EUR equivalent note for BRL rows

**Files:**
- Modify: `client/src/__tests__/Transactions.test.jsx`
- Modify: `client/src/pages/Transactions.jsx`

- [ ] **Step 1: Write the failing test**

Open `client/src/__tests__/Transactions.test.jsx`. Add a mock for `ExchangeRateContext` at the top (after the existing `vi.mock` calls), then add a new test case. The full updated file:

```jsx
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

vi.mock('../context/ExchangeRateContext', () => ({
  useExchangeRate: () => 5.85
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

  it('shows EUR equivalent note for BRL transactions', async () => {
    render(<Transactions />)
    // tx-2: R$200 / 5.85 = 34.19
    await waitFor(() => {
      expect(screen.getByText('≈ €34.19')).toBeInTheDocument()
    })
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd client && npx vitest run src/__tests__/Transactions.test.jsx
```

Expected: 3 tests pass, 1 fails — `"shows EUR equivalent note for BRL transactions"` with `Unable to find an element with the text: ≈ €34.19`.

- [ ] **Step 3: Update Transactions.jsx**

Full updated `client/src/pages/Transactions.jsx`:

```jsx
import { useState, useEffect, useMemo } from 'react'
import { Pencil, Trash2, Plus } from 'lucide-react'
import { getTransactions, createTransaction, updateTransaction, deleteTransaction } from '../api/transactions'
import { getCategories } from '../api/categories'
import { TransactionForm } from '../components/TransactionForm'
import { useExchangeRate } from '../context/ExchangeRateContext'

function currentMonthValue() {
  return new Date().toISOString().slice(0, 7)
}

export function Transactions() {
  const rate = useExchangeRate()
  const [transactions, setTransactions] = useState([])
  const [categories, setCategories] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [filterMonth, setFilterMonth] = useState(currentMonthValue())
  const [filterCategory, setFilterCategory] = useState('')
  const [filterType, setFilterType] = useState('')

  const load = () => getTransactions().then(setTransactions)

  useEffect(() => {
    load()
    getCategories().then(setCategories)
  }, [])

  const filtered = useMemo(() => {
    return transactions
      .filter(t => !filterMonth || t.date.startsWith(filterMonth))
      .filter(t => !filterCategory || t.category === filterCategory)
      .filter(t => !filterType || t.type === filterType)
      .sort((a, b) => b.date.localeCompare(a.date))
  }, [transactions, filterMonth, filterCategory, filterType])

  const handleSubmit = async (data) => {
    if (editing) {
      await updateTransaction(editing.id, data)
    } else {
      await createTransaction(data)
    }
    setShowForm(false)
    setEditing(null)
    load()
  }

  const handleEdit = (tx) => {
    setEditing(tx)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this transaction?')) return
    await deleteTransaction(id)
    load()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Transactions</h1>
        <button
          onClick={() => { setEditing(null); setShowForm(true) }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          <Plus size={16} /> Add Transaction
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        <div>
          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Month</label>
          <input
            type="month"
            className="border rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            value={filterMonth}
            onChange={e => setFilterMonth(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="category-filter" className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Category</label>
          <select
            id="category-filter"
            className="border rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
          >
            <option value="">All categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="type-filter" className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Type</label>
          <select
            id="type-filter"
            aria-label="Type"
            className="border rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
          >
            <option value="">All types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </div>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-5 border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold mb-4">{editing ? 'Edit Transaction' : 'New Transaction'}</h2>
          <TransactionForm
            initial={editing || undefined}
            categories={categories}
            onSubmit={handleSubmit}
            onCancel={() => { setShowForm(false); setEditing(null) }}
          />
        </div>
      )}

      <div className="space-y-2">
        {filtered.map(tx => (
          <div key={tx.id} className="bg-white dark:bg-gray-800 rounded-lg px-4 py-3 border border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${tx.type === 'income' ? 'bg-green-500' : 'bg-red-500'}`} />
              <div>
                <p className="font-medium">{tx.description || tx.category}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{tx.date} · {tx.category}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className={`font-semibold ${tx.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {tx.type === 'income' ? '+' : '-'}{tx.currency === 'BRL' ? 'R$' : '€'}{tx.amount.toFixed(2)}
                </p>
                {tx.currency !== 'EUR' && rate && (
                  <p className="text-xs text-gray-400 dark:text-gray-500">≈ €{(tx.amount / rate).toFixed(2)}</p>
                )}
              </div>
              <button onClick={() => handleEdit(tx)} className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"><Pencil size={14} /></button>
              <button onClick={() => handleDelete(tx.id)} className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-center text-gray-500 dark:text-gray-400 py-10">No transactions found for this filter.</p>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run tests to verify all pass**

```bash
cd client && npx vitest run src/__tests__/Transactions.test.jsx
```

Expected: 4 tests pass.

- [ ] **Step 5: Commit**

```bash
git add client/src/pages/Transactions.jsx client/src/__tests__/Transactions.test.jsx
git commit -m "feat: show EUR equivalent note for BRL transactions"
```

---

### Task 2: Dashboard — Dynamic per-currency income and expense cards

**Files:**
- Modify: `client/src/__tests__/Dashboard.test.jsx`
- Modify: `client/src/pages/Dashboard.jsx`

- [ ] **Step 1: Write the failing tests**

Full updated `client/src/__tests__/Dashboard.test.jsx`:

```jsx
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

  it('shows per-currency income and expense cards', async () => {
    render(<Dashboard />)
    await waitFor(() => {
      expect(screen.getByText('Income (BRL)')).toBeInTheDocument()
      expect(screen.getByText('Expenses (BRL)')).toBeInTheDocument()
      expect(screen.getByText('Net This Month')).toBeInTheDocument()
    })
  })

  it('shows correct BRL amounts on income and expense cards', async () => {
    render(<Dashboard />)
    // income: R$3000.00, expenses: R$200.00
    await waitFor(() => {
      expect(screen.getByText('R$3000.00')).toBeInTheDocument()
      expect(screen.getByText('R$200.00')).toBeInTheDocument()
    })
  })

  it('shows net in EUR', async () => {
    render(<Dashboard />)
    // net = (3000/5.85) - (200/5.85) = (2800/5.85) ≈ 478.63
    await waitFor(() => {
      expect(screen.getByText('€478.63')).toBeInTheDocument()
    })
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd client && npx vitest run src/__tests__/Dashboard.test.jsx
```

Expected: `shows per-currency income and expense cards`, `shows correct BRL amounts on income and expense cards`, and `shows net in EUR` fail. The old `shows monthly income and expense summary cards` test is replaced.

- [ ] **Step 3: Update Dashboard.jsx**

Full updated `client/src/pages/Dashboard.jsx`:

```jsx
import { useState, useEffect } from 'react'
import { useExchangeRate } from '../context/ExchangeRateContext'
import { getAccounts } from '../api/accounts'
import { getTransactions } from '../api/transactions'
import { GoalProgressBar } from '../components/GoalProgressBar'
import { SummaryCard } from '../components/SummaryCard'

function toEUR(amount, currency, rate) {
  return currency === 'EUR' ? amount : amount / rate
}

function currentMonthPrefix() {
  return new Date().toISOString().slice(0, 7)
}

const CURRENCY_ORDER = ['BRL', 'EUR']
const currencySymbol = (c) => c === 'BRL' ? 'R$' : '€'

function groupByCurrency(transactions, type) {
  return transactions
    .filter(t => t.type === type)
    .reduce((acc, t) => {
      acc[t.currency] = (acc[t.currency] || 0) + t.amount
      return acc
    }, {})
}

export function Dashboard() {
  const rate = useExchangeRate()
  const [accounts, setAccounts] = useState([])
  const [transactions, setTransactions] = useState([])

  useEffect(() => {
    getAccounts().then(setAccounts)
    getTransactions().then(setTransactions)
  }, [])

  const totalEUR = rate
    ? accounts.reduce((sum, a) => sum + toEUR(a.balance, a.currency, rate), 0)
    : 0

  const thisMonth = currentMonthPrefix()
  const monthTx = transactions.filter(t => t.date.startsWith(thisMonth))

  const incomeBycurrencies = groupByCurrency(monthTx, 'income')
  const expensesByCurrency = groupByCurrency(monthTx, 'expense')

  const netEUR = rate
    ? monthTx.reduce((sum, t) => {
        const eur = toEUR(t.amount, t.currency, rate)
        return t.type === 'income' ? sum + eur : sum - eur
      }, 0)
    : 0

  return (
    <div className="space-y-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-500 dark:text-gray-400">Today's Exchange Rate</p>
        <p className="text-3xl font-bold mt-1">
          {rate ? `1 EUR = ${rate.toFixed(2)} BRL` : 'Loading...'}
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold mb-4">Savings Goal — €10,000</h2>
        <GoalProgressBar totalEUR={totalEUR} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {CURRENCY_ORDER.filter(c => incomeBycurrencies[c] !== undefined).map(c => (
          <SummaryCard
            key={`income-${c}`}
            label={`Income (${c})`}
            value={`${currencySymbol(c)}${incomeBycurrencies[c].toFixed(2)}`}
            color="text-green-600 dark:text-green-400"
          />
        ))}
        {CURRENCY_ORDER.filter(c => expensesByCurrency[c] !== undefined).map(c => (
          <SummaryCard
            key={`expense-${c}`}
            label={`Expenses (${c})`}
            value={`${currencySymbol(c)}${expensesByCurrency[c].toFixed(2)}`}
            color="text-red-600 dark:text-red-400"
          />
        ))}
        <SummaryCard
          label="Net This Month"
          value={`€${netEUR.toFixed(2)}`}
          color={netEUR >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}
        />
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run tests to verify all pass**

```bash
cd client && npx vitest run src/__tests__/Dashboard.test.jsx
```

Expected: 6 tests pass.

- [ ] **Step 5: Commit**

```bash
git add client/src/pages/Dashboard.jsx client/src/__tests__/Dashboard.test.jsx
git commit -m "feat: show dynamic per-currency income and expense cards on Dashboard"
```

---

### Task 3: Analytics — Currency selector toggle

**Files:**
- Modify: `client/src/__tests__/Analytics.test.jsx`
- Modify: `client/src/pages/Analytics.jsx`

- [ ] **Step 1: Write the failing tests**

Full updated `client/src/__tests__/Analytics.test.jsx`:

```jsx
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
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd client && npx vitest run src/__tests__/Analytics.test.jsx
```

Expected: 3 existing tests pass, 2 new tests fail — `renders the currency toggle` and `shows empty pie chart state`.

- [ ] **Step 3: Update Analytics.jsx**

Full updated `client/src/pages/Analytics.jsx`:

```jsx
import { useState, useEffect, useMemo } from 'react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { getTransactions } from '../api/transactions'
import { useExchangeRate } from '../context/ExchangeRateContext'

const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6']

function getLast6Months() {
  const months = []
  const now = new Date()
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push(d.toISOString().slice(0, 7))
  }
  return months
}

function toEUR(amount, currency, rate) {
  return currency === 'EUR' ? amount : (rate ? amount / rate : 0)
}

export function Analytics() {
  const rate = useExchangeRate()
  const [transactions, setTransactions] = useState([])
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7))
  const [currency, setCurrency] = useState('All')

  useEffect(() => { getTransactions().then(setTransactions) }, [])

  const symbol = currency === 'BRL' ? 'R$' : '€'

  const filteredTransactions = useMemo(() =>
    currency === 'All' ? transactions : transactions.filter(t => t.currency === currency),
    [transactions, currency]
  )

  const pieData = useMemo(() => {
    const expenses = filteredTransactions.filter(t => t.type === 'expense' && t.date.startsWith(selectedMonth))
    const byCategory = expenses.reduce((acc, t) => {
      const value = currency === 'All' ? toEUR(t.amount, t.currency, rate) : t.amount
      acc[t.category] = (acc[t.category] || 0) + value
      return acc
    }, {})
    return Object.entries(byCategory).map(([name, value]) => ({ name, value: parseFloat(value.toFixed(2)) }))
  }, [filteredTransactions, selectedMonth, rate, currency])

  const barData = useMemo(() => {
    return getLast6Months().map(month => {
      const monthTx = filteredTransactions.filter(t => t.date.startsWith(month))
      const income = monthTx.filter(t => t.type === 'income').reduce((s, t) => s + (currency === 'All' ? toEUR(t.amount, t.currency, rate) : t.amount), 0)
      const expenses = monthTx.filter(t => t.type === 'expense').reduce((s, t) => s + (currency === 'All' ? toEUR(t.amount, t.currency, rate) : t.amount), 0)
      return { month: month.slice(5), income: parseFloat(income.toFixed(2)), expenses: parseFloat(expenses.toFixed(2)) }
    })
  }, [filteredTransactions, rate, currency])

  return (
    <div className="space-y-10">
      <div className="flex justify-end">
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          {['BRL', 'EUR', 'All'].map(c => (
            <button
              key={c}
              onClick={() => setCurrency(c)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                currency === c
                  ? 'bg-white dark:bg-gray-800 shadow text-gray-900 dark:text-white'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Expenses by Category</h2>
          <input
            type="month"
            className="border rounded px-3 py-1.5 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            value={selectedMonth}
            onChange={e => setSelectedMonth(e.target.value)}
          />
        </div>
        {pieData.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-10">No expense data for this month.</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, value }) => `${name}: ${symbol}${value}`}>
                {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v) => `${symbol}${v}`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold mb-4">Monthly Income vs Expenses</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={barData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis tickFormatter={v => `${symbol}${v}`} />
            <Tooltip formatter={(v) => `${symbol}${v}`} />
            <Legend />
            <Bar dataKey="income" fill="#10b981" name="Income" />
            <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run tests to verify all pass**

```bash
cd client && npx vitest run src/__tests__/Analytics.test.jsx
```

Expected: 5 tests pass.

- [ ] **Step 5: Run all frontend tests to confirm no regressions**

```bash
cd client && npx vitest run
```

Expected: all tests pass (previously 22 tests + the new ones added in Tasks 1–3).

- [ ] **Step 6: Commit**

```bash
git add client/src/pages/Analytics.jsx client/src/__tests__/Analytics.test.jsx
git commit -m "feat: add currency selector to Analytics charts"
```

---

### Task 4: Push branch and open PR

- [ ] **Step 1: Push the feature branch**

```bash
git push origin feat/original-currency-display
```

- [ ] **Step 2: Open a PR against main**

```bash
gh pr create \
  --title "feat: show expenses in original currency with EUR equivalents" \
  --body "$(cat <<'EOF'
## Summary
- Transactions: BRL rows now show a small EUR equivalent note (≈ €X.XX)
- Dashboard: Income and Expense cards are now dynamic per-currency instead of fixed EUR totals; Net stays in EUR
- Analytics: Added BRL/EUR/All toggle — both pie and bar charts filter and display in the selected currency

## Test plan
- [ ] Run `cd client && npx vitest run` — all tests pass
- [ ] Start app with `npm run dev` from repo root
- [ ] Transactions page: add a BRL transaction, confirm EUR note appears; add a EUR transaction, confirm no note
- [ ] Dashboard: confirm Income (BRL) and Expenses (BRL) cards show R$ amounts; Net shows €
- [ ] Analytics: toggle BRL/EUR/All and confirm charts update; selecting EUR with no EUR data shows empty state

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```
