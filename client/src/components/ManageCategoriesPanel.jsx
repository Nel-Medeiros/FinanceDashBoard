import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { addCategory } from '../api/categories'

export function ManageCategoriesPanel({ categories, onDelete, onCategoryAdded }) {
  const [newCategory, setNewCategory] = useState('')
  const [error, setError] = useState('')

  const handleDelete = (name) => {
    if (!confirm(`Delete "${name}"? Existing transactions using this category will keep their name.`)) return
    onDelete(name)
  }

  const handleAdd = async () => {
    const name = newCategory.trim()
    if (!name) return
    setError('')
    try {
      await addCategory(name)
      setNewCategory('')
      onCategoryAdded?.()
    } catch {
      setError('Failed to add category. Please try again.')
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleAdd()
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 space-y-3">
      <h2 className="text-sm font-semibold">Manage Categories</h2>
      <div className="flex gap-2">
        <input
          className="flex-1 border rounded px-3 py-2 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          placeholder="New category name"
          value={newCategory}
          onChange={e => setNewCategory(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          type="button"
          onClick={handleAdd}
          disabled={!newCategory.trim()}
          className="px-3 py-2 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700 disabled:opacity-50"
        >
          Add
        </button>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <div className="flex flex-wrap gap-2">
        {categories.map(c => (
          <span key={c} className="flex items-center gap-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full px-3 py-1 text-sm">
            {c}
            <button
              type="button"
              onClick={() => handleDelete(c)}
              className="ml-1 text-red-400 hover:text-red-500 dark:hover:text-red-400 focus:outline-none focus:ring-1 focus:ring-red-500 rounded"
              aria-label={`Delete ${c}`}
            >
              <Trash2 size={12} />
            </button>
          </span>
        ))}
      </div>
    </div>
  )
}
