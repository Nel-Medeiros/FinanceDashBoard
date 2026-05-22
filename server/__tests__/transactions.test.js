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
