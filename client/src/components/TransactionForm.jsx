import { useState } from 'react'
import { Plus } from 'lucide-react'
import { addCategory } from '../api/categories'

const EMPTY = { date: new Date().toISOString().split('T')[0], type: 'expense', amount: '', currency: 'BRL', category: '', description: '' }

export function TransactionForm({ initial = EMPTY, categories = [], onSubmit, onCancel, onCategoryAdded }) {
  const [form, setForm] = useState(initial)
  const [showAddCategory, setShowAddCategory] = useState(false)
  const [newCategory, setNewCategory] = useState('')
  const [categoryError, setCategoryError] = useState('')

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({ ...form, amount: parseFloat(form.amount) })
  }

  const handleSaveCategory = async () => {
    const name = newCategory.trim()
    if (!name) return
    setCategoryError('')
    try {
      await addCategory(name)
      setForm(f => ({ ...f, category: name }))
      setNewCategory('')
      setShowAddCategory(false)
      onCategoryAdded?.()
    } catch {
      setCategoryError('Failed to add category. Please try again.')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        type="date"
        className="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        value={form.date}
        onChange={set('date')}
        required
      />
      <select
        className="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        value={form.type}
        onChange={set('type')}
      >
        <option value="income">Income</option>
        <option value="expense">Expense</option>
      </select>
      <input
        type="number"
        min="0"
        step="0.01"
        className="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        placeholder="Amount"
        value={form.amount}
        onChange={set('amount')}
        required
      />
      <select
        className="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        value={form.currency}
        onChange={set('currency')}
      >
        <option value="BRL">BRL</option>
        <option value="EUR">EUR</option>
      </select>
      <div className="flex gap-2">
        <select
          className="flex-1 border rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          value={form.category}
          onChange={set('category')}
          required
        >
          <option value="">Select category</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <button
          type="button"
          onClick={() => setShowAddCategory(s => !s)}
          className="px-2 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          aria-label="Add category"
        >
          <Plus size={16} />
        </button>
      </div>
      {showAddCategory && (
        <div className="flex flex-col gap-1">
          <div className="flex gap-2">
            <input
              className="flex-1 border rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="New category name"
              value={newCategory}
              onChange={e => setNewCategory(e.target.value)}
            />
            <button
              type="button"
              onClick={handleSaveCategory}
              disabled={!newCategory.trim()}
              className="px-3 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
            >
              Add
            </button>
          </div>
          {categoryError && <p className="text-sm text-red-500">{categoryError}</p>}
        </div>
      )}
      <input
        className="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        placeholder="Description"
        value={form.description}
        onChange={set('description')}
      />
      <div className="flex gap-2">
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Save</button>
        <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded hover:bg-gray-300 dark:hover:bg-gray-500">Cancel</button>
      </div>
    </form>
  )
}
