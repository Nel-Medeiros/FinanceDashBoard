const express = require('express')
const cors = require('cors')

const accountsRouter = require('./routes/accounts')
const transactionsRouter = require('./routes/transactions')
const categoriesRouter = require('./routes/categories')
const exchangeRateRouter = require('./routes/exchangeRate')

const app = express()
app.use(cors())
app.use(express.json())

app.use('/api/accounts', accountsRouter)
app.use('/api/transactions', transactionsRouter)
app.use('/api/categories', categoriesRouter)
app.use('/api/exchange-rate', exchangeRateRouter)

module.exports = app
