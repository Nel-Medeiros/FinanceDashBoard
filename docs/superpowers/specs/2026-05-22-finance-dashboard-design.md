# Finance Dashboard — Design Spec
**Date:** 2026-05-22  
**Status:** Approved

## Overview

A local-first personal finance dashboard for a couple living in Brazil planning to relocate to Europe. Tracks income, expenses, and savings across multiple bank accounts in both BRL and EUR, with a daily exchange rate feed and a visual progress tracker toward a €10,000 savings goal.

---

## Goals

- Centralize financial data in one place
- Track savings progress toward €10,000 EUR goal
- Show daily BRL/EUR exchange rate
- Log income and expense entries with categories
- Visualize spending patterns over time

---

## Architecture

**Monorepo** — single project folder, one `npm run dev` starts both services via `concurrently`.

```
FinanceDashBoard/
├── client/                   # React + Vite frontend (port 5173)
│   └── src/
│       ├── pages/            # Dashboard, Transactions, Accounts, Analytics
│       ├── components/       # Reusable UI components
│       ├── context/          # React Context (exchange rate, dark mode)
│       └── api/              # Axios wrappers for backend calls
├── server/                   # Express backend (port 3001)
│   ├── routes/               # accounts, transactions, categories, exchange-rate
│   └── data/                 # JSON file storage
│       ├── accounts.json
│       ├── transactions.json
│       ├── categories.json
│       └── exchange-rate-cache.json
├── package.json              # Root — concurrently script
```

**Tech stack:**
- Frontend: React + Vite, Tailwind CSS, Recharts, Axios
- Backend: Node.js + Express
- Storage: Local JSON files
- Exchange rate: frankfurter.app (free, no signup)

---

## Data Models

### Account
```json
{
  "id": "uuid",
  "name": "Nubank",
  "bank": "Nubank",
  "currency": "BRL",
  "balance": 15000.00,
  "updatedAt": "2026-05-22"
}
```

### Transaction
```json
{
  "id": "uuid",
  "date": "2026-05-22",
  "type": "expense",
  "amount": 250.00,
  "currency": "BRL",
  "category": "Food",
  "description": "Grocery shopping"
}
```

### Exchange Rate Cache
```json
{
  "date": "2026-05-22",
  "rate": 5.85
}
```
> `rate` represents how many BRL = 1 EUR (i.e., BRL/EUR rate).

### Categories
```json
["Food", "Rent", "Transport", "Health", "Salary", "Travel", "Other"]
```

---

## Backend API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/accounts` | List all accounts |
| POST | `/api/accounts` | Create account |
| PUT | `/api/accounts/:id` | Update account (balance, etc.) |
| DELETE | `/api/accounts/:id` | Delete account |
| GET | `/api/transactions` | List all transactions |
| POST | `/api/transactions` | Create transaction |
| PUT | `/api/transactions/:id` | Update transaction |
| DELETE | `/api/transactions/:id` | Delete transaction |
| GET | `/api/categories` | List categories |
| POST | `/api/categories` | Add category |
| GET | `/api/exchange-rate` | Get today's BRL/EUR rate (cached) |

### Exchange Rate Logic
1. `GET /api/exchange-rate` reads `exchange-rate-cache.json`
2. If `cache.date === today` → return cached rate (no external call)
3. If stale or missing → fetch `https://api.frankfurter.app/latest?from=EUR&to=BRL`, save to cache, return rate
4. Maximum one external API call per day

---

## Pages

### 1. Dashboard
- Today's BRL/EUR exchange rate (prominent display)
- Savings goal progress bar: total savings in EUR vs €10,000 target
  - EUR accounts: counted directly
  - BRL accounts: balance ÷ today's rate = EUR equivalent
  - Total = sum of all EUR equivalents
- Summary cards: total income this month, total expenses this month, net balance this month

### 2. Accounts
- List of all bank accounts with: name, bank, currency, current balance, EUR equivalent
- Add / edit / delete accounts
- Manual balance update (edit the balance field directly)
- Shows last updated date per account

### 3. Transactions
- Paginated list of all income/expense entries, sorted by date descending
- Filters: month picker, category selector, type (income/expense/all)
- Add / edit / delete transactions
- Fields per transaction: date, type, amount, currency, category, description

### 4. Analytics
- **Pie chart**: expenses by category for selected month
- **Bar chart**: monthly income vs expenses over the last 6 months
- Built with Recharts

---

## UI & Styling

- **Tailwind CSS** for all styling
- **Dark mode toggle** in the top navigation bar (sun/moon icon)
  - Preference persisted in `localStorage`
  - Implemented via Tailwind's `dark:` class strategy (class-based, toggled on `<html>`)
- Top navigation bar with links to all four pages
- Responsive layout (desktop-first, usable on tablet)

---

## State Management

- **React Context** — two contexts:
  1. `ExchangeRateContext`: fetched on app load, available app-wide
  2. `ThemeContext`: dark/light mode preference from localStorage
- Per-page data fetched locally via Axios on mount — no global transaction/account state
- No Redux needed for a personal tool at this scale

---

## Out of Scope (for now)

- Automatic bank balance sync (planned future enhancement)
- Multi-user / authentication
- Mobile app
- Export to CSV/PDF
- Budget limits or alerts
