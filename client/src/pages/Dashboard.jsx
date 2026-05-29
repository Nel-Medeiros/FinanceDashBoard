import { useState, useEffect } from 'react'
import { useExchangeRate } from '../context/ExchangeRateContext'
import { getAccounts } from '../api/accounts'
import { getTransactions } from '../api/transactions'
import { GoalProgressBar } from '../components/GoalProgressBar'
import { SummaryCard } from '../components/SummaryCard'

function toEUR(amount, currency, rate) {
  if (!rate) return 0
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

  const incomeByCurrency = groupByCurrency(monthTx, 'income')
  const expensesByCurrency = groupByCurrency(monthTx, 'expense')

  const netEUR = monthTx.reduce((sum, t) => {
    const eur = toEUR(t.amount, t.currency, rate)
    return t.type === 'income' ? sum + eur : sum - eur
  }, 0)

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
        {CURRENCY_ORDER.filter(c => incomeByCurrency[c] !== undefined).map(c => (
          <SummaryCard
            key={`income-${c}`}
            label={`Income (${c})`}
            value={`${currencySymbol(c)}${incomeByCurrency[c].toFixed(2)}`}
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
