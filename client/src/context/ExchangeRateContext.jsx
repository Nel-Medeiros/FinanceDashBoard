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
