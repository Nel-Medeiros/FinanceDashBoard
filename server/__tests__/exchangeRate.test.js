const request = require('supertest')
const app = require('../app')

jest.mock('../utils/fileStorage')
jest.mock('axios')

const { readJSON, writeJSON } = require('../utils/fileStorage')
const axios = require('axios')

describe('GET /api/exchange-rate', () => {
  const today = new Date().toISOString().split('T')[0]

  beforeEach(() => {
    jest.clearAllMocks()
    writeJSON.mockResolvedValue()
  })

  it('returns cached rate when cache date matches today', async () => {
    readJSON.mockResolvedValue({ date: today, rate: 5.85 })

    const res = await request(app).get('/api/exchange-rate')

    expect(res.status).toBe(200)
    expect(res.body).toEqual({ date: today, rate: 5.85 })
    expect(axios.get).not.toHaveBeenCalled()
  })

  it('fetches new rate and caches it when cache is stale', async () => {
    readJSON.mockResolvedValue({ date: '2020-01-01', rate: 5.0 })
    axios.get.mockResolvedValue({ data: { rates: { BRL: 5.85 } } })

    const res = await request(app).get('/api/exchange-rate')

    expect(res.status).toBe(200)
    expect(res.body.rate).toBe(5.85)
    expect(res.body.date).toBe(today)
    expect(writeJSON).toHaveBeenCalledWith(
      expect.stringContaining('exchange-rate-cache.json'),
      { date: today, rate: 5.85 }
    )
  })

  it('fetches new rate when cache is empty', async () => {
    readJSON.mockResolvedValue(null)
    axios.get.mockResolvedValue({ data: { rates: { BRL: 5.90 } } })

    const res = await request(app).get('/api/exchange-rate')

    expect(res.status).toBe(200)
    expect(res.body.rate).toBe(5.90)
  })

  it('returns 500 when external API fails', async () => {
    readJSON.mockResolvedValue(null)
    axios.get.mockRejectedValue(new Error('Network error'))

    const res = await request(app).get('/api/exchange-rate')

    expect(res.status).toBe(500)
    expect(res.body).toHaveProperty('error')
  })
})
