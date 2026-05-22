import { useState, useEffect } from 'react'
import { Pencil, Trash2, Plus } from 'lucide-react'
import { useExchangeRate } from '../context/ExchangeRateContext'
import { getAccounts, createAccount, updateAccount, deleteAccount } from '../api/accounts'
import { AccountForm } from '../components/AccountForm'

export function Accounts() {
  const rate = useExchangeRate()
  const [accounts, setAccounts] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)

  const load = () => getAccounts().then(setAccounts)
  useEffect(() => { load() }, [])

  const toEUR = (balance, currency) =>
    currency === 'EUR' ? balance : balance / (rate || 1)

  const handleSubmit = async (data) => {
    if (editing) {
      await updateAccount(editing.id, data)
    } else {
      await createAccount(data)
    }
    setShowForm(false)
    setEditing(null)
    load()
  }

  const handleEdit = (account) => {
    setEditing(account)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this account?')) return
    await deleteAccount(id)
    load()
  }

  const totalEUR = accounts.reduce((sum, a) => sum + toEUR(a.balance, a.currency), 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Accounts</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Total savings: <span className="font-semibold text-green-600 dark:text-green-400">€{totalEUR.toFixed(2)}</span>
          </p>
        </div>
        <button
          onClick={() => { setEditing(null); setShowForm(true) }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          <Plus size={16} /> Add Account
        </button>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-5 border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold mb-4">{editing ? 'Edit Account' : 'New Account'}</h2>
          <AccountForm
            initial={editing || undefined}
            onSubmit={handleSubmit}
            onCancel={() => { setShowForm(false); setEditing(null) }}
          />
        </div>
      )}

      <div className="space-y-3">
        {accounts.map(account => (
          <div key={account.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div>
              <p className="font-semibold">{account.name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{account.bank} · {account.currency} · Updated {account.updatedAt}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="font-bold">{account.currency === 'BRL' ? 'R$' : '€'}{account.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                {account.currency === 'BRL' && rate && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">≈ €{toEUR(account.balance, account.currency).toFixed(2)}</p>
                )}
              </div>
              <button onClick={() => handleEdit(account)} className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"><Pencil size={16} /></button>
              <button onClick={() => handleDelete(account.id)} className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500"><Trash2 size={16} /></button>
            </div>
          </div>
        ))}
        {accounts.length === 0 && (
          <p className="text-center text-gray-500 dark:text-gray-400 py-10">No accounts yet. Add one to get started.</p>
        )}
      </div>
    </div>
  )
}
