const express = require('express')
const path = require('path')
const { randomUUID } = require('crypto')
const { readJSON, writeJSON } = require('../utils/fileStorage')

const router = express.Router()
const DATA_PATH = path.join(__dirname, '../data/transactions.json')

router.get('/', async (req, res) => {
  const transactions = await readJSON(DATA_PATH) || []
  res.json(transactions)
})

router.post('/', async (req, res) => {
  const transactions = await readJSON(DATA_PATH) || []
  const transaction = { id: randomUUID(), ...req.body }
  transactions.push(transaction)
  await writeJSON(DATA_PATH, transactions)
  res.status(201).json(transaction)
})

router.put('/:id', async (req, res) => {
  const transactions = await readJSON(DATA_PATH) || []
  const index = transactions.findIndex(t => t.id === req.params.id)
  if (index === -1) return res.status(404).json({ error: 'Transaction not found' })
  transactions[index] = { ...transactions[index], ...req.body }
  await writeJSON(DATA_PATH, transactions)
  res.json(transactions[index])
})

router.delete('/:id', async (req, res) => {
  const transactions = await readJSON(DATA_PATH) || []
  const filtered = transactions.filter(t => t.id !== req.params.id)
  if (filtered.length === transactions.length) return res.status(404).json({ error: 'Transaction not found' })
  await writeJSON(DATA_PATH, filtered)
  res.json({ success: true })
})

module.exports = router
