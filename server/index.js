const express = require('express')
const cors = require('cors')
const jwt = require('jsonwebtoken')
const { ulid } = require('ulid')
const multer = require('multer')
const axios = require('axios')
const fs = require('fs')
const path = require('path')
const dayjs = require('dayjs')

const app = express()
const PORT = process.env.PORT || 3001
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret'
const DATA_DIR = path.join(__dirname, 'data')
const UPLOAD_DIR = path.join(__dirname, 'uploads')

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true })

app.use(cors())
app.use(express.json())
app.use('/static', express.static(UPLOAD_DIR))

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOAD_DIR)
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname)
    cb(null, `${ulid()}${ext}`)
  }
})
const upload = multer({ storage })

function readJson(name) {
  const file = path.join(DATA_DIR, `${name}.json`)
  if (!fs.existsSync(file)) return []
  try {
    const txt = fs.readFileSync(file, 'utf-8')
    return JSON.parse(txt)
  } catch {
    return []
  }
}

function writeJson(name, data) {
  const file = path.join(DATA_DIR, `${name}.json`)
  fs.writeFileSync(file, JSON.stringify(data, null, 2))
}

function ok(data) {
  return { code: 0, message: 'ok', data }
}

function err(code, message, details) {
  return { code, message, details }
}

function paginate(list, page = 1, pageSize = 20) {
  const total = list.length
  const start = (page - 1) * pageSize
  const end = start + pageSize
  return { list: list.slice(start, end), page, pageSize, total }
}

function authMiddleware(req, res, next) {
  if (req.path.startsWith('/auth/')) return next()
  const h = req.headers.authorization || ''
  const token = h.startsWith('Bearer ') ? h.slice(7) : null
  if (!token) return res.status(401).json(err(401, 'unauthorized'))
  try {
    const payload = jwt.verify(token, JWT_SECRET)
    req.user = payload
    next()
  } catch (e) {
    return res.status(401).json(err(401, 'unauthorized'))
  }
}

app.post('/auth/login', (req, res) => {
  const { username } = req.body || {}
  const token = jwt.sign({ uid: 'u_01', username: username || 'user' }, JWT_SECRET, { expiresIn: '7d' })
  res.json(ok({ token, user: { id: 'u_01', name: username || '用户' } }))
})

app.post('/auth/refresh', (req, res) => {
  const token = jwt.sign({ uid: 'u_01' }, JWT_SECRET, { expiresIn: '7d' })
  res.json(ok({ token }))
})

app.use(authMiddleware)

app.get('/members', (req, res) => {
  const { relation, keyword, page = 1, pageSize = 20 } = req.query
  let members = readJson('members')
  if (relation) members = members.filter(m => m.relation === relation)
  if (keyword) members = members.filter(m => (m.name || '').includes(keyword))
  res.json(ok(paginate(members, Number(page), Number(pageSize))))
})

app.post('/members', (req, res) => {
  const members = readJson('members')
  const m = { ...req.body, id: ulid() }
  members.push(m)
  writeJson('members', members)
  res.json(ok(m))
})

app.get('/members/:id', (req, res) => {
  const members = readJson('members')
  const m = members.find(x => x.id === req.params.id)
  if (!m) return res.status(404).json(err(404, 'not_found'))
  res.json(ok(m))
})

app.put('/members/:id', (req, res) => {
  const members = readJson('members')
  const idx = members.findIndex(x => x.id === req.params.id)
  if (idx < 0) return res.status(404).json(err(404, 'not_found'))
  members[idx] = { ...members[idx], ...req.body }
  writeJson('members', members)
  res.json(ok(members[idx]))
})

app.delete('/members/:id', (req, res) => {
  let members = readJson('members')
  const before = members.length
  members = members.filter(x => x.id !== req.params.id)
  if (before === members.length) return res.status(404).json(err(404, 'not_found'))
  writeJson('members', members)
  res.json(ok({ id: req.params.id }))
})

app.get('/members/active', (req, res) => {
  const active = readJson('active_member')
  const members = readJson('members')
  const id = active[0]?.id || members[0]?.id || null
  const member = id ? members.find(m => m.id === id) : null
  res.json(ok({ id, member }))
})

app.patch('/members/:id/active', (req, res) => {
  writeJson('active_member', [{ id: req.params.id }])
  res.json(ok({ id: req.params.id }))
})

app.get('/records', (req, res) => {
  const { memberId, dateFrom, dateTo, type, keyword, page = 1, pageSize = 20 } = req.query
  let list = readJson('records')
  if (memberId) list = list.filter(r => r.memberId === memberId)
  if (type) list = list.filter(r => r.type === type || r.typeClass === type)
  if (keyword) list = list.filter(r => (r.diagnosis || '').includes(keyword) || (r.hospital || '').includes(keyword))
  if (dateFrom) list = list.filter(r => r.date >= dateFrom)
  if (dateTo) list = list.filter(r => r.date <= dateTo)
  res.json(ok(paginate(list, Number(page), Number(pageSize))))
})

app.post('/records', (req, res) => {
  const list = readJson('records')
  const id = ulid()
  const meta = { id, images: [], hasAI: false, ...req.body }
  list.push(meta)
  writeJson('records', list)
  const details = readJson('record_details')
  details.push({ id, detail: req.body.detail || {} })
  writeJson('record_details', details)
  res.json(ok(meta))
})

app.get('/records/:id', (req, res) => {
  const list = readJson('records')
  const meta = list.find(r => r.id === req.params.id)
  if (!meta) return res.status(404).json(err(404, 'not_found'))
  const details = readJson('record_details')
  const det = details.find(d => d.id === req.params.id) || { detail: {} }
  res.json(ok({ ...meta, ...det }))
})

app.put('/records/:id', (req, res) => {
  const list = readJson('records')
  const idx = list.findIndex(r => r.id === req.params.id)
  if (idx < 0) return res.status(404).json(err(404, 'not_found'))
  list[idx] = { ...list[idx], ...req.body }
  writeJson('records', list)
  const details = readJson('record_details')
  const dIdx = details.findIndex(d => d.id === req.params.id)
  if (dIdx >= 0) details[dIdx] = { id: req.params.id, detail: req.body.detail || details[dIdx].detail }
  else details.push({ id: req.params.id, detail: req.body.detail || {} })
  writeJson('record_details', details)
  res.json(ok(list[idx]))
})

app.delete('/records/:id', (req, res) => {
  let list = readJson('records')
  const before = list.length
  list = list.filter(r => r.id !== req.params.id)
  if (before === list.length) return res.status(404).json(err(404, 'not_found'))
  writeJson('records', list)
  let details = readJson('record_details')
  details = details.filter(d => d.id !== req.params.id)
  writeJson('record_details', details)
  res.json(ok({ id: req.params.id }))
})

app.post('/records/:id/images', upload.array('file', 6), (req, res) => {
  const files = req.files || []
  const urls = files.map(f => `/static/${f.filename}`)
  const list = readJson('records')
  const idx = list.findIndex(r => r.id === req.params.id)
  if (idx < 0) return res.status(404).json(err(404, 'not_found'))
  list[idx].images = [...(list[idx].images || []), ...urls]
  writeJson('records', list)
  res.json(ok({ urls }))
})

app.get('/records/:id/images', (req, res) => {
  const list = readJson('records')
  const meta = list.find(r => r.id === req.params.id)
  if (!meta) return res.status(404).json(err(404, 'not_found'))
  res.json(ok({ urls: meta.images || [] }))
})

app.post('/records/:id/ai/interpret', (req, res) => {
  const prompt = req.body?.prompt || ''
  const text = `AI解读占位：根据提示 ${prompt} 生成摘要。`
  const list = readJson('records')
  const idx = list.findIndex(r => r.id === req.params.id)
  if (idx >= 0) list[idx].hasAI = true
  writeJson('records', list)
  res.json(ok({ aiSummary: text }))
})

app.get('/meds/plans', (req, res) => {
  const { memberId, page = 1, pageSize = 50 } = req.query
  let plans = readJson('med_plans')
  if (memberId) plans = plans.filter(p => p.memberId === memberId)
  res.json(ok(paginate(plans, Number(page), Number(pageSize))))
})

app.post('/meds/plans', (req, res) => {
  const plans = readJson('med_plans')
  const p = { id: ulid(), notify: true, ...req.body }
  plans.push(p)
  writeJson('med_plans', plans)
  res.json(ok(p))
})

app.get('/meds/plans/:id', (req, res) => {
  const plans = readJson('med_plans')
  const p = plans.find(x => x.id === req.params.id)
  if (!p) return res.status(404).json(err(404, 'not_found'))
  res.json(ok(p))
})

app.put('/meds/plans/:id', (req, res) => {
  const plans = readJson('med_plans')
  const idx = plans.findIndex(x => x.id === req.params.id)
  if (idx < 0) return res.status(404).json(err(404, 'not_found'))
  plans[idx] = { ...plans[idx], ...req.body }
  writeJson('med_plans', plans)
  res.json(ok(plans[idx]))
})

app.delete('/meds/plans/:id', (req, res) => {
  let plans = readJson('med_plans')
  const before = plans.length
  plans = plans.filter(x => x.id !== req.params.id)
  if (before === plans.length) return res.status(404).json(err(404, 'not_found'))
  writeJson('med_plans', plans)
  res.json(ok({ id: req.params.id }))
})

app.get('/meds/tasks', (req, res) => {
  const { date, memberId } = req.query
  const plans = readJson('med_plans')
  const d = date || dayjs().format('YYYY-MM-DD')
  const tasks = []
  for (const p of plans) {
    if (memberId && p.memberId !== memberId) continue
    for (const t of p.times || []) {
      tasks.push({ taskId: `${p.id}_${d}_${t}`, planId: p.id, memberId: p.memberId, name: p.name, time: t, date: d, done: false })
    }
  }
  const checks = readJson('med_task_checks')
  for (const task of tasks) {
    const c = checks.find(x => x.taskId === task.taskId)
    if (c) task.done = true
  }
  res.json(ok(tasks))
})

app.post('/meds/tasks/:taskId/check', (req, res) => {
  const { done = true, ts } = req.body || {}
  const checks = readJson('med_task_checks')
  const idx = checks.findIndex(x => x.taskId === req.params.taskId)
  if (done) {
    if (idx < 0) checks.push({ taskId: req.params.taskId, ts: ts || new Date().toISOString() })
  } else {
    if (idx >= 0) checks.splice(idx, 1)
  }
  writeJson('med_task_checks', checks)
  res.json(ok({ taskId: req.params.taskId, done }))
})

app.get('/meds/search', (req, res) => {
  const q = (req.query.q || '').toString()
  const list = q ? [{ name: '阿莫西林胶囊', spec: '0.5g' }, { name: '布洛芬缓释胶囊', spec: '0.3g' }] : []
  res.json(ok({ list, total: list.length }))
})

app.post('/meds/ocr', upload.single('file'), (req, res) => {
  ;(async () => {
    try {
      const file = req.file
      if (!file) return res.status(400).json(err(1001, 'file_required'))
      const useBaidu = !!(process.env.BAIDU_OCR_CLIENT_ID && process.env.BAIDU_OCR_CLIENT_SECRET)
      let words = []
      let text = ''
      if (useBaidu) {
        const tokenResp = await axios.post('https://aip.baidubce.com/oauth/2.0/token', null, { params: { grant_type: 'client_credentials', client_id: process.env.BAIDU_OCR_CLIENT_ID, client_secret: process.env.BAIDU_OCR_CLIENT_SECRET } })
        const access_token = tokenResp.data.access_token
        const imgBase64 = fs.readFileSync(file.path, { encoding: 'base64' })
        const ocrResp = await axios.post(`https://aip.baidubce.com/rest/2.0/ocr/v1/general_basic?access_token=${access_token}`, new URLSearchParams({ image: imgBase64 }).toString(), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } })
        words = (ocrResp.data.words_result || []).map(w => w.words)
        text = words.join(' ')
      }
      if (!words.length) {
        words = []
        text = ''
      }
      function guessName(wordsArr, fallbackText) {
        const candidates = []
        for (const w of wordsArr) {
          const m = w.match(/([\u4e00-\u9fa5A-Za-z\s]{2,})/)
          if (m) {
            const s = m[0].trim()
            if (/[片丸胶囊颗粒注射液滴眼液软膏栓]/.test(s)) candidates.push(s)
          }
        }
        if (candidates.length) return candidates.sort((a, b) => b.length - a.length)[0]
        const zh = (fallbackText || '').match(/[\u4e00-\u9fa5]{2,}/g)
        if (zh && zh.length) return zh.sort((a, b) => b.length - a.length)[0]
        return '未知药品'
      }
      function guessSpec(allText) {
        const m = (allText || '').match(/([0-9]+(?:\.[0-9]+)?\s*(mg|g|ml|IU))/i)
        return m ? m[0] : undefined
      }
      const name = guessName(words, text)
      const spec = guessSpec(text)
      let analysis = null
      if (process.env.OPENAI_API_KEY) {
        try {
          const prompt = `从以下OCR文本中提取药品名称和属性：\n${text}\n输出JSON，包含: name, spec, dose, meal, freqLabel, contraindications`;
          const aiResp = await axios.post('https://api.openai.com/v1/chat/completions', { model: 'gpt-4o-mini', messages: [{ role: 'system', content: '你是药品属性提取助手，只输出JSON。' }, { role: 'user', content: prompt }] }, { headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` } })
          const content = aiResp.data.choices?.[0]?.message?.content || ''
          try { analysis = JSON.parse(content) } catch { analysis = { raw: content } }
        } catch {}
      }
      res.json(ok({ name, spec, analysis, ocr: { text, words } }))
    } catch (e) {
      res.json(ok({ name: '示例药品', spec: '0.5g' }))
    }
  })()
})

app.get('/bookings', (req, res) => {
  const { memberId, dateFrom, dateTo, page = 1, pageSize = 50 } = req.query
  let list = readJson('bookings')
  if (memberId) list = list.filter(b => b.memberId === memberId)
  if (dateFrom) list = list.filter(b => b.openTime >= dateFrom)
  if (dateTo) list = list.filter(b => b.openTime <= dateTo)
  res.json(ok(paginate(list, Number(page), Number(pageSize))))
})

app.post('/bookings', (req, res) => {
  const list = readJson('bookings')
  const b = { id: ulid(), ...req.body }
  list.push(b)
  writeJson('bookings', list)
  res.json(ok(b))
})

app.get('/bookings/:id', (req, res) => {
  const list = readJson('bookings')
  const b = list.find(x => x.id === req.params.id)
  if (!b) return res.status(404).json(err(404, 'not_found'))
  res.json(ok(b))
})

app.put('/bookings/:id', (req, res) => {
  const list = readJson('bookings')
  const idx = list.findIndex(x => x.id === req.params.id)
  if (idx < 0) return res.status(404).json(err(404, 'not_found'))
  list[idx] = { ...list[idx], ...req.body }
  writeJson('bookings', list)
  res.json(ok(list[idx]))
})

app.delete('/bookings/:id', (req, res) => {
  let list = readJson('bookings')
  const before = list.length
  list = list.filter(x => x.id !== req.params.id)
  if (before === list.length) return res.status(404).json(err(404, 'not_found'))
  writeJson('bookings', list)
  res.json(ok({ id: req.params.id }))
})

app.get('/reports', (req, res) => {
  const { memberId, dateFrom, dateTo, page = 1, pageSize = 50 } = req.query
  let list = readJson('reports')
  if (memberId) list = list.filter(r => r.memberId === memberId)
  if (dateFrom) list = list.filter(r => r.date >= dateFrom)
  if (dateTo) list = list.filter(r => r.date <= dateTo)
  res.json(ok(paginate(list, Number(page), Number(pageSize))))
})

app.post('/reports', (req, res) => {
  const list = readJson('reports')
  const r = { id: ulid(), metrics: [], ...req.body }
  list.push(r)
  writeJson('reports', list)
  res.json(ok(r))
})

app.get('/reports/:id', (req, res) => {
  const list = readJson('reports')
  const r = list.find(x => x.id === req.params.id)
  if (!r) return res.status(404).json(err(404, 'not_found'))
  res.json(ok(r))
})

app.put('/reports/:id', (req, res) => {
  const list = readJson('reports')
  const idx = list.findIndex(x => x.id === req.params.id)
  if (idx < 0) return res.status(404).json(err(404, 'not_found'))
  list[idx] = { ...list[idx], ...req.body }
  writeJson('reports', list)
  res.json(ok(list[idx]))
})

app.delete('/reports/:id', (req, res) => {
  let list = readJson('reports')
  const before = list.length
  list = list.filter(x => x.id !== req.params.id)
  if (before === list.length) return res.status(404).json(err(404, 'not_found'))
  writeJson('reports', list)
  res.json(ok({ id: req.params.id }))
})

app.get('/reports/:id/metrics', (req, res) => {
  const list = readJson('reports')
  const r = list.find(x => x.id === req.params.id)
  if (!r) return res.status(404).json(err(404, 'not_found'))
  res.json(ok(r.metrics || []))
})

app.post('/reports/:id/metrics', (req, res) => {
  const list = readJson('reports')
  const idx = list.findIndex(x => x.id === req.params.id)
  if (idx < 0) return res.status(404).json(err(404, 'not_found'))
  list[idx].metrics = Array.isArray(req.body) ? req.body : []
  writeJson('reports', list)
  res.json(ok(list[idx].metrics))
})

app.get('/reports/:id/trends', (req, res) => {
  const metric = req.query.metric
  const range = req.query.range || '30d'
  const days = Number(range.replace('d', '')) || 30
  const now = dayjs()
  const points = Array.from({ length: days }).map((_, i) => ({ date: now.subtract(days - i, 'day').format('YYYY-MM-DD'), value: Math.round(100 + Math.random() * 20) }))
  res.json(ok(points))
})

app.post('/reports/:id/ai/interpret', (req, res) => {
  const text = 'AI报告解读占位'
  res.json(ok({ aiText: text }))
})

app.get('/bills', (req, res) => {
  const { memberId, dateFrom, dateTo, category, insured, page = 1, pageSize = 50 } = req.query
  let list = readJson('bills')
  if (memberId) list = list.filter(b => b.memberId === memberId)
  if (category) list = list.filter(b => b.category === category)
  if (insured !== undefined) list = list.filter(b => String(b.insured) === String(insured))
  if (dateFrom) list = list.filter(b => b.date >= dateFrom)
  if (dateTo) list = list.filter(b => b.date <= dateTo)
  res.json(ok(paginate(list, Number(page), Number(pageSize))))
})

app.post('/bills', (req, res) => {
  const list = readJson('bills')
  const b = { id: ulid(), items: [], ...req.body }
  list.push(b)
  writeJson('bills', list)
  res.json(ok(b))
})

app.get('/bills/:id', (req, res) => {
  const list = readJson('bills')
  const b = list.find(x => x.id === req.params.id)
  if (!b) return res.status(404).json(err(404, 'not_found'))
  res.json(ok(b))
})

app.put('/bills/:id', (req, res) => {
  const list = readJson('bills')
  const idx = list.findIndex(x => x.id === req.params.id)
  if (idx < 0) return res.status(404).json(err(404, 'not_found'))
  list[idx] = { ...list[idx], ...req.body }
  writeJson('bills', list)
  res.json(ok(list[idx]))
})

app.delete('/bills/:id', (req, res) => {
  let list = readJson('bills')
  const before = list.length
  list = list.filter(x => x.id !== req.params.id)
  if (before === list.length) return res.status(404).json(err(404, 'not_found'))
  writeJson('bills', list)
  res.json(ok({ id: req.params.id }))
})

app.get('/bills/:id/items', (req, res) => {
  const list = readJson('bills')
  const b = list.find(x => x.id === req.params.id)
  if (!b) return res.status(404).json(err(404, 'not_found'))
  res.json(ok(b.items || []))
})

app.post('/bills/:id/items', (req, res) => {
  const list = readJson('bills')
  const idx = list.findIndex(x => x.id === req.params.id)
  if (idx < 0) return res.status(404).json(err(404, 'not_found'))
  list[idx].items = Array.isArray(req.body) ? req.body : []
  writeJson('bills', list)
  res.json(ok(list[idx].items))
})

app.get('/stats/expenses', (req, res) => {
  const { memberId, dateFrom, dateTo } = req.query
  let list = readJson('bills')
  if (memberId) list = list.filter(b => b.memberId === memberId)
  if (dateFrom) list = list.filter(b => b.date >= dateFrom)
  if (dateTo) list = list.filter(b => b.date <= dateTo)
  const byCat = {}
  for (const b of list) {
    for (const it of b.items || []) {
      const cat = it.category || '其他'
      byCat[cat] = (byCat[cat] || 0) + Number(it.amount || 0)
    }
  }
  const total = Object.values(byCat).reduce((a, b) => a + b, 0)
  const result = Object.entries(byCat).map(([name, amount]) => ({ name, amount, ratio: total ? amount / total : 0 }))
  res.json(ok(result))
})

app.get('/stats/health-trends', (req, res) => {
  const points = Array.from({ length: 30 }).map((_, i) => ({ date: dayjs().subtract(30 - i, 'day').format('YYYY-MM-DD'), value: Math.round(100 + Math.random() * 20) }))
  res.json(ok(points))
})

app.get('/preferences', (req, res) => {
  const pref = readJson('preferences')
  res.json(ok(pref[0] || { elderlyMode: false, fontScale: 1 }))
})

app.put('/preferences', (req, res) => {
  writeJson('preferences', [req.body || {}])
  res.json(ok(req.body || {}))
})

app.get('/subscriptions', (req, res) => {
  const sub = readJson('subscriptions')
  res.json(ok(sub[0] || { meds: true, booking: true }))
})

app.put('/subscriptions', (req, res) => {
  writeJson('subscriptions', [req.body || {}])
  res.json(ok(req.body || {}))
})

app.listen(PORT, () => {
  console.log(`server on ${PORT}`)
})
