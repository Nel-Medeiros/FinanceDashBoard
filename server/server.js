const initData = require('./init-data')
const app = require('./app')

initData()

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`))
