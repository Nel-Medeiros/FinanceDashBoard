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
  const income = rate ? monthTx.filter(t => t.type === 'income').reduce((s, t) => s + toEUR(t.amount, t.currency, rate), 0) : 0
  const expenses = rate ? monthTx.filter(t => t.type === 'expense').reduce((s, t) => s + toEUR(t.amount, t.currency, rate), 0) : 0
  const net = income - expenses

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

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SummaryCard label="Income This Month" value={`€${income.toFixed(2)}`} color="text-green-600 dark:text-green-400" />
        <SummaryCard label="Expenses This Month" value={`€${expenses.toFixed(2)}`} color="text-red-600 dark:text-red-400" />
        <SummaryCard label="Net This Month" value={`€${net.toFixed(2)}`} color={net >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'} />
      </div>
    </div>
  )
}
