import axios from 'axios'
export const getTransactions = () => axios.get('/api/transactions').then(r => r.data)
export const createTransaction = (data) => axios.post('/api/transactions', data).then(r => r.data)
export const updateTransaction = (id, data) => axios.put(`/api/transactions/${id}`, data).then(r => r.data)
export const deleteTransaction = (id) => axios.delete(`/api/transactions/${id}`).then(r => r.data)
