const express = require('express')
const path = require('path')
const { readJSON, writeJSON } = require('../utils/fileStorage')

const router = express.Router()
const DATA_PATH = path.join(__dirname, '../data/categories.json')

router.get('/', async (req, res) => {
  const categories = await readJSON(DATA_PATH) || []
  res.json(categories)
})

router.post('/', async (req, res) => {
  const categories = await readJSON(DATA_PATH) || []
  const { name } = req.body
  if (categories.includes(name)) return res.status(200).json(categories)
  categories.push(name)
  await writeJSON(DATA_PATH, categories)
  res.status(201).json(categories)
})

module.exports = router
