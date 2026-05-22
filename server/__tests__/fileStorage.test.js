const os = require('os')
const path = require('path')
const fs = require('fs').promises
const { readJSON, writeJSON } = require('../utils/fileStorage')

describe('fileStorage', () => {
  let tmpFile

  beforeEach(() => {
    tmpFile = path.join(os.tmpdir(), `test-${Date.now()}.json`)
  })

  afterEach(async () => {
    try { await fs.unlink(tmpFile) } catch {}
  })

  it('writes and reads JSON data', async () => {
    const data = [{ id: '1', name: 'Test' }]
    await writeJSON(tmpFile, data)
    const result = await readJSON(tmpFile)
    expect(result).toEqual(data)
  })

  it('returns null when file does not exist', async () => {
    const result = await readJSON('/nonexistent/path/file.json')
    expect(result).toBeNull()
  })

  it('overwrites existing file content', async () => {
    await writeJSON(tmpFile, { old: true })
    await writeJSON(tmpFile, { new: true })
    const result = await readJSON(tmpFile)
    expect(result).toEqual({ new: true })
  })
})
