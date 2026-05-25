# Design: Original Currency Display

**Date:** 2026-05-25  
**Branch:** `feat/original-currency-display`  
**Status:** Approved

## Overview

Currently the app converts all amounts to EUR before displaying them on the Dashboard and Analytics pages. This change makes every view show amounts in the currency they were entered, with EUR equivalents as secondary info for non-EUR values.

---

## Scope of Changes

### 1. Transactions Page (`client/src/pages/Transactions.jsx`)

**Current:** Each row shows `R$500.00` or `€90.00` (original currency symbol already correct).  
**Change:** Add a small EUR equivalent for non-EUR transactions.

**Row display after:**
- EUR transaction: `€90.00` (unchanged)
- BRL transaction: `R$500.00` with a secondary line `≈ €X.XX`

The `≈ €X.XX` note uses the live exchange rate from `ExchangeRateContext`. If the rate hasn't loaded yet, the note is omitted (not shown as €0.00).

This mirrors the pattern already used on the Accounts page (`Accounts.jsx` line 81–83).

---

### 2. Dashboard Page (`client/src/pages/Dashboard.jsx`)

**Current:** Three fixed cards — Income This Month (EUR), Expenses This Month (EUR), Net This Month (EUR).  
**Change:** Income and Expenses become dynamic per-currency cards; Net stays in EUR.

**Logic:**
- Group current month's income transactions by `currency`, sum amounts per group.
- Group current month's expense transactions by `currency`, sum amounts per group.
- Render one `SummaryCard` per currency group for income and one per currency group for expenses.
- Net card remains a single EUR total (all income minus all expenses, both converted to EUR via exchange rate).

**Example layout (BRL + EUR data):**

| Income (BRL) | Income (EUR) | Expenses (BRL) | Expenses (EUR) | Net (EUR) |
|---|---|---|---|---|
| R$X.XX | €X.XX | R$X.XX | €X.XX | €X.XX |

**Example layout (BRL only):**

| Income (BRL) | Expenses (BRL) | Net (EUR) |
|---|---|---|
| R$X.XX | R$X.XX | €X.XX |

Cards are shown in a responsive grid. Order: all income cards first (BRL before EUR), then all expense cards (BRL before EUR), then Net.

Currency symbols: BRL → `R$`, EUR → `€`.

---

### 3. Analytics Page (`client/src/pages/Analytics.jsx`)

**Current:** Both charts convert all transactions to EUR.  
**Change:** Add a **BRL / EUR / All** toggle at the top of the page (single selector, applies to both charts).

**Behavior:**
- **BRL**: filter to only BRL transactions; display values with `R$` symbol.
- **EUR**: filter to only EUR transactions; display values with `€` symbol.
- **All**: current behavior — all transactions converted to EUR; display with `€` symbol and label updated to make "in EUR" explicit.

The toggle is a small segmented control (3 buttons) placed at the top-right of the page, above both charts.

Both charts — pie (expenses by category) and bar (monthly income vs expenses) — react to the same selector.

---

## Data Flow

No backend changes required. All filtering and grouping happens in the frontend using existing transaction data (`currency` field already stored on each transaction).

Exchange rate is already available app-wide via `ExchangeRateContext`.

---

## What Is NOT Changing

- Accounts page: already correct (original currency + EUR note).
- Backend API: no changes.
- Data model: no changes.
- Savings goal progress bar: stays in EUR (it tracks total account balances, not transactions).
- Exchange rate card on Dashboard: unchanged.

---

## Testing Considerations

- Transactions with no EUR equivalent note (rate not loaded): note should be absent, not `≈ €0.00`.
- Dashboard with only one currency: only that currency's cards appear; Net still renders.
- Dashboard with no transactions this month: no income/expense cards shown; Net shows €0.00.
- Analytics "All" mode: EUR label is explicit.
- Analytics BRL/EUR mode with no data for that currency: charts show empty state.
