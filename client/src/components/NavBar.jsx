import { NavLink } from 'react-router-dom'
import { Sun, Moon } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

export function NavBar() {
  const { theme, toggleTheme } = useTheme()

  const linkClass = ({ isActive }) =>
    `px-3 py-2 rounded text-sm font-medium transition-colors ${
      isActive
        ? 'bg-blue-600 text-white'
        : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
    }`

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between">
      <span className="font-bold text-lg text-gray-900 dark:text-white">Finance Dashboard</span>
      <div className="flex items-center gap-2">
        <NavLink to="/" end className={linkClass}>Dashboard</NavLink>
        <NavLink to="/accounts" className={linkClass}>Accounts</NavLink>
        <NavLink to="/transactions" className={linkClass}>Transactions</NavLink>
        <NavLink to="/analytics" className={linkClass}>Analytics</NavLink>
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="ml-2 p-2 rounded text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>
      </div>
    </nav>
  )
}
