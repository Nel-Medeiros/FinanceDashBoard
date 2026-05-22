const request = require('supertest')
const app = require('../app')

jest.mock('../utils/fileStorage')
const { readJSON, writeJSON } = require('../utils/fileStorage')

const mockAccounts = [
  { id: 'abc-1', name: 'Nubank', bank: 'Nubank', currency: 'BRL', balance: 10000, updatedAt: '2026-01-01' },
  { id: 'abc-2', name: 'Wise', bank: 'Wise', currency: 'EUR', balance: 500, updatedAt: '2026-01-01' }
]

beforeEach(() => {
  jest.clearAllMocks()
  writeJSON.mockResolvedValue()
})

describe('GET /api/accounts', () => {
  it('returns all accounts', async () => {
    readJSON.mockResolvedValue(mockAccounts)
    const res = await request(app).get('/api/accounts')
    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(2)
    expect(res.body[0].name).toBe('Nubank')
  })

  it('returns empty array when no accounts exist', async () => {
    readJSON.mockResolvedValue(null)
    const res = await request(app).get('/api/accounts')
    expect(res.status).toBe(200)
    expect(res.body).toEqual([])
  })
})

describe('POST /api/accounts', () => {
  it('creates a new account with id and updatedAt', async () => {
    readJSON.mockResolvedValue([])
    const payload = { name: 'Itaú', bank: 'Itaú', currency: 'BRL', balance: 5000 }
    const res = await request(app).post('/api/accounts').send(payload)
    expect(res.status).toBe(201)
    expect(res.body.id).toBeDefined()
    expect(res.body.name).toBe('Itaú')
    expect(res.body.updatedAt).toBeDefined()
    expect(writeJSON).toHaveBeenCalledWith(
      expect.stringContaining('accounts.json'),
      expect.arrayContaining([expect.objectContaining({ name: 'Itaú' })])
    )
  })
})

describe('PUT /api/accounts/:id', () => {
  it('updates an existing account', async () => {
    readJSON.mockResolvedValue([...mockAccounts])
    const res = await request(app).put('/api/accounts/abc-1').send({ balance: 15000 })
    expect(res.status).toBe(200)
    expect(res.body.balance).toBe(15000)
    expect(res.body.id).toBe('abc-1')
  })

  it('returns 404 for unknown id', async () => {
    readJSON.mockResolvedValue(mockAccounts)
    const res = await request(app).put('/api/accounts/unknown').send({ balance: 100 })
    expect(res.status).toBe(404)
  })
})

describe('DELETE /api/accounts/:id', () => {
  it('removes an account', async () => {
    readJSON.mockResolvedValue([...mockAccounts])
    const res = await request(app).delete('/api/accounts/abc-1')
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ success: true })
    const saved = writeJSON.mock.calls[0][1]
    expect(saved).toHaveLength(1)
    expect(saved[0].id).toBe('abc-2')
  })

  it('returns 404 for unknown id', async () => {
    readJSON.mockResolvedValue(mockAccounts)
    const res = await request(app).delete('/api/accounts/unknown')
    expect(res.status).toBe(404)
  })
})
