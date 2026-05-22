import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import { Accounts } from '../pages/Accounts'

vi.mock('../context/ExchangeRateContext', () => ({
  useExchangeRate: () => 5.85
}))

const mockAccounts = vi.hoisted(() => [
  { id: '1', name: 'Wise', bank: 'Wise', currency: 'EUR', balance: 1000, updatedAt: '2026-05-22' },
  { id: '2', name: 'Nubank', bank: 'Nubank', currency: 'BRL', balance: 5850, updatedAt: '2026-05-22' }
])

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
