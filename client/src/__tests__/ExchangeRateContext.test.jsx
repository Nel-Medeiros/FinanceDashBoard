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
