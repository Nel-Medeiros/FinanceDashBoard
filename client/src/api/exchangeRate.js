import axios from 'axios'
export const getExchangeRate = () => axios.get('/api/exchange-rate').then(r => r.data.rate)
