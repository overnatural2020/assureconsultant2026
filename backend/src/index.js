// src/index.js
import express from 'express'
import cors from 'cors'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import multer from 'multer'
import 'dotenv/config'
import routes from './routes/index.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 4000

// Diagnostic: prove Express is handling this request
app.use((req, res, next) => { res.setHeader('X-Express', 'yes'); next() })

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// File uploads
const uploadsDir = path.join(__dirname, '../../frontend/public/uploads')
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true })
const storage = multer.diskStorage({
  destination: uploadsDir,
  filename: (_, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')}`),
})
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } })
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file' })
  res.json({ url: `/uploads/${req.file.filename}` })
})

// Temporary diagnostic endpoint — BEFORE routes to ensure it's handled first
app.get('/api/debug-db', (req, res) => {
  res.json({ ok: true, node: process.version, platform: process.platform, time: new Date().toISOString() })
})

// API routes
app.use('/api', routes)

// Health check
app.get('/health', (_, res) => res.json({ status: 'ok', time: new Date().toISOString() }))

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  const frontendDist = path.join(__dirname, '../../frontend/dist')
  app.use(express.static(frontendDist))
  app.get('*', (_, res) => {
    res.sendFile(path.join(frontendDist, 'index.html'))
  })
}

app.listen(PORT, () => {
  console.log(`✅ Assure Consultant backend running on port ${PORT}`)
})
