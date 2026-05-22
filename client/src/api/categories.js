import axios from 'axios'
export const getCategories = () => axios.get('/api/categories').then(r => r.data)
export const addCategory = (name) => axios.post('/api/categories', { name }).then(r => r.data)
