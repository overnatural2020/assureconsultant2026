// src/middleware/auth.js
import jwt from 'jsonwebtoken'
import db from '../db/index.js'

function getAdminSecret() {
  const row = db.prepare('SELECT admin_secret FROM config_jwt LIMIT 1').get()
  return row?.admin_secret || 'assure-admin-fallback'
}

function verifyAdminToken(token) {
  try {
    const payload = jwt.verify(token, getAdminSecret())
    if (payload.authMethod === 'admin') return payload
  } catch {}
  return null
}

function verifyConsultantToken(token) {
  const config = db.prepare('SELECT * FROM config_jwt LIMIT 1').get()
  if (!config?.activo) {
    try {
      const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString())
      return { ...payload, role: 'consultant' }
    } catch { return null }
  }
  if (!config?.jwt_secret) return null
  try {
    const payload = jwt.verify(token, config.jwt_secret)
    // Flatten nested user object if present
    const user = payload.user || {}
    return { ...payload, ...user, role: 'consultant' }
  } catch { return null }
}

export function requireAuth(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '')

  // If JWT is disabled, allow access without token
  const config = db.prepare('SELECT activo FROM config_jwt LIMIT 1').get()
  if (!config?.activo) {
    if (!token) {
      req.user = { role: 'consultant' }
      return next()
    }
    const adminPayload = verifyAdminToken(token)
    if (adminPayload) { req.user = adminPayload; return next() }
    req.user = { role: 'consultant' }
    return next()
  }

  if (!token) return res.status(401).json({ error: 'No token provided' })

  const adminPayload = verifyAdminToken(token)
  if (adminPayload) {
    req.user = adminPayload
    return next()
  }

  const consultantPayload = verifyConsultantToken(token)
  if (consultantPayload) {
    req.user = consultantPayload
    return next()
  }

  return res.status(401).json({ error: 'Token inválido o expirado' })
}

export function requireEditor(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'No token provided' })

  const payload = verifyAdminToken(token)
  if (!payload) return res.status(403).json({ error: 'Acceso restringido a administradores' })
  if (!['super_admin', 'editor'].includes(payload.role)) {
    return res.status(403).json({ error: 'Acceso restringido a editores' })
  }
  req.user = payload
  next()
}

export function requireSuperAdmin(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'No token provided' })

  const payload = verifyAdminToken(token)
  if (!payload) return res.status(403).json({ error: 'Acceso restringido a administradores' })
  if (payload.role !== 'super_admin') {
    return res.status(403).json({ error: 'Acceso restringido a super administradores' })
  }
  req.user = payload
  next()
}

// Backward compat alias
export const requireAdmin = requireEditor
