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

  useEffect(() => { getTransactions().then(setTransactions) }, [])

  const pieData = useMemo(() => {
    const expenses = transactions.filter(t => t.type === 'expense' && t.date.startsWith(selectedMonth))
    const byCategory = expenses.reduce((acc, t) => {
      const eur = toEUR(t.amount, t.currency, rate)
      acc[t.category] = (acc[t.category] || 0) + eur
      return acc
    }, {})
    return Object.entries(byCategory).map(([name, value]) => ({ name, value: parseFloat(value.toFixed(2)) }))
  }, [transactions, selectedMonth, rate])

  const barData = useMemo(() => {
    return getLast6Months().map(month => {
      const monthTx = transactions.filter(t => t.date.startsWith(month))
      const income = monthTx.filter(t => t.type === 'income').reduce((s, t) => s + toEUR(t.amount, t.currency, rate), 0)
      const expenses = monthTx.filter(t => t.type === 'expense').reduce((s, t) => s + toEUR(t.amount, t.currency, rate), 0)
      return { month: month.slice(5), income: parseFloat(income.toFixed(2)), expenses: parseFloat(expenses.toFixed(2)) }
    })
  }, [transactions, rate])

  return (
    <div className="space-y-10">
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
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, value }) => `${name}: €${value}`}>
                {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v) => `€${v}`} />
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
            <YAxis tickFormatter={v => `€${v}`} />
            <Tooltip formatter={(v) => `€${v}`} />
            <Legend />
            <Bar dataKey="income" fill="#10b981" name="Income" />
            <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
