import { Trash2 } from 'lucide-react'

export function ManageCategoriesPanel({ categories, onDelete }) {
  const handleDelete = (name) => {
    if (!confirm(`Delete "${name}"? Existing transactions using this category will keep their name.`)) return
    onDelete(name)
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
      <h2 className="text-sm font-semibold mb-3">Manage Categories</h2>
      <div className="flex flex-wrap gap-2">
        {categories.map(c => (
          <span key={c} className="flex items-center gap-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full px-3 py-1 text-sm">
            {c}
            <button
              type="button"
              onClick={() => handleDelete(c)}
              className="ml-1 text-red-400 hover:text-red-600"
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
