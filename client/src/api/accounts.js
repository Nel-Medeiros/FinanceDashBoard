import axios from 'axios'
export const getAccounts = () => axios.get('/api/accounts').then(r => r.data)
export const createAccount = (data) => axios.post('/api/accounts', data).then(r => r.data)
export const updateAccount = (id, data) => axios.put(`/api/accounts/${id}`, data).then(r => r.data)
export const deleteAccount = (id) => axios.delete(`/api/accounts/${id}`).then(r => r.data)
