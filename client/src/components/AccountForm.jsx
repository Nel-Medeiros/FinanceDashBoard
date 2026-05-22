import { useState } from 'react'

const EMPTY = { name: '', bank: '', currency: 'BRL', balance: '' }

export function AccountForm({ initial = EMPTY, onSubmit, onCancel }) {
  const [form, setForm] = useState(initial)

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({ ...form, balance: parseFloat(form.balance) })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        className="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        placeholder="Account name (e.g. Nubank Checking)"
        value={form.name}
        onChange={set('name')}
        required
      />
      <input
        className="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        placeholder="Bank (e.g. Nubank)"
        value={form.bank}
        onChange={set('bank')}
        required
      />
      <select
        className="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        value={form.currency}
        onChange={set('currency')}
      >
        <option value="BRL">BRL (Brazilian Real)</option>
        <option value="EUR">EUR (Euro)</option>
      </select>
      <input
        type="number"
        min="0"
        step="0.01"
        className="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        placeholder="Current balance"
        value={form.balance}
        onChange={set('balance')}
        required
      />
      <div className="flex gap-2">
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Save</button>
        <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded hover:bg-gray-300 dark:hover:bg-gray-500">Cancel</button>
      </div>
    </form>
  )
}
