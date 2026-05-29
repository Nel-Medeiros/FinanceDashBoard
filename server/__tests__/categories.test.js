const request = require('supertest')
const app = require('../app')

jest.mock('../utils/fileStorage')
const { readJSON, writeJSON } = require('../utils/fileStorage')

const mockCategories = ['Food', 'Rent', 'Salary']

beforeEach(() => {
  jest.clearAllMocks()
  writeJSON.mockResolvedValue()
})

describe('GET /api/categories', () => {
  it('returns all categories', async () => {
    readJSON.mockResolvedValue(mockCategories)
    const res = await request(app).get('/api/categories')
    expect(res.status).toBe(200)
    expect(res.body).toEqual(mockCategories)
  })

  it('returns empty array when no categories exist', async () => {
    readJSON.mockResolvedValue(null)
    const res = await request(app).get('/api/categories')
    expect(res.status).toBe(200)
    expect(res.body).toEqual([])
  })
})

describe('POST /api/categories', () => {
  it('adds a new category', async () => {
    readJSON.mockResolvedValue([...mockCategories])
    const res = await request(app).post('/api/categories').send({ name: 'Travel' })
    expect(res.status).toBe(201)
    expect(res.body).toContain('Travel')
    expect(writeJSON).toHaveBeenCalledWith(
      expect.stringContaining('categories.json'),
      expect.arrayContaining(['Travel'])
    )
  })

  it('does not add duplicate categories', async () => {
    readJSON.mockResolvedValue([...mockCategories])
    const res = await request(app).post('/api/categories').send({ name: 'Food' })
    expect(res.status).toBe(200)
    const saved = writeJSON.mock.calls
    expect(saved).toHaveLength(0)
  })
})

describe('DELETE /api/categories/:name', () => {
  it('removes an existing category and returns the updated list', async () => {
    readJSON.mockResolvedValue([...mockCategories])
    const res = await request(app).delete('/api/categories/Food')
    expect(res.status).toBe(200)
    expect(res.body).not.toContain('Food')
    expect(res.body).toContain('Rent')
    expect(writeJSON).toHaveBeenCalledWith(
      expect.stringContaining('categories.json'),
      expect.not.arrayContaining(['Food'])
    )
  })

  it('returns 404 when category does not exist', async () => {
    readJSON.mockResolvedValue([...mockCategories])
    const res = await request(app).delete('/api/categories/Unknown')
    expect(res.status).toBe(404)
    expect(writeJSON).not.toHaveBeenCalled()
  })
})
