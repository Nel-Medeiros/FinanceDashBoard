const fs = require('fs')
const path = require('path')

const DATA_DIR = path.join(__dirname, 'data')
const defaults = ['accounts', 'transactions', 'categories', 'exchange-rate-cache']

function initData() {
  defaults.forEach(name => {
    const target = path.join(DATA_DIR, `${name}.json`)
    const source = path.join(DATA_DIR, `${name}.default.json`)
    if (!fs.existsSync(target)) {
      fs.copyFileSync(source, target)
    }
  })
}

module.exports = initData
