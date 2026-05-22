const express = require('express')
const axios = require('axios')
const path = require('path')
const { readJSON, writeJSON } = require('../utils/fileStorage')

const router = express.Router()
const CACHE_PATH = path.join(__dirname, '../data/exchange-rate-cache.json')

router.get('/', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0]
    const cache = await readJSON(CACHE_PATH)

    if (cache && cache.date === today) {
      return res.json({ date: cache.date, rate: cache.rate })
    }

    const response = await axios.get('https://api.frankfurter.app/latest?from=EUR&to=BRL')
    const rate = response.data.rates.BRL
    const newCache = { date: today, rate }

    await writeJSON(CACHE_PATH, newCache)
    res.json(newCache)
  } catch {
    res.status(500).json({ error: 'Failed to fetch exchange rate' })
  }
})

module.exports = router
