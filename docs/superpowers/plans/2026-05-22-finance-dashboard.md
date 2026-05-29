# Finance Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a local-first personal finance dashboard with React + Vite frontend and Express backend to track BRL/EUR savings toward a €10,000 goal, with daily exchange rate conversion and spending analytics.

**Architecture:** Monorepo root runs both services with `concurrently`. React + Vite client on port 5173 proxies `/api` requests to an Express server on port 3001. Data persists to local JSON files in `server/data/`. Exchange rate fetched from `frankfurter.app` once per day and cached.

**Tech Stack:** React 18, Vite 5, Tailwind CSS 3, Recharts 2, React Router v6, Axios, Lucide React, Node.js 18+, Express 4, CORS, Jest, Supertest, Vitest, React Testing Library

---

## File Map

### Root
| File | Purpose |
|------|---------|
| `package.json` | Workspace root — `dev` script runs client + server via concurrently |

### Server (`server/`)
| File | Purpose |
|------|---------|
| `package.json` | deps: express, cors, axios; dev: jest, supertest |
| `app.js` | Express app (exported without listening — safe to import in tests) |
| `server.js` | Entry point — imports app.js, starts listening on port 3001 |
| `utils/fileStorage.js` | `readJSON(filePath)` / `writeJSON(filePath, data)` helpers |
| `routes/accounts.js` | GET/POST/PUT/DELETE `/api/accounts` |
| `routes/transactions.js` | GET/POST/PUT/DELETE `/api/transactions` |
| `routes/categories.js` | GET/POST `/api/categories` |
| `routes/exchangeRate.js` | GET `/api/exchange-rate` with daily cache |
| `data/accounts.json` | Initial: `[]` |
| `data/transactions.json` | Initial: `[]` |
| `data/categories.json` | Initial: default categories array |
| `data/exchange-rate-cache.json` | Initial: `{}` |
| `__tests__/fileStorage.test.js` | Unit tests for read/write helpers |
| `__tests__/accounts.test.js` | Route integration tests (mocked fileStorage) |
| `__tests__/transactions.test.js` | Route integration tests (mocked fileStorage) |
| `__tests__/categories.test.js` | Route integration tests (mocked fileStorage) |
| `__tests__/exchangeRate.test.js` | Route tests (mocked axios + fileStorage) |

### Client (`client/`)
| File | Purpose |
|------|---------|
| `package.json` | deps: react, react-dom, react-router-dom, axios, recharts, lucide-react; dev: vite, tailwind, vitest, RTL |
| `vite.config.js` | Vite config: React plugin, `/api` proxy to :3001, Vitest config |
| `tailwind.config.js` | `darkMode: 'class'`, content paths |
| `postcss.config.js` | tailwindcss + autoprefixer |
| `index.html` | Root HTML with `<div id="root">` |
| `src/main.jsx` | React entry point |
| `src/App.jsx` | BrowserRouter + providers + NavBar + Routes |
| `src/context/ThemeContext.jsx` | `ThemeProvider`, `useTheme` — dark/light toggle, localStorage |
| `src/context/ExchangeRateContext.jsx` | `ExchangeRateProvider`, `useExchangeRate` — fetches rate on mount |
| `src/api/accounts.js` | `getAccounts`, `createAccount`, `updateAccount`, `deleteAccount` |
| `src/api/transactions.js` | `getTransactions`, `createTransaction`, `updateTransaction`, `deleteTransaction` |
| `src/api/categories.js` | `getCategories`, `addCategory` |
| `src/api/exchangeRate.js` | `getExchangeRate` |
| `src/components/NavBar.jsx` | Top nav: title, page links, dark mode toggle button |
| `src/components/GoalProgressBar.jsx` | Visual progress bar toward €10,000 |
| `src/components/SummaryCard.jsx` | Reusable stat card (label + value) |
| `src/components/AccountForm.jsx` | Add/edit account form (name, bank, currency, balance) |
| `src/components/TransactionForm.jsx` | Add/edit transaction form (date, type, amount, currency, category, description) |
| `src/pages/Dashboard.jsx` | Exchange rate + goal progress + monthly summary cards |
| `src/pages/Accounts.jsx` | Account list + add/edit/delete |
| `src/pages/Transactions.jsx` | Transaction list + month/category/type filters + add/edit/delete |
| `src/pages/Analytics.jsx` | Pie chart (expenses by category) + bar chart (monthly income vs expenses) |
| `src/test/setup.js` | Vitest global setup — extends expect with jest-dom matchers |
| `src/__tests__/ThemeContext.test.jsx` | Toggle + localStorage persistence |
| `src/__tests__/ExchangeRateContext.test.jsx` | Fetches rate on mount, provides to children |
| `src/__tests__/NavBar.test.jsx` | Renders links, calls toggleTheme on click |
| `src/__tests__/Dashboard.test.jsx` | Renders rate, progress bar, summary cards |
| `src/__tests__/Accounts.test.jsx` | Renders list, opens form, deletes |
| `src/__tests__/Transactions.test.jsx` | Renders list, filters work |
| `src/__tests__/Analytics.test.jsx` | Charts render (Recharts mocked) |

---

## Task 1: Root Scaffold

**Files:**
- Create: `package.json`

- [ ] **Step 1: Create root package.json**

```json
{
  "name": "finance-dashboard",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "concurrently \"npm run dev --prefix server\" \"npm run dev --prefix client\"",
    "install:all": "npm install && npm install --prefix server && npm install --prefix client"
  },
  "devDependencies": {
    "concurrently": "^8.2.2"
  }
}
```

- [ ] **Step 2: Install root dependencies**

Run: `npm install`
Expected: `node_modules/` created with concurrently.

- [ ] **Step 3: Commit**

```bash
git init
git add package.json
git commit -m "feat: add root monorepo scaffold"
```

---

## Task 2: Server Scaffold

**Files:**
- Create: `server/package.json`
- Create: `server/app.js`
- Create: `server/server.js`
- Create: `server/data/accounts.json`
- Create: `server/data/transactions.json`
- Create: `server/data/categories.json`
- Create: `server/data/exchange-rate-cache.json`

- [ ] **Step 1: Create server/package.json**

```json
{
  "name": "finance-dashboard-server",
  "version": "1.0.0",
  "scripts": {
    "dev": "node --watch server.js",
    "test": "jest --runInBand"
  },
  "dependencies": {
    "axios": "^1.7.2",
    "cors": "^2.8.5",
    "express": "^4.19.2"
  },
  "devDependencies": {
    "jest": "^29.7.0",
    "supertest": "^7.0.0"
  },
  "jest": {
    "testEnvironment": "node"
  }
}
```

- [ ] **Step 2: Create server/app.js**

```js
const express = require('express')
const cors = require('cors')

const accountsRouter = require('./routes/accounts')
const transactionsRouter = require('./routes/transactions')
const categoriesRouter = require('./routes/categories')
const exchangeRateRouter = require('./routes/exchangeRate')

const app = express()
app.use(cors())
app.use(express.json())

app.use('/api/accounts', accountsRouter)
app.use('/api/transactions', transactionsRouter)
app.use('/api/categories', categoriesRouter)
app.use('/api/exchange-rate', exchangeRateRouter)

module.exports = app
```

- [ ] **Step 3: Create server/server.js**

```js
const app = require('./app')
const PORT = 3001
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`))
```

- [ ] **Step 4: Create initial data files**

`server/data/accounts.json`:
```json
[]
```

`server/data/transactions.json`:
```json
[]
```

`server/data/categories.json`:
```json
["Food", "Rent", "Transport", "Health", "Salary", "Travel", "Other"]
```

`server/data/exchange-rate-cache.json`:
```json
{}
```

- [ ] **Step 5: Install server dependencies**

Run (from `server/`): `npm install`
Expected: `server/node_modules/` created.

- [ ] **Step 6: Commit**

```bash
git add server/
git commit -m "feat: add express server scaffold and data files"
```

---

## Task 3: File Storage Utility (TDD)

**Files:**
- Create: `server/utils/fileStorage.js`
- Create: `server/__tests__/fileStorage.test.js`

- [ ] **Step 1: Write the failing test**

`server/__tests__/fileStorage.test.js`:
```js
const os = require('os')
const path = require('path')
const fs = require('fs').promises
const { readJSON, writeJSON } = require('../utils/fileStorage')

describe('fileStorage', () => {
  let tmpFile

  beforeEach(() => {
    tmpFile = path.join(os.tmpdir(), `test-${Date.now()}.json`)
  })

  afterEach(async () => {
    try { await fs.unlink(tmpFile) } catch {}
  })

  it('writes and reads JSON data', async () => {
    const data = [{ id: '1', name: 'Test' }]
    await writeJSON(tmpFile, data)
    const result = await readJSON(tmpFile)
    expect(result).toEqual(data)
  })

  it('returns null when file does not exist', async () => {
    const result = await readJSON('/nonexistent/path/file.json')
    expect(result).toBeNull()
  })

  it('overwrites existing file content', async () => {
    await writeJSON(tmpFile, { old: true })
    await writeJSON(tmpFile, { new: true })
    const result = await readJSON(tmpFile)
    expect(result).toEqual({ new: true })
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run (from `server/`): `npm test -- --testPathPattern=fileStorage`
Expected: FAIL — `Cannot find module '../utils/fileStorage'`

- [ ] **Step 3: Implement fileStorage**

`server/utils/fileStorage.js`:
```js
const fs = require('fs').promises

async function readJSON(filePath) {
  try {
    const data = await fs.readFile(filePath, 'utf8')
    return JSON.parse(data)
  } catch {
    return null
  }
}

async function writeJSON(filePath, data) {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8')
}

module.exports = { readJSON, writeJSON }
```

- [ ] **Step 4: Run test to verify it passes**

Run (from `server/`): `npm test -- --testPathPattern=fileStorage`
Expected: PASS — 3 tests passing.

- [ ] **Step 5: Commit**

```bash
git add server/utils/fileStorage.js server/__tests__/fileStorage.test.js
git commit -m "feat: add file storage utility with read/write JSON helpers"
```

---

## Task 4: Exchange Rate Route (TDD)

**Files:**
- Create: `server/routes/exchangeRate.js`
- Create: `server/__tests__/exchangeRate.test.js`

- [ ] **Step 1: Write the failing test**

`server/__tests__/exchangeRate.test.js`:
```js
const request = require('supertest')
const app = require('../app')

jest.mock('../utils/fileStorage')
jest.mock('axios')

const { readJSON, writeJSON } = require('../utils/fileStorage')
const axios = require('axios')

describe('GET /api/exchange-rate', () => {
  const today = new Date().toISOString().split('T')[0]

  beforeEach(() => {
    jest.clearAllMocks()
    writeJSON.mockResolvedValue()
  })

  it('returns cached rate when cache date matches today', async () => {
    readJSON.mockResolvedValue({ date: today, rate: 5.85 })

    const res = await request(app).get('/api/exchange-rate')

    expect(res.status).toBe(200)
    expect(res.body).toEqual({ date: today, rate: 5.85 })
    expect(axios.get).not.toHaveBeenCalled()
  })

  it('fetches new rate and caches it when cache is stale', async () => {
    readJSON.mockResolvedValue({ date: '2020-01-01', rate: 5.0 })
    axios.get.mockResolvedValue({ data: { rates: { BRL: 5.85 } } })

    const res = await request(app).get('/api/exchange-rate')

    expect(res.status).toBe(200)
    expect(res.body.rate).toBe(5.85)
    expect(res.body.date).toBe(today)
    expect(writeJSON).toHaveBeenCalledWith(
      expect.stringContaining('exchange-rate-cache.json'),
      { date: today, rate: 5.85 }
    )
  })

  it('fetches new rate when cache is empty', async () => {
    readJSON.mockResolvedValue(null)
    axios.get.mockResolvedValue({ data: { rates: { BRL: 5.90 } } })

    const res = await request(app).get('/api/exchange-rate')

    expect(res.status).toBe(200)
    expect(res.body.rate).toBe(5.90)
  })

  it('returns 500 when external API fails', async () => {
    readJSON.mockResolvedValue(null)
    axios.get.mockRejectedValue(new Error('Network error'))

    const res = await request(app).get('/api/exchange-rate')

    expect(res.status).toBe(500)
    expect(res.body).toHaveProperty('error')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run (from `server/`): `npm test -- --testPathPattern=exchangeRate`
Expected: FAIL — `Cannot find module '../routes/exchangeRate'`

- [ ] **Step 3: Implement the exchange rate route**

`server/routes/exchangeRate.js`:
```js
const express = require('express')
const axios = require('axios')
const path = require('path')
const { readJSON, writeJSON } = require('../utils/fileStorage')

const router = express.Router()
const CACHE_PATH = path.join(__dirname, '../data/exchange-rate-cache.json')

router.get('/', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0]
    const cache = await readJSON(CACHE_PATH)

    if (cache && cache.date === today) {
      return res.json({ date: cache.date, rate: cache.rate })
    }

    const response = await axios.get('https://api.frankfurter.app/latest?from=EUR&to=BRL')
    const rate = response.data.rates.BRL
    const newCache = { date: today, rate }

    await writeJSON(CACHE_PATH, newCache)
    res.json(newCache)
  } catch {
    res.status(500).json({ error: 'Failed to fetch exchange rate' })
  }
})

module.exports = router
```

- [ ] **Step 4: Run test to verify it passes**

Run (from `server/`): `npm test -- --testPathPattern=exchangeRate`
Expected: PASS — 4 tests passing.

- [ ] **Step 5: Commit**

```bash
git add server/routes/exchangeRate.js server/__tests__/exchangeRate.test.js
git commit -m "feat: add exchange rate route with daily frankfurter.app cache"
```

---

## Task 5: Accounts Routes (TDD)

**Files:**
- Create: `server/routes/accounts.js`
- Create: `server/__tests__/accounts.test.js`

- [ ] **Step 1: Write the failing test**

`server/__tests__/accounts.test.js`:
```js
const request = require('supertest')
const app = require('../app')

jest.mock('../utils/fileStorage')
const { readJSON, writeJSON } = require('../utils/fileStorage')

const mockAccounts = [
  { id: 'abc-1', name: 'Nubank', bank: 'Nubank', currency: 'BRL', balance: 10000, updatedAt: '2026-01-01' },
  { id: 'abc-2', name: 'Wise', bank: 'Wise', currency: 'EUR', balance: 500, updatedAt: '2026-01-01' }
]

beforeEach(() => {
  jest.clearAllMocks()
  writeJSON.mockResolvedValue()
})

describe('GET /api/accounts', () => {
  it('returns all accounts', async () => {
    readJSON.mockResolvedValue(mockAccounts)
    const res = await request(app).get('/api/accounts')
    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(2)
    expect(res.body[0].name).toBe('Nubank')
  })

  it('returns empty array when no accounts exist', async () => {
    readJSON.mockResolvedValue(null)
    const res = await request(app).get('/api/accounts')
    expect(res.status).toBe(200)
    expect(res.body).toEqual([])
  })
})

describe('POST /api/accounts', () => {
  it('creates a new account with id and updatedAt', async () => {
    readJSON.mockResolvedValue([])
    const payload = { name: 'Itaú', bank: 'Itaú', currency: 'BRL', balance: 5000 }
    const res = await request(app).post('/api/accounts').send(payload)
    expect(res.status).toBe(201)
    expect(res.body.id).toBeDefined()
    expect(res.body.name).toBe('Itaú')
    expect(res.body.updatedAt).toBeDefined()
    expect(writeJSON).toHaveBeenCalledWith(
      expect.stringContaining('accounts.json'),
      expect.arrayContaining([expect.objectContaining({ name: 'Itaú' })])
    )
  })
})

describe('PUT /api/accounts/:id', () => {
  it('updates an existing account', async () => {
    readJSON.mockResolvedValue([...mockAccounts])
    const res = await request(app).put('/api/accounts/abc-1').send({ balance: 15000 })
    expect(res.status).toBe(200)
    expect(res.body.balance).toBe(15000)
    expect(res.body.id).toBe('abc-1')
  })

  it('returns 404 for unknown id', async () => {
    readJSON.mockResolvedValue(mockAccounts)
    const res = await request(app).put('/api/accounts/unknown').send({ balance: 100 })
    expect(res.status).toBe(404)
  })
})

describe('DELETE /api/accounts/:id', () => {
  it('removes an account', async () => {
    readJSON.mockResolvedValue([...mockAccounts])
    const res = await request(app).delete('/api/accounts/abc-1')
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ success: true })
    const saved = writeJSON.mock.calls[0][1]
    expect(saved).toHaveLength(1)
    expect(saved[0].id).toBe('abc-2')
  })

  it('returns 404 for unknown id', async () => {
    readJSON.mockResolvedValue(mockAccounts)
    const res = await request(app).delete('/api/accounts/unknown')
    expect(res.status).toBe(404)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run (from `server/`): `npm test -- --testPathPattern=accounts`
Expected: FAIL — `Cannot find module '../routes/accounts'`

- [ ] **Step 3: Implement the accounts route**

`server/routes/accounts.js`:
```js
const express = require('express')
const path = require('path')
const { readJSON, writeJSON } = require('../utils/fileStorage')

const router = express.Router()
const DATA_PATH = path.join(__dirname, '../data/accounts.json')

router.get('/', async (req, res) => {
  const accounts = await readJSON(DATA_PATH) || []
  res.json(accounts)
})

router.post('/', async (req, res) => {
  const accounts = await readJSON(DATA_PATH) || []
  const account = {
    id: crypto.randomUUID(),
    ...req.body,
    updatedAt: new Date().toISOString().split('T')[0]
  }
  accounts.push(account)
  await writeJSON(DATA_PATH, accounts)
  res.status(201).json(account)
})

router.put('/:id', async (req, res) => {
  const accounts = await readJSON(DATA_PATH) || []
  const index = accounts.findIndex(a => a.id === req.params.id)
  if (index === -1) return res.status(404).json({ error: 'Account not found' })
  accounts[index] = {
    ...accounts[index],
    ...req.body,
    updatedAt: new Date().toISOString().split('T')[0]
  }
  await writeJSON(DATA_PATH, accounts)
  res.json(accounts[index])
})

router.delete('/:id', async (req, res) => {
  const accounts = await readJSON(DATA_PATH) || []
  const filtered = accounts.filter(a => a.id !== req.params.id)
  if (filtered.length === accounts.length) return res.status(404).json({ error: 'Account not found' })
  await writeJSON(DATA_PATH, filtered)
  res.json({ success: true })
})

module.exports = router
```

- [ ] **Step 4: Run test to verify it passes**

Run (from `server/`): `npm test -- --testPathPattern=accounts`
Expected: PASS — 6 tests passing.

- [ ] **Step 5: Commit**

```bash
git add server/routes/accounts.js server/__tests__/accounts.test.js
git commit -m "feat: add accounts CRUD routes"
```

---

## Task 6: Transactions Routes (TDD)

**Files:**
- Create: `server/routes/transactions.js`
- Create: `server/__tests__/transactions.test.js`

- [ ] **Step 1: Write the failing test**

`server/__tests__/transactions.test.js`:
```js
const request = require('supertest')
const app = require('../app')

jest.mock('../utils/fileStorage')
const { readJSON, writeJSON } = require('../utils/fileStorage')

const mockTransactions = [
  { id: 'tx-1', date: '2026-05-01', type: 'income', amount: 5000, currency: 'BRL', category: 'Salary', description: 'Monthly salary' },
  { id: 'tx-2', date: '2026-05-10', type: 'expense', amount: 200, currency: 'BRL', category: 'Food', description: 'Groceries' }
]

beforeEach(() => {
  jest.clearAllMocks()
  writeJSON.mockResolvedValue()
})

describe('GET /api/transactions', () => {
  it('returns all transactions', async () => {
    readJSON.mockResolvedValue(mockTransactions)
    const res = await request(app).get('/api/transactions')
    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(2)
    expect(res.body[0].category).toBe('Salary')
  })

  it('returns empty array when no transactions exist', async () => {
    readJSON.mockResolvedValue(null)
    const res = await request(app).get('/api/transactions')
    expect(res.status).toBe(200)
    expect(res.body).toEqual([])
  })
})

describe('POST /api/transactions', () => {
  it('creates a new transaction with id', async () => {
    readJSON.mockResolvedValue([])
    const payload = { date: '2026-05-22', type: 'expense', amount: 50, currency: 'EUR', category: 'Food', description: 'Lunch' }
    const res = await request(app).post('/api/transactions').send(payload)
    expect(res.status).toBe(201)
    expect(res.body.id).toBeDefined()
    expect(res.body.description).toBe('Lunch')
  })
})

describe('PUT /api/transactions/:id', () => {
  it('updates an existing transaction', async () => {
    readJSON.mockResolvedValue([...mockTransactions])
    const res = await request(app).put('/api/transactions/tx-2').send({ amount: 250 })
    expect(res.status).toBe(200)
    expect(res.body.amount).toBe(250)
    expect(res.body.id).toBe('tx-2')
  })

  it('returns 404 for unknown id', async () => {
    readJSON.mockResolvedValue(mockTransactions)
    const res = await request(app).put('/api/transactions/unknown').send({ amount: 100 })
    expect(res.status).toBe(404)
  })
})

describe('DELETE /api/transactions/:id', () => {
  it('removes a transaction', async () => {
    readJSON.mockResolvedValue([...mockTransactions])
    const res = await request(app).delete('/api/transactions/tx-1')
    expect(res.status).toBe(200)
    const saved = writeJSON.mock.calls[0][1]
    expect(saved).toHaveLength(1)
    expect(saved[0].id).toBe('tx-2')
  })

  it('returns 404 for unknown id', async () => {
    readJSON.mockResolvedValue(mockTransactions)
    const res = await request(app).delete('/api/transactions/unknown')
    expect(res.status).toBe(404)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run (from `server/`): `npm test -- --testPathPattern=transactions`
Expected: FAIL — `Cannot find module '../routes/transactions'`

- [ ] **Step 3: Implement the transactions route**

`server/routes/transactions.js`:
```js
const express = require('express')
const path = require('path')
const { readJSON, writeJSON } = require('../utils/fileStorage')

const router = express.Router()
const DATA_PATH = path.join(__dirname, '../data/transactions.json')

router.get('/', async (req, res) => {
  const transactions = await readJSON(DATA_PATH) || []
  res.json(transactions)
})

router.post('/', async (req, res) => {
  const transactions = await readJSON(DATA_PATH) || []
  const transaction = { id: crypto.randomUUID(), ...req.body }
  transactions.push(transaction)
  await writeJSON(DATA_PATH, transactions)
  res.status(201).json(transaction)
})

router.put('/:id', async (req, res) => {
  const transactions = await readJSON(DATA_PATH) || []
  const index = transactions.findIndex(t => t.id === req.params.id)
  if (index === -1) return res.status(404).json({ error: 'Transaction not found' })
  transactions[index] = { ...transactions[index], ...req.body }
  await writeJSON(DATA_PATH, transactions)
  res.json(transactions[index])
})

router.delete('/:id', async (req, res) => {
  const transactions = await readJSON(DATA_PATH) || []
  const filtered = transactions.filter(t => t.id !== req.params.id)
  if (filtered.length === transactions.length) return res.status(404).json({ error: 'Transaction not found' })
  await writeJSON(DATA_PATH, filtered)
  res.json({ success: true })
})

module.exports = router
```

- [ ] **Step 4: Run test to verify it passes**

Run (from `server/`): `npm test -- --testPathPattern=transactions`
Expected: PASS — 6 tests passing.

- [ ] **Step 5: Commit**

```bash
git add server/routes/transactions.js server/__tests__/transactions.test.js
git commit -m "feat: add transactions CRUD routes"
```

---

## Task 7: Categories Routes (TDD)

**Files:**
- Create: `server/routes/categories.js`
- Create: `server/__tests__/categories.test.js`

- [ ] **Step 1: Write the failing test**

`server/__tests__/categories.test.js`:
```js
const request = require('supertest')
const app = require('../app')

jest.mock('../utils/fileStorage')
const { readJSON, writeJSON } = require('../utils/fileStorage')

const mockCategories = ['Food', 'Rent', 'Salary']

beforeEach(() => {
  jest.clearAllMocks()
  writeJSON.mockResolvedValue()
})

describe('GET /api/categories', () => {
  it('returns all categories', async () => {
    readJSON.mockResolvedValue(mockCategories)
    const res = await request(app).get('/api/categories')
    expect(res.status).toBe(200)
    expect(res.body).toEqual(mockCategories)
  })

  it('returns empty array when no categories exist', async () => {
    readJSON.mockResolvedValue(null)
    const res = await request(app).get('/api/categories')
    expect(res.status).toBe(200)
    expect(res.body).toEqual([])
  })
})

describe('POST /api/categories', () => {
  it('adds a new category', async () => {
    readJSON.mockResolvedValue([...mockCategories])
    const res = await request(app).post('/api/categories').send({ name: 'Travel' })
    expect(res.status).toBe(201)
    expect(res.body).toContain('Travel')
    expect(writeJSON).toHaveBeenCalledWith(
      expect.stringContaining('categories.json'),
      expect.arrayContaining(['Travel'])
    )
  })

  it('does not add duplicate categories', async () => {
    readJSON.mockResolvedValue([...mockCategories])
    const res = await request(app).post('/api/categories').send({ name: 'Food' })
    expect(res.status).toBe(200)
    const saved = writeJSON.mock.calls
    expect(saved).toHaveLength(0)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run (from `server/`): `npm test -- --testPathPattern=categories`
Expected: FAIL — `Cannot find module '../routes/categories'`

- [ ] **Step 3: Implement the categories route**

`server/routes/categories.js`:
```js
const express = require('express')
const path = require('path')
const { readJSON, writeJSON } = require('../utils/fileStorage')

const router = express.Router()
const DATA_PATH = path.join(__dirname, '../data/categories.json')

router.get('/', async (req, res) => {
  const categories = await readJSON(DATA_PATH) || []
  res.json(categories)
})

router.post('/', async (req, res) => {
  const categories = await readJSON(DATA_PATH) || []
  const { name } = req.body
  if (categories.includes(name)) return res.status(200).json(categories)
  categories.push(name)
  await writeJSON(DATA_PATH, categories)
  res.status(201).json(categories)
})

module.exports = router
```

- [ ] **Step 4: Run test to verify it passes**

Run (from `server/`): `npm test -- --testPathPattern=categories`
Expected: PASS — 4 tests passing.

- [ ] **Step 5: Run all server tests**

Run (from `server/`): `npm test`
Expected: PASS — all 19+ tests across all test files passing.

- [ ] **Step 6: Commit**

```bash
git add server/routes/categories.js server/__tests__/categories.test.js
git commit -m "feat: add categories routes with duplicate prevention"
```

---

## Task 8: Client Scaffold

**Files:**
- Create: `client/` (Vite React app)
- Create: `client/vite.config.js`
- Create: `client/tailwind.config.js`
- Create: `client/postcss.config.js`
- Create: `client/src/test/setup.js`

- [ ] **Step 1: Scaffold React + Vite app**

Run (from project root): `npm create vite@latest client -- --template react`
Expected: `client/` directory created with React template.

- [ ] **Step 2: Install client dependencies**

Run (from `client/`):
```
npm install
npm install axios react-router-dom recharts lucide-react
npm install -D tailwindcss@3 postcss autoprefixer vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
npx tailwindcss init -p
```

- [ ] **Step 3: Replace client/vite.config.js**

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:3001'
    }
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
    globals: true
  }
})
```

- [ ] **Step 4: Replace client/tailwind.config.js**

```js
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {}
  },
  plugins: []
}
```

- [ ] **Step 5: Create client/src/test/setup.js**

```js
import '@testing-library/jest-dom'
```

- [ ] **Step 6: Replace client/src/index.css with Tailwind directives**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] **Step 7: Verify test setup works**

Run (from `client/`): `npx vitest run`
Expected: no test files found yet, exits 0 (or "no tests").

- [ ] **Step 8: Commit**

```bash
git add client/
git commit -m "feat: add React+Vite client scaffold with Tailwind and Vitest"
```

---

## Task 9: ThemeContext (TDD)

**Files:**
- Create: `client/src/context/ThemeContext.jsx`
- Create: `client/src/__tests__/ThemeContext.test.jsx`

- [ ] **Step 1: Write the failing test**

`client/src/__tests__/ThemeContext.test.jsx`:
```jsx
import { render, screen, fireEvent } from '@testing-library/react'
import { ThemeProvider, useTheme } from '../context/ThemeContext'

function TestConsumer() {
  const { theme, toggleTheme } = useTheme()
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <button onClick={toggleTheme}>Toggle</button>
    </div>
  )
}

describe('ThemeContext', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.classList.remove('dark')
  })

  it('defaults to light theme when localStorage is empty', () => {
    render(<ThemeProvider><TestConsumer /></ThemeProvider>)
    expect(screen.getByTestId('theme')).toHaveTextContent('light')
  })

  it('reads initial theme from localStorage', () => {
    localStorage.setItem('theme', 'dark')
    render(<ThemeProvider><TestConsumer /></ThemeProvider>)
    expect(screen.getByTestId('theme')).toHaveTextContent('dark')
  })

  it('toggles from light to dark and adds dark class to html', () => {
    render(<ThemeProvider><TestConsumer /></ThemeProvider>)
    fireEvent.click(screen.getByText('Toggle'))
    expect(screen.getByTestId('theme')).toHaveTextContent('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('persists theme to localStorage on toggle', () => {
    render(<ThemeProvider><TestConsumer /></ThemeProvider>)
    fireEvent.click(screen.getByText('Toggle'))
    expect(localStorage.getItem('theme')).toBe('dark')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run (from `client/`): `npx vitest run __tests__/ThemeContext`
Expected: FAIL — `Cannot find module '../context/ThemeContext'`

- [ ] **Step 3: Implement ThemeContext**

`client/src/context/ThemeContext.jsx`:
```jsx
import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light')

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => setTheme(t => t === 'light' ? 'dark' : 'light')

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
```

- [ ] **Step 4: Run test to verify it passes**

Run (from `client/`): `npx vitest run __tests__/ThemeContext`
Expected: PASS — 4 tests passing.

- [ ] **Step 5: Commit**

```bash
git add client/src/context/ThemeContext.jsx client/src/__tests__/ThemeContext.test.jsx
git commit -m "feat: add ThemeContext with dark mode toggle and localStorage persistence"
```

---

## Task 10: ExchangeRateContext (TDD)

**Files:**
- Create: `client/src/api/exchangeRate.js`
- Create: `client/src/context/ExchangeRateContext.jsx`
- Create: `client/src/__tests__/ExchangeRateContext.test.jsx`

- [ ] **Step 1: Create the API module first**

`client/src/api/exchangeRate.js`:
```js
import axios from 'axios'
export const getExchangeRate = () => axios.get('/api/exchange-rate').then(r => r.data.rate)
```

- [ ] **Step 2: Write the failing test**

`client/src/__tests__/ExchangeRateContext.test.jsx`:
```jsx
import { render, screen, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import { ExchangeRateProvider, useExchangeRate } from '../context/ExchangeRateContext'

vi.mock('../api/exchangeRate', () => ({
  getExchangeRate: vi.fn().mockResolvedValue(5.85)
}))

function TestConsumer() {
  const rate = useExchangeRate()
  return <span data-testid="rate">{rate ?? 'loading'}</span>
}

describe('ExchangeRateContext', () => {
  it('shows loading state before rate is fetched', () => {
    render(<ExchangeRateProvider><TestConsumer /></ExchangeRateProvider>)
    expect(screen.getByTestId('rate')).toHaveTextContent('loading')
  })

  it('provides exchange rate after fetch', async () => {
    render(<ExchangeRateProvider><TestConsumer /></ExchangeRateProvider>)
    await waitFor(() => expect(screen.getByTestId('rate')).toHaveTextContent('5.85'))
  })
})
```

- [ ] **Step 3: Run test to verify it fails**

Run (from `client/`): `npx vitest run __tests__/ExchangeRateContext`
Expected: FAIL — `Cannot find module '../context/ExchangeRateContext'`

- [ ] **Step 4: Implement ExchangeRateContext**

`client/src/context/ExchangeRateContext.jsx`:
```jsx
import { createContext, useContext, useState, useEffect } from 'react'
import { getExchangeRate } from '../api/exchangeRate'

const ExchangeRateContext = createContext(null)

export function ExchangeRateProvider({ children }) {
  const [rate, setRate] = useState(null)

  useEffect(() => {
    getExchangeRate().then(setRate)
  }, [])

  return (
    <ExchangeRateContext.Provider value={rate}>
      {children}
    </ExchangeRateContext.Provider>
  )
}

export const useExchangeRate = () => useContext(ExchangeRateContext)
```

- [ ] **Step 5: Run test to verify it passes**

Run (from `client/`): `npx vitest run __tests__/ExchangeRateContext`
Expected: PASS — 2 tests passing.

- [ ] **Step 6: Commit**

```bash
git add client/src/api/exchangeRate.js client/src/context/ExchangeRateContext.jsx client/src/__tests__/ExchangeRateContext.test.jsx
git commit -m "feat: add ExchangeRateContext that fetches BRL/EUR rate on mount"
```

---

## Task 11: Remaining API Modules + NavBar

**Files:**
- Create: `client/src/api/accounts.js`
- Create: `client/src/api/transactions.js`
- Create: `client/src/api/categories.js`
- Create: `client/src/components/NavBar.jsx`
- Create: `client/src/__tests__/NavBar.test.jsx`

- [ ] **Step 1: Create API modules**

`client/src/api/accounts.js`:
```js
import axios from 'axios'
export const getAccounts = () => axios.get('/api/accounts').then(r => r.data)
export const createAccount = (data) => axios.post('/api/accounts', data).then(r => r.data)
export const updateAccount = (id, data) => axios.put(`/api/accounts/${id}`, data).then(r => r.data)
export const deleteAccount = (id) => axios.delete(`/api/accounts/${id}`).then(r => r.data)
```

`client/src/api/transactions.js`:
```js
import axios from 'axios'
export const getTransactions = () => axios.get('/api/transactions').then(r => r.data)
export const createTransaction = (data) => axios.post('/api/transactions', data).then(r => r.data)
export const updateTransaction = (id, data) => axios.put(`/api/transactions/${id}`, data).then(r => r.data)
export const deleteTransaction = (id) => axios.delete(`/api/transactions/${id}`).then(r => r.data)
```

`client/src/api/categories.js`:
```js
import axios from 'axios'
export const getCategories = () => axios.get('/api/categories').then(r => r.data)
export const addCategory = (name) => axios.post('/api/categories', { name }).then(r => r.data)
```

- [ ] **Step 2: Write the NavBar test**

`client/src/__tests__/NavBar.test.jsx`:
```jsx
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import { NavBar } from '../components/NavBar'

const mockToggleTheme = vi.fn()

vi.mock('../context/ThemeContext', () => ({
  useTheme: () => ({ theme: 'light', toggleTheme: mockToggleTheme })
}))

function renderNavBar() {
  return render(<MemoryRouter><NavBar /></MemoryRouter>)
}

describe('NavBar', () => {
  it('renders all navigation links', () => {
    renderNavBar()
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Accounts')).toBeInTheDocument()
    expect(screen.getByText('Transactions')).toBeInTheDocument()
    expect(screen.getByText('Analytics')).toBeInTheDocument()
  })

  it('calls toggleTheme when theme button is clicked', () => {
    renderNavBar()
    fireEvent.click(screen.getByRole('button', { name: /toggle theme/i }))
    expect(mockToggleTheme).toHaveBeenCalledTimes(1)
  })
})
```

- [ ] **Step 3: Run test to verify it fails**

Run (from `client/`): `npx vitest run __tests__/NavBar`
Expected: FAIL — `Cannot find module '../components/NavBar'`

- [ ] **Step 4: Implement NavBar**

`client/src/components/NavBar.jsx`:
```jsx
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
```

- [ ] **Step 5: Run test to verify it passes**

Run (from `client/`): `npx vitest run __tests__/NavBar`
Expected: PASS — 2 tests passing.

- [ ] **Step 6: Commit**

```bash
git add client/src/api/ client/src/components/NavBar.jsx client/src/__tests__/NavBar.test.jsx
git commit -m "feat: add API modules and NavBar with dark mode toggle"
```

---

## Task 12: Shared Components + App.jsx Wiring

**Files:**
- Create: `client/src/components/GoalProgressBar.jsx`
- Create: `client/src/components/SummaryCard.jsx`
- Create: `client/src/components/AccountForm.jsx`
- Create: `client/src/components/TransactionForm.jsx`
- Modify: `client/src/App.jsx`
- Modify: `client/src/main.jsx`

- [ ] **Step 1: Create GoalProgressBar**

`client/src/components/GoalProgressBar.jsx`:
```jsx
const GOAL = 10000

export function GoalProgressBar({ totalEUR }) {
  const percentage = Math.min((totalEUR / GOAL) * 100, 100)
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm font-medium text-gray-700 dark:text-gray-200">
        <span>€{totalEUR.toFixed(2)} saved</span>
        <span>Goal: €{GOAL.toLocaleString()}</span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-5">
        <div
          className="bg-green-500 h-5 rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 text-right">
        {percentage.toFixed(1)}% of goal reached
      </p>
    </div>
  )
}
```

- [ ] **Step 2: Create SummaryCard**

`client/src/components/SummaryCard.jsx`:
```jsx
export function SummaryCard({ label, value, color = 'text-gray-900 dark:text-white' }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-5 shadow-sm border border-gray-200 dark:border-gray-700">
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
    </div>
  )
}
```

- [ ] **Step 3: Create AccountForm**

`client/src/components/AccountForm.jsx`:
```jsx
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
```

- [ ] **Step 4: Create TransactionForm**

`client/src/components/TransactionForm.jsx`:
```jsx
import { useState } from 'react'

const EMPTY = { date: new Date().toISOString().split('T')[0], type: 'expense', amount: '', currency: 'BRL', category: '', description: '' }

export function TransactionForm({ initial = EMPTY, categories = [], onSubmit, onCancel }) {
  const [form, setForm] = useState(initial)

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({ ...form, amount: parseFloat(form.amount) })
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
      <select
        className="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        value={form.category}
        onChange={set('category')}
        required
      >
        <option value="">Select category</option>
        {categories.map(c => <option key={c} value={c}>{c}</option>)}
      </select>
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
```

- [ ] **Step 5: Wire up App.jsx**

`client/src/App.jsx`:
```jsx
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
```

- [ ] **Step 6: Update main.jsx**

`client/src/main.jsx`:
```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)
```

- [ ] **Step 7: Commit**

```bash
git add client/src/components/ client/src/App.jsx client/src/main.jsx
git commit -m "feat: add shared components and wire up App with router and providers"
```

---

## Task 13: Dashboard Page (TDD)

**Files:**
- Create: `client/src/pages/Dashboard.jsx`
- Create: `client/src/__tests__/Dashboard.test.jsx`

- [ ] **Step 1: Write the failing test**

`client/src/__tests__/Dashboard.test.jsx`:
```jsx
import { render, screen, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import { Dashboard } from '../pages/Dashboard'

vi.mock('../context/ExchangeRateContext', () => ({
  useExchangeRate: () => 5.85
}))

vi.mock('../api/accounts', () => ({
  getAccounts: vi.fn().mockResolvedValue([
    { id: '1', name: 'Wise', bank: 'Wise', currency: 'EUR', balance: 1000, updatedAt: '2026-05-22' },
    { id: '2', name: 'Nubank', bank: 'Nubank', currency: 'BRL', balance: 5850, updatedAt: '2026-05-22' }
  ])
}))

vi.mock('../api/transactions', () => ({
  getTransactions: vi.fn().mockResolvedValue([
    { id: 'tx-1', date: '2026-05-10', type: 'income', amount: 3000, currency: 'BRL', category: 'Salary', description: '' },
    { id: 'tx-2', date: '2026-05-15', type: 'expense', amount: 200, currency: 'BRL', category: 'Food', description: '' }
  ])
}))

describe('Dashboard', () => {
  it('displays the exchange rate', async () => {
    render(<Dashboard />)
    await waitFor(() => expect(screen.getByText(/5\.85/)).toBeInTheDocument())
  })

  it('shows total savings as EUR equivalent', async () => {
    render(<Dashboard />)
    // EUR: 1000 + (5850 / 5.85) = 1000 + 1000 = €2000.00
    await waitFor(() => expect(screen.getByText(/2000\.00/)).toBeInTheDocument())
  })

  it('renders the goal progress bar', async () => {
    render(<Dashboard />)
    await waitFor(() => expect(screen.getByRole('progressbar')).toBeInTheDocument())
  })

  it('shows monthly income and expense summary cards', async () => {
    render(<Dashboard />)
    await waitFor(() => {
      expect(screen.getByText('Income This Month')).toBeInTheDocument()
      expect(screen.getByText('Expenses This Month')).toBeInTheDocument()
      expect(screen.getByText('Net This Month')).toBeInTheDocument()
    })
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run (from `client/`): `npx vitest run __tests__/Dashboard`
Expected: FAIL — `Cannot find module '../pages/Dashboard'`

- [ ] **Step 3: Implement Dashboard page**

`client/src/pages/Dashboard.jsx`:
```jsx
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
  const income = monthTx.filter(t => t.type === 'income').reduce((s, t) => s + toEUR(t.amount, t.currency, rate || 1), 0)
  const expenses = monthTx.filter(t => t.type === 'expense').reduce((s, t) => s + toEUR(t.amount, t.currency, rate || 1), 0)
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
```

- [ ] **Step 4: Run test to verify it passes**

Run (from `client/`): `npx vitest run __tests__/Dashboard`
Expected: PASS — 4 tests passing.

- [ ] **Step 5: Commit**

```bash
git add client/src/pages/Dashboard.jsx client/src/__tests__/Dashboard.test.jsx
git commit -m "feat: add Dashboard page with exchange rate, goal progress, and monthly summary"
```

---

## Task 14: Accounts Page (TDD)

**Files:**
- Create: `client/src/pages/Accounts.jsx`
- Create: `client/src/__tests__/Accounts.test.jsx`

- [ ] **Step 1: Write the failing test**

`client/src/__tests__/Accounts.test.jsx`:
```jsx
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import { Accounts } from '../pages/Accounts'

vi.mock('../context/ExchangeRateContext', () => ({
  useExchangeRate: () => 5.85
}))

const mockAccounts = [
  { id: '1', name: 'Wise', bank: 'Wise', currency: 'EUR', balance: 1000, updatedAt: '2026-05-22' },
  { id: '2', name: 'Nubank', bank: 'Nubank', currency: 'BRL', balance: 5850, updatedAt: '2026-05-22' }
]

vi.mock('../api/accounts', () => ({
  getAccounts: vi.fn().mockResolvedValue(mockAccounts),
  createAccount: vi.fn().mockResolvedValue({ id: '3', name: 'Itaú', bank: 'Itaú', currency: 'BRL', balance: 2000, updatedAt: '2026-05-22' }),
  updateAccount: vi.fn().mockResolvedValue({}),
  deleteAccount: vi.fn().mockResolvedValue({})
}))

describe('Accounts page', () => {
  it('renders list of accounts', async () => {
    render(<Accounts />)
    await waitFor(() => {
      expect(screen.getByText('Wise')).toBeInTheDocument()
      expect(screen.getByText('Nubank')).toBeInTheDocument()
    })
  })

  it('shows EUR equivalent for BRL account', async () => {
    render(<Accounts />)
    // 5850 BRL / 5.85 = €1000.00
    await waitFor(() => expect(screen.getByText('≈ €1000.00')).toBeInTheDocument())
  })

  it('shows Add Account button', async () => {
    render(<Accounts />)
    expect(screen.getByText('Add Account')).toBeInTheDocument()
  })

  it('opens the account form when Add Account is clicked', async () => {
    render(<Accounts />)
    fireEvent.click(screen.getByText('Add Account'))
    expect(screen.getByPlaceholderText('Account name (e.g. Nubank Checking)')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run (from `client/`): `npx vitest run __tests__/Accounts`
Expected: FAIL — `Cannot find module '../pages/Accounts'`

- [ ] **Step 3: Implement Accounts page**

`client/src/pages/Accounts.jsx`:
```jsx
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
```

- [ ] **Step 4: Run test to verify it passes**

Run (from `client/`): `npx vitest run __tests__/Accounts`
Expected: PASS — 4 tests passing.

- [ ] **Step 5: Commit**

```bash
git add client/src/pages/Accounts.jsx client/src/__tests__/Accounts.test.jsx
git commit -m "feat: add Accounts page with add/edit/delete and EUR conversion"
```

---

## Task 15: Transactions Page (TDD)

**Files:**
- Create: `client/src/pages/Transactions.jsx`
- Create: `client/src/__tests__/Transactions.test.jsx`

- [ ] **Step 1: Write the failing test**

`client/src/__tests__/Transactions.test.jsx`:
```jsx
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import { Transactions } from '../pages/Transactions'

const mockTransactions = [
  { id: 'tx-1', date: '2026-05-01', type: 'income', amount: 5000, currency: 'BRL', category: 'Salary', description: 'Monthly salary' },
  { id: 'tx-2', date: '2026-05-15', type: 'expense', amount: 200, currency: 'BRL', category: 'Food', description: 'Groceries' },
  { id: 'tx-3', date: '2026-04-10', type: 'expense', amount: 100, currency: 'EUR', category: 'Transport', description: 'Flight' }
]

vi.mock('../api/transactions', () => ({
  getTransactions: vi.fn().mockResolvedValue(mockTransactions),
  createTransaction: vi.fn().mockResolvedValue({}),
  updateTransaction: vi.fn().mockResolvedValue({}),
  deleteTransaction: vi.fn().mockResolvedValue({})
}))

vi.mock('../api/categories', () => ({
  getCategories: vi.fn().mockResolvedValue(['Salary', 'Food', 'Transport'])
}))

describe('Transactions page', () => {
  it('renders list of transactions', async () => {
    render(<Transactions />)
    await waitFor(() => {
      expect(screen.getByText('Monthly salary')).toBeInTheDocument()
      expect(screen.getByText('Groceries')).toBeInTheDocument()
    })
  })

  it('filters by type when expense is selected', async () => {
    render(<Transactions />)
    await waitFor(() => screen.getByText('Monthly salary'))
    fireEvent.change(screen.getByLabelText('Type'), { target: { value: 'expense' } })
    await waitFor(() => {
      expect(screen.queryByText('Monthly salary')).not.toBeInTheDocument()
      expect(screen.getByText('Groceries')).toBeInTheDocument()
    })
  })

  it('shows Add Transaction button', () => {
    render(<Transactions />)
    expect(screen.getByText('Add Transaction')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run (from `client/`): `npx vitest run __tests__/Transactions`
Expected: FAIL — `Cannot find module '../pages/Transactions'`

- [ ] **Step 3: Implement Transactions page**

`client/src/pages/Transactions.jsx`:
```jsx
import { useState, useEffect, useMemo } from 'react'
import { Pencil, Trash2, Plus } from 'lucide-react'
import { getTransactions, createTransaction, updateTransaction, deleteTransaction } from '../api/transactions'
import { getCategories } from '../api/categories'
import { TransactionForm } from '../components/TransactionForm'

function currentMonthValue() {
  return new Date().toISOString().slice(0, 7)
}

export function Transactions() {
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
              <span className={`font-semibold ${tx.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {tx.type === 'income' ? '+' : '-'}{tx.currency === 'BRL' ? 'R$' : '€'}{tx.amount.toFixed(2)}
              </span>
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
```

- [ ] **Step 4: Run test to verify it passes**

Run (from `client/`): `npx vitest run __tests__/Transactions`
Expected: PASS — 3 tests passing.

- [ ] **Step 5: Commit**

```bash
git add client/src/pages/Transactions.jsx client/src/__tests__/Transactions.test.jsx
git commit -m "feat: add Transactions page with filters and add/edit/delete"
```

---

## Task 16: Analytics Page (TDD)

**Files:**
- Create: `client/src/pages/Analytics.jsx`
- Create: `client/src/__tests__/Analytics.test.jsx`

- [ ] **Step 1: Write the failing test**

`client/src/__tests__/Analytics.test.jsx`:
```jsx
import { render, screen, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import { Analytics } from '../pages/Analytics'

vi.mock('../context/ExchangeRateContext', () => ({
  useExchangeRate: () => 5.85
}))

vi.mock('../api/transactions', () => ({
  getTransactions: vi.fn().mockResolvedValue([
    { id: '1', date: '2026-05-10', type: 'expense', amount: 200, currency: 'BRL', category: 'Food', description: '' },
    { id: '2', date: '2026-05-15', type: 'expense', amount: 100, currency: 'BRL', category: 'Transport', description: '' },
    { id: '3', date: '2026-05-01', type: 'income', amount: 5000, currency: 'BRL', category: 'Salary', description: '' }
  ])
}))

vi.mock('recharts', () => ({
  PieChart: ({ children }) => <div data-testid="pie-chart">{children}</div>,
  Pie: () => null,
  Cell: () => null,
  BarChart: ({ children }) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  Legend: () => null,
  ResponsiveContainer: ({ children }) => <div>{children}</div>
}))

describe('Analytics page', () => {
  it('renders the pie chart', async () => {
    render(<Analytics />)
    await waitFor(() => expect(screen.getByTestId('pie-chart')).toBeInTheDocument())
  })

  it('renders the bar chart', async () => {
    render(<Analytics />)
    await waitFor(() => expect(screen.getByTestId('bar-chart')).toBeInTheDocument())
  })

  it('renders section headings', async () => {
    render(<Analytics />)
    await waitFor(() => {
      expect(screen.getByText('Expenses by Category')).toBeInTheDocument()
      expect(screen.getByText('Monthly Income vs Expenses')).toBeInTheDocument()
    })
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run (from `client/`): `npx vitest run __tests__/Analytics`
Expected: FAIL — `Cannot find module '../pages/Analytics'`

- [ ] **Step 3: Implement Analytics page**

`client/src/pages/Analytics.jsx`:
```jsx
import { useState, useEffect, useMemo } from 'react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { getTransactions } from '../api/transactions'
import { useExchangeRate } from '../context/ExchangeRateContext'

const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6']

function getLast6Months() {
  const months = []
  const now = new Date()
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push(d.toISOString().slice(0, 7))
  }
  return months
}

function toEUR(amount, currency, rate) {
  return currency === 'EUR' ? amount : amount / (rate || 1)
}

export function Analytics() {
  const rate = useExchangeRate()
  const [transactions, setTransactions] = useState([])
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7))

  useEffect(() => { getTransactions().then(setTransactions) }, [])

  const pieData = useMemo(() => {
    const expenses = transactions.filter(t => t.type === 'expense' && t.date.startsWith(selectedMonth))
    const byCategory = expenses.reduce((acc, t) => {
      const eur = toEUR(t.amount, t.currency, rate)
      acc[t.category] = (acc[t.category] || 0) + eur
      return acc
    }, {})
    return Object.entries(byCategory).map(([name, value]) => ({ name, value: parseFloat(value.toFixed(2)) }))
  }, [transactions, selectedMonth, rate])

  const barData = useMemo(() => {
    return getLast6Months().map(month => {
      const monthTx = transactions.filter(t => t.date.startsWith(month))
      const income = monthTx.filter(t => t.type === 'income').reduce((s, t) => s + toEUR(t.amount, t.currency, rate), 0)
      const expenses = monthTx.filter(t => t.type === 'expense').reduce((s, t) => s + toEUR(t.amount, t.currency, rate), 0)
      return { month: month.slice(5), income: parseFloat(income.toFixed(2)), expenses: parseFloat(expenses.toFixed(2)) }
    })
  }, [transactions, rate])

  return (
    <div className="space-y-10">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Expenses by Category</h2>
          <input
            type="month"
            className="border rounded px-3 py-1.5 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            value={selectedMonth}
            onChange={e => setSelectedMonth(e.target.value)}
          />
        </div>
        {pieData.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-10">No expense data for this month.</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, value }) => `${name}: €${value}`}>
                {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v) => `€${v}`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold mb-4">Monthly Income vs Expenses</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={barData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis tickFormatter={v => `€${v}`} />
            <Tooltip formatter={(v) => `€${v}`} />
            <Legend />
            <Bar dataKey="income" fill="#10b981" name="Income" />
            <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run (from `client/`): `npx vitest run __tests__/Analytics`
Expected: PASS — 3 tests passing.

- [ ] **Step 5: Run all client tests**

Run (from `client/`): `npx vitest run`
Expected: PASS — all tests across all client test files passing.

- [ ] **Step 6: Commit**

```bash
git add client/src/pages/Analytics.jsx client/src/__tests__/Analytics.test.jsx
git commit -m "feat: add Analytics page with pie chart (by category) and bar chart (monthly)"
```

---

## Task 17: Full Integration Smoke Test

**Files:** No new files.

- [ ] **Step 1: Start both services**

Run (from project root): `npm run dev`
Expected: Both services start. Terminal shows:
- `[0] Server running on http://localhost:3001`
- `[1] VITE ready in ... ms at http://localhost:5173`

- [ ] **Step 2: Verify exchange rate loads**

Open `http://localhost:5173` in browser.
Expected: Dashboard shows "1 EUR = X.XX BRL" with today's rate. Check `server/data/exchange-rate-cache.json` — it should have today's date and rate.

- [ ] **Step 3: Add an account**

Navigate to Accounts page → click "Add Account" → fill in Name: "Wise", Bank: "Wise", Currency: EUR, Balance: 1000 → Save.
Expected: Account appears in the list. Check `server/data/accounts.json` — entry should be persisted.

- [ ] **Step 4: Verify goal progress updates**

Navigate to Dashboard.
Expected: Progress bar shows savings > €0.

- [ ] **Step 5: Add a transaction**

Navigate to Transactions → click "Add Transaction" → fill in a May 2026 expense → Save.
Expected: Transaction appears in list. Dashboard summary cards update.

- [ ] **Step 6: Verify dark mode toggle**

Click the moon icon in the NavBar.
Expected: Page switches to dark background. Reload the page — dark mode persists.

- [ ] **Step 7: Check Analytics**

Navigate to Analytics. Add a few more transactions across categories if needed.
Expected: Pie chart shows expense breakdown. Bar chart shows monthly data.

- [ ] **Step 8: Final commit**

```bash
git add -A
git commit -m "feat: complete Finance Dashboard — all pages, tests passing, smoke-tested"
```
