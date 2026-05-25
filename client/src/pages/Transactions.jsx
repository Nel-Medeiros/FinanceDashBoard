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
