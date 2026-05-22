const express = require('express')
const path = require('path')
const { readJSON, writeJSON } = require('../utils/fileStorage')

const router = express.Router()
const DATA_PATH = path.join(__dirname, '../data/accounts.json')

router.get('/', async (req, res) => {
  const accounts = await readJSON(DATA_PATH) || []
  res.json(accounts)
})

router.post('/', async (req, res) => {
  const accounts = await readJSON(DATA_PATH) || []
  const account = {
    id: crypto.randomUUID(),
    ...req.body,
    updatedAt: new Date().toISOString().split('T')[0]
  }
  accounts.push(account)
  await writeJSON(DATA_PATH, accounts)
  res.status(201).json(account)
})

router.put('/:id', async (req, res) => {
  const accounts = await readJSON(DATA_PATH) || []
  const index = accounts.findIndex(a => a.id === req.params.id)
  if (index === -1) return res.status(404).json({ error: 'Account not found' })
  accounts[index] = {
    ...accounts[index],
    ...req.body,
    updatedAt: new Date().toISOString().split('T')[0]
  }
  await writeJSON(DATA_PATH, accounts)
  res.json(accounts[index])
})

router.delete('/:id', async (req, res) => {
  const accounts = await readJSON(DATA_PATH) || []
  const filtered = accounts.filter(a => a.id !== req.params.id)
  if (filtered.length === accounts.length) return res.status(404).json({ error: 'Account not found' })
  await writeJSON(DATA_PATH, filtered)
  res.json({ success: true })
})

module.exports = router
