import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { ExchangeRateProvider } from './context/ExchangeRateContext'
import { NavBar } from './components/NavBar'
import { Dashboard } from './pages/Dashboard'
import { Accounts } from './pages/Accounts'
import { Transactions } from './pages/Transactions'
import { Analytics } from './pages/Analytics'

export default function App() {
  return (
    <ThemeProvider>
      <ExchangeRateProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white">
            <NavBar />
            <main className="max-w-5xl mx-auto px-4 py-8">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/accounts" element={<Accounts />} />
                <Route path="/transactions" element={<Transactions />} />
                <Route path="/analytics" element={<Analytics />} />
              </Routes>
            </main>
          </div>
        </BrowserRouter>
      </ExchangeRateProvider>
    </ThemeProvider>
  )
}
