// src/routes/index.js
import { Router } from 'express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import db from '../db/index.js'
import { requireAuth, requireAdmin, requireSuperAdmin } from '../middleware/auth.js'

const r = Router()

// ─── AUTH ──────────────────────────────────────────────────────────────────
r.post('/auth/admin-login', (req, res) => {
  const { username, password } = req.body
  if (!username || !password) return res.status(400).json({ error: 'Credenciales requeridas' })

  const adminUser = db.prepare('SELECT * FROM admin_users WHERE username = ? AND activo = 1').get(username)
  if (!adminUser) return res.status(401).json({ error: 'Credenciales incorrectas' })

  const valid = bcrypt.compareSync(password, adminUser.password_hash)
  if (!valid) return res.status(401).json({ error: 'Credenciales incorrectas' })

  const config = db.prepare('SELECT admin_secret FROM config_jwt LIMIT 1').get()
  const secret = config?.admin_secret || 'assure-admin-fallback'

  const token = jwt.sign(
    { userId: adminUser.id, username: adminUser.username, nombre: adminUser.nombre, role: adminUser.role, authMethod: 'admin' },
    secret,
    { expiresIn: '8h' }
  )
  res.json({ token, user: { id: adminUser.id, username: adminUser.username, nombre: adminUser.nombre, role: adminUser.role } })
})

r.post('/auth/validate', (req, res) => {
  const { token } = req.body

  const config = db.prepare('SELECT * FROM config_jwt LIMIT 1').get()

  // If JWT auth is disabled, anyone can access without a token
  if (!config?.activo) {
    if (!token) return res.json({ valid: true, role: 'consultant', nombre: 'Consultor' })
    try {
      const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString())
      const role = payload.role || 'consultant'
      return res.json({ valid: true, role, nombre: payload.user?.nombre || payload.nombre })
    } catch {
      return res.json({ valid: true, role: 'consultant', nombre: 'Consultor' })
    }
  }

  if (!token) return res.json({ valid: false })

  if (!config?.jwt_secret) return res.json({ valid: false, error: 'JWT not configured' })

  try {
    const payload = jwt.verify(token, config.jwt_secret)
    return res.json({ valid: true, role: payload.role || 'consultant', payload })
  } catch {
    return res.json({ valid: false })
  }
})

// ─── NEWS ──────────────────────────────────────────────────────────────────
r.get('/news', requireAuth, (req, res) => {
  const lang = req.query.lang
  let sql = 'SELECT * FROM noticias'
  const params = []
  if (lang && lang !== 'all') {
    sql += " WHERE (lang IS NULL OR lang = 'all' OR lang = ?)"
    params.push(lang)
  }
  sql += ' ORDER BY fecha DESC, created_at DESC'
  const rows = db.prepare(sql).all(...params)
  res.json(rows.map(r => ({ ...r, destacada: !!r.destacada })))
})

r.get('/news/:id', requireAuth, (req, res) => {
  const row = db.prepare('SELECT * FROM noticias WHERE id = ?').get(req.params.id)
  if (!row) return res.status(404).json({ error: 'Not found' })
  res.json({ ...row, destacada: !!row.destacada })
})

r.post('/news', requireAdmin, (req, res) => {
  const { titulo, tipo, resumen, contenido, imagen_url, youtube_url, fecha, destacada, lang } = req.body
  const result = db.prepare(
    'INSERT INTO noticias (titulo, tipo, resumen, contenido, imagen_url, youtube_url, fecha, destacada, lang) VALUES (?,?,?,?,?,?,?,?,?)'
  ).run(titulo, tipo, resumen, contenido, imagen_url, youtube_url, fecha, destacada ? 1 : 0, lang || 'all')
  res.json({ id: result.lastInsertRowid, ...req.body })
})

r.put('/news/:id', requireAdmin, (req, res) => {
  const { titulo, tipo, resumen, contenido, imagen_url, youtube_url, fecha, destacada, lang } = req.body
  db.prepare(
    "UPDATE noticias SET titulo=?,tipo=?,resumen=?,contenido=?,imagen_url=?,youtube_url=?,fecha=?,destacada=?,lang=?,updated_at=datetime('now') WHERE id=?"
  ).run(titulo, tipo, resumen, contenido, imagen_url, youtube_url, fecha, destacada ? 1 : 0, lang || 'all', req.params.id)
  res.json({ success: true })
})

r.delete('/news/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM noticias WHERE id=?').run(req.params.id)
  res.json({ success: true })
})

// ─── RESOURCES ─────────────────────────────────────────────────────────────
r.get('/resources', requireAuth, (req, res) => {
  const lang = req.query.lang
  let sql = 'SELECT * FROM recursos'
  const params = []
  if (lang && lang !== 'all') {
    sql += " WHERE (lang IS NULL OR lang = 'all' OR lang = ?)"
    params.push(lang)
  }
  sql += ' ORDER BY fecha DESC, created_at DESC'
  const rows = db.prepare(sql).all(...params)
  res.json(rows.map(r => ({ ...r, imagen: r.imagen_url, archivo_url: r.url })))
})

r.post('/resources', requireAdmin, (req, res) => {
  const { titulo, descripcion, tipo, url, imagen_url, archivo_url, imagen, texto_boton, seccion, fecha, lang } = req.body
  const finalUrl = archivo_url || url || ''
  const finalImg = imagen || imagen_url || ''
  const finalFecha = fecha || new Date().toISOString().split('T')[0]
  const result = db.prepare(
    'INSERT INTO recursos (titulo, descripcion, tipo, url, imagen_url, texto_boton, seccion, fecha, lang) VALUES (?,?,?,?,?,?,?,?,?)'
  ).run(titulo, descripcion, tipo, finalUrl, finalImg, texto_boton || 'Descargar', seccion || 'consultores', finalFecha, lang || 'all')
  res.json({ id: result.lastInsertRowid, ...req.body })
})

r.put('/resources/:id', requireAdmin, (req, res) => {
  const { titulo, descripcion, tipo, url, imagen_url, archivo_url, imagen, texto_boton, seccion, fecha, lang } = req.body
  const finalUrl = archivo_url || url || ''
  const finalImg = imagen || imagen_url || ''
  const finalFecha = fecha || new Date().toISOString().split('T')[0]
  db.prepare(
    'UPDATE recursos SET titulo=?,descripcion=?,tipo=?,url=?,imagen_url=?,texto_boton=?,seccion=?,fecha=?,lang=? WHERE id=?'
  ).run(titulo, descripcion, tipo, finalUrl, finalImg, texto_boton || 'Descargar', seccion || 'consultores', finalFecha, lang || 'all', req.params.id)
  res.json({ success: true })
})

r.delete('/resources/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM recursos WHERE id=?').run(req.params.id)
  res.json({ success: true })
})

// ─── FORUM ─────────────────────────────────────────────────────────────────
r.get('/forum/posts', requireAuth, (req, res) => {
  res.json(db.prepare('SELECT * FROM forum_posts ORDER BY created_at DESC').all())
})

r.post('/forum/posts', requireAuth, (req, res) => {
  const { contenido, autor, autor_nivel } = req.body
  const result = db.prepare('INSERT INTO forum_posts (contenido, autor, autor_nivel) VALUES (?,?,?)').run(contenido, autor, autor_nivel)
  res.json({ id: result.lastInsertRowid, ...req.body, reply_count: 0, created_at: new Date().toISOString() })
})

r.put('/forum/posts/:id', requireAdmin, (req, res) => {
  db.prepare('UPDATE forum_posts SET contenido=? WHERE id=?').run(req.body.contenido, req.params.id)
  res.json({ success: true })
})

r.delete('/forum/posts/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM forum_posts WHERE id=?').run(req.params.id)
  res.json({ success: true })
})

r.get('/forum/posts/:postId/replies', requireAuth, (req, res) => {
  res.json(db.prepare('SELECT * FROM forum_replies WHERE post_id=? ORDER BY created_at ASC').all(req.params.postId))
})

r.post('/forum/posts/:postId/replies', requireAuth, (req, res) => {
  const { contenido, autor } = req.body
  const result = db.prepare('INSERT INTO forum_replies (post_id, contenido, autor) VALUES (?,?,?)').run(req.params.postId, contenido, autor)
  db.prepare('UPDATE forum_posts SET reply_count = reply_count + 1 WHERE id=?').run(req.params.postId)
  res.json({ id: result.lastInsertRowid, ...req.body })
})

r.delete('/forum/replies/:id', requireAdmin, (req, res) => {
  const reply = db.prepare('SELECT post_id FROM forum_replies WHERE id=?').get(req.params.id)
  if (reply) {
    db.prepare('DELETE FROM forum_replies WHERE id=?').run(req.params.id)
    db.prepare('UPDATE forum_posts SET reply_count = MAX(0, reply_count - 1) WHERE id=?').run(reply.post_id)
  }
  res.json({ success: true })
})

// ─── RECOGNITIONS ──────────────────────────────────────────────────────────
r.get('/recognitions', requireAuth, (req, res) => {
  const sort = req.query.sort === 'ventas:desc' ? 'ventas DESC' : 'created_at DESC'
  const lang = req.query.lang
  let sql = 'SELECT * FROM reconocimientos'
  const params = []
  if (lang && lang !== 'all') {
    sql += " WHERE (lang IS NULL OR lang = 'all' OR lang = ?)"
    params.push(lang)
  }
  sql += ` ORDER BY ${sort}`
  res.json(db.prepare(sql).all(...params))
})

r.post('/recognitions', requireAdmin, (req, res) => {
  const { nombre, nivel, descripcion, foto_url, imagen_card_url, link_url, mes, año, ventas, lang } = req.body
  const result = db.prepare('INSERT INTO reconocimientos (nombre, nivel, descripcion, foto_url, imagen_card_url, link_url, mes, año, ventas, lang) VALUES (?,?,?,?,?,?,?,?,?,?)').run(nombre, nivel, descripcion, foto_url, imagen_card_url, link_url, mes, año, ventas, lang || 'all')
  res.json({ id: result.lastInsertRowid, ...req.body })
})

r.put('/recognitions/:id', requireAdmin, (req, res) => {
  const { nombre, nivel, descripcion, foto_url, imagen_card_url, link_url, mes, año, ventas, lang } = req.body
  db.prepare('UPDATE reconocimientos SET nombre=?,nivel=?,descripcion=?,foto_url=?,imagen_card_url=?,link_url=?,mes=?,año=?,ventas=?,lang=? WHERE id=?').run(nombre, nivel, descripcion, foto_url, imagen_card_url, link_url, mes, año, ventas, lang || 'all', req.params.id)
  res.json({ success: true })
})

r.delete('/recognitions/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM reconocimientos WHERE id=?').run(req.params.id)
  res.json({ success: true })
})

// ─── RANKING ───────────────────────────────────────────────────────────────
r.get('/ranking', requireAuth, (req, res) => {
  const { mes, año, lang } = req.query
  let sql = 'SELECT * FROM ranking'
  const params = []
  const conditions = []
  if (mes) { conditions.push('mes=?'); params.push(mes) }
  if (año) { conditions.push('año=?'); params.push(año) }
  if (lang && lang !== 'all') { conditions.push("(lang IS NULL OR lang = 'all' OR lang = ?)"); params.push(lang) }
  if (conditions.length) sql += ' WHERE ' + conditions.join(' AND ')
  sql += ' ORDER BY posicion ASC, ventas DESC'
  res.json(db.prepare(sql).all(...params))
})

r.post('/ranking', requireAdmin, (req, res) => {
  const { nombre, foto_url, nivel, ventas, posicion, mes, año, lang } = req.body
  const result = db.prepare('INSERT INTO ranking (nombre, foto_url, nivel, ventas, posicion, mes, año, lang) VALUES (?,?,?,?,?,?,?,?)').run(nombre, foto_url, nivel, ventas, posicion, mes, año, lang || 'all')
  res.json({ id: result.lastInsertRowid, ...req.body })
})

r.put('/ranking/:id', requireAdmin, (req, res) => {
  const { nombre, foto_url, nivel, ventas, posicion, mes, año, lang } = req.body
  db.prepare('UPDATE ranking SET nombre=?,foto_url=?,nivel=?,ventas=?,posicion=?,mes=?,año=?,lang=? WHERE id=?').run(nombre, foto_url, nivel, ventas, posicion, mes, año, lang || 'all', req.params.id)
  res.json({ success: true })
})

r.delete('/ranking/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM ranking WHERE id=?').run(req.params.id)
  res.json({ success: true })
})

// ─── CONFIG ────────────────────────────────────────────────────────────────
r.get('/config/jwt', requireAdmin, (req, res) => {
  const row = db.prepare('SELECT * FROM config_jwt LIMIT 1').get()
  if (row) row.activo = !!row.activo
  res.json(row || {})
})

r.post('/config/jwt', requireAdmin, (req, res) => {
  const { activo, jwt_secret, web_pass, mensaje_acceso_denegado } = req.body
  const existing = db.prepare('SELECT id FROM config_jwt LIMIT 1').get()
  if (existing) {
    db.prepare(`UPDATE config_jwt SET activo=?,jwt_secret=?,web_pass=?,mensaje_acceso_denegado=?,updated_at=datetime('now') WHERE id=?`).run(activo ? 1 : 0, jwt_secret, web_pass, mensaje_acceso_denegado, existing.id)
  } else {
    db.prepare('INSERT INTO config_jwt (activo, jwt_secret, web_pass, mensaje_acceso_denegado) VALUES (?,?,?,?)').run(activo ? 1 : 0, jwt_secret, web_pass, mensaje_acceso_denegado)
  }
  res.json({ success: true })
})

r.get('/config/popup', requireAdmin, (req, res) => {
  const row = db.prepare('SELECT * FROM config_popup LIMIT 1').get()
  if (row) { row.activo = !!row.activo; try { row.paginas = JSON.parse(row.paginas) } catch { row.paginas = [] } }
  res.json(row || {})
})

// Public popup endpoint (non-admin) — returns config without sensitive data
r.get('/config/popup/public', requireAuth, (req, res) => {
  const { lang } = req.query
  const row = db.prepare('SELECT activo, titulo, mensaje, boton_texto, boton_url, paginas, frecuencia, delay_ms, lang FROM config_popup LIMIT 1').get()
  if (row) {
    row.activo = !!row.activo
    try { row.paginas = JSON.parse(row.paginas) } catch { row.paginas = [] }
    if (lang && row.lang && row.lang !== 'all' && row.lang !== lang) {
      return res.json({ activo: false })
    }
  }
  res.json(row || {})
})

r.post('/config/popup', requireAdmin, (req, res) => {
  const { activo, titulo, mensaje, boton_texto, boton_url, paginas, frecuencia, delay_ms, lang } = req.body
  const existing = db.prepare('SELECT id FROM config_popup LIMIT 1').get()
  const paginasStr = JSON.stringify(paginas || [])
  if (existing) {
    db.prepare(`UPDATE config_popup SET activo=?,titulo=?,mensaje=?,boton_texto=?,boton_url=?,paginas=?,frecuencia=?,delay_ms=?,lang=?,updated_at=datetime('now') WHERE id=?`).run(activo ? 1 : 0, titulo, mensaje, boton_texto, boton_url, paginasStr, frecuencia, delay_ms, lang || 'all', existing.id)
  } else {
    db.prepare('INSERT INTO config_popup (activo, titulo, mensaje, boton_texto, boton_url, paginas, frecuencia, delay_ms, lang) VALUES (?,?,?,?,?,?,?,?,?)').run(activo ? 1 : 0, titulo, mensaje, boton_texto, boton_url, paginasStr, frecuencia, delay_ms, lang || 'all')
  }
  res.json({ success: true })
})

r.get('/config/prompt', requireAdmin, (req, res) => {
  res.json(db.prepare('SELECT * FROM config_prompt LIMIT 1').get() || {})
})

r.post('/config/prompt', requireAdmin, (req, res) => {
  const { introduccion, instrucciones } = req.body
  const existing = db.prepare('SELECT id FROM config_prompt LIMIT 1').get()
  if (existing) {
    db.prepare(`UPDATE config_prompt SET introduccion=?,instrucciones=?,updated_at=datetime('now') WHERE id=?`).run(introduccion, instrucciones, existing.id)
  } else {
    db.prepare('INSERT INTO config_prompt (introduccion, instrucciones) VALUES (?,?)').run(introduccion, instrucciones)
  }
  res.json({ success: true })
})

// ─── DOCUMENTS ─────────────────────────────────────────────────────────────
r.get('/documents', requireAdmin, (req, res) => {
  const rows = db.prepare('SELECT * FROM asistente_docs ORDER BY created_at DESC').all()
  res.json(rows.map(r => ({ ...r, activo: !!r.activo, puntos_clave: JSON.parse(r.puntos_clave || '[]'), terminos_importantes: JSON.parse(r.terminos_importantes || '[]') })))
})

r.patch('/documents/:id/active', requireAdmin, (req, res) => {
  db.prepare('UPDATE asistente_docs SET activo=? WHERE id=?').run(req.body.activo ? 1 : 0, req.params.id)
  res.json({ success: true })
})

r.delete('/documents/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM asistente_docs WHERE id=?').run(req.params.id)
  res.json({ success: true })
})

// ─── ADMIN USERS ───────────────────────────────────────────────────────────
r.get('/admin/users', requireSuperAdmin, (req, res) => {
  const rows = db.prepare('SELECT id, username, nombre, role, activo, created_at FROM admin_users ORDER BY created_at ASC').all()
  res.json(rows.map(r => ({ ...r, activo: !!r.activo })))
})

r.post('/admin/users', requireSuperAdmin, (req, res) => {
  const { username, nombre, password, role } = req.body
  if (!username || !nombre || !password) return res.status(400).json({ error: 'username, nombre y password son requeridos' })
  if (!['super_admin', 'editor'].includes(role)) return res.status(400).json({ error: 'Rol inválido' })
  const exists = db.prepare('SELECT id FROM admin_users WHERE username = ?').get(username)
  if (exists) return res.status(409).json({ error: 'El username ya existe' })
  const hash = bcrypt.hashSync(password, 10)
  const result = db.prepare('INSERT INTO admin_users (username, nombre, password_hash, role) VALUES (?,?,?,?)').run(username, nombre, hash, role)
  res.json({ id: result.lastInsertRowid, username, nombre, role, activo: true })
})

r.put('/admin/users/:id', requireSuperAdmin, (req, res) => {
  const { nombre, role, activo, password } = req.body
  const user = db.prepare('SELECT * FROM admin_users WHERE id = ?').get(req.params.id)
  if (!user) return res.status(404).json({ error: 'Usuario no encontrado' })
  if (role && !['super_admin', 'editor'].includes(role)) return res.status(400).json({ error: 'Rol inválido' })

  if (password) {
    const hash = bcrypt.hashSync(password, 10)
    db.prepare('UPDATE admin_users SET password_hash = ? WHERE id = ?').run(hash, req.params.id)
  }
  db.prepare('UPDATE admin_users SET nombre=?, role=?, activo=? WHERE id=?').run(
    nombre ?? user.nombre,
    role ?? user.role,
    activo !== undefined ? (activo ? 1 : 0) : user.activo,
    req.params.id
  )
  res.json({ success: true })
})

r.delete('/admin/users/:id', requireSuperAdmin, (req, res) => {
  const count = db.prepare('SELECT COUNT(*) as n FROM admin_users WHERE role = "super_admin" AND activo = 1').get()
  const user = db.prepare('SELECT * FROM admin_users WHERE id = ?').get(req.params.id)
  if (user?.role === 'super_admin' && count.n <= 1) {
    return res.status(400).json({ error: 'No puedes eliminar el único super administrador' })
  }
  db.prepare('DELETE FROM admin_users WHERE id = ?').run(req.params.id)
  res.json({ success: true })
})

// ─── TRANSLATIONS ──────────────────────────────────────────────────────────
// Public: load all overrides for a language (used on app init)
r.get('/translations/:lang', (req, res) => {
  const rows = db.prepare('SELECT key, value FROM translations WHERE lang = ?').all(req.params.lang)
  const result = {}
  rows.forEach(row => { result[row.key] = row.value })
  res.json(result)
})

// Admin: save a single translation override
r.put('/translations', requireAdmin, (req, res) => {
  const { lang, key, value } = req.body
  if (!lang || !key || value === undefined) return res.status(400).json({ error: 'lang, key y value son requeridos' })
  db.prepare(`
    INSERT INTO translations (lang, key, value, updated_at)
    VALUES (?, ?, ?, datetime('now'))
    ON CONFLICT(lang, key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
  `).run(lang, key, value)
  res.json({ success: true })
})

// ─── ANTHROPIC API KEY ─────────────────────────────────────────────────────
r.get('/config/anthropic-key', requireAdmin, (req, res) => {
  const row = db.prepare('SELECT api_key FROM config_anthropic LIMIT 1').get()
  const key = row?.api_key || process.env.ANTHROPIC_API_KEY || ''
  res.json({ api_key: key ? key.slice(0, 20) + '...' : '' })
})

r.post('/config/anthropic-key', requireAdmin, (req, res) => {
  const { api_key } = req.body
  if (!api_key) return res.status(400).json({ error: 'api_key requerida' })
  const existing = db.prepare('SELECT id FROM config_anthropic LIMIT 1').get()
  if (existing) {
    db.prepare("UPDATE config_anthropic SET api_key=?, updated_at=datetime('now') WHERE id=?").run(api_key, existing.id)
  } else {
    db.prepare('INSERT INTO config_anthropic (api_key) VALUES (?)').run(api_key)
  }
  res.json({ success: true })
})

// ─── AUTO-TRANSLATE DUPLICATE ──────────────────────────────────────────────
r.post('/admin/translate-duplicate', requireAdmin, async (req, res) => {
  const { entity, id, targetLang } = req.body
  if (!entity || !id || !targetLang) return res.status(400).json({ error: 'entity, id y targetLang son requeridos' })

  const keyRow = db.prepare('SELECT api_key FROM config_anthropic LIMIT 1').get()
  const apiKey = keyRow?.api_key || process.env.ANTHROPIC_API_KEY
  if (!apiKey) return res.status(500).json({ error: 'No hay API key de Anthropic configurada' })

  const { default: Anthropic } = await import('@anthropic-ai/sdk')
  const client = new Anthropic({ apiKey })

  const ENTITIES = {
    news: {
      table: 'noticias',
      fields: ['titulo', 'resumen', 'contenido'],
      fetch: (id) => db.prepare('SELECT * FROM noticias WHERE id=?').get(id),
      insert: (d, lang) => db.prepare(
        'INSERT INTO noticias (titulo, tipo, resumen, contenido, imagen_url, youtube_url, fecha, destacada, lang) VALUES (?,?,?,?,?,?,?,?,?)'
      ).run(d.titulo, d.tipo, d.resumen, d.contenido, d.imagen_url, d.youtube_url, d.fecha, d.destacada, lang),
    },
    resources: {
      table: 'recursos',
      fields: ['titulo', 'descripcion'],
      fetch: (id) => db.prepare('SELECT * FROM recursos WHERE id=?').get(id),
      insert: (d, lang) => db.prepare(
        'INSERT INTO recursos (titulo, descripcion, tipo, url, imagen_url, texto_boton, seccion, orden, lang) VALUES (?,?,?,?,?,?,?,?,?)'
      ).run(d.titulo, d.descripcion, d.tipo, d.url, d.imagen_url, d.texto_boton, d.seccion, d.orden, lang),
    },
    recognitions: {
      table: 'reconocimientos',
      fields: ['descripcion'],
      fetch: (id) => db.prepare('SELECT * FROM reconocimientos WHERE id=?').get(id),
      insert: (d, lang) => db.prepare(
        'INSERT INTO reconocimientos (nombre, nivel, descripcion, foto_url, imagen_card_url, link_url, mes, año, ventas, lang) VALUES (?,?,?,?,?,?,?,?,?,?)'
      ).run(d.nombre, d.nivel, d.descripcion, d.foto_url, d.imagen_card_url, d.link_url, d.mes, d.año, d.ventas, lang),
    },
    ranking: {
      table: 'ranking',
      fields: [],
      fetch: (id) => db.prepare('SELECT * FROM ranking WHERE id=?').get(id),
      insert: (d, lang) => db.prepare(
        'INSERT INTO ranking (nombre, foto_url, nivel, ventas, posicion, mes, año, lang) VALUES (?,?,?,?,?,?,?,?)'
      ).run(d.nombre, d.foto_url, d.nivel, d.ventas, d.posicion, d.mes, d.año, lang),
    },
    popup: {
      table: 'config_popup',
      fields: ['titulo', 'mensaje', 'boton_texto'],
      fetch: () => db.prepare('SELECT * FROM config_popup LIMIT 1').get(),
      insert: (d, lang) => db.prepare(
        'INSERT INTO config_popup (activo, titulo, mensaje, boton_texto, boton_url, paginas, frecuencia, delay_ms, lang) VALUES (?,?,?,?,?,?,?,?,?)'
      ).run(0, d.titulo, d.mensaje, d.boton_texto, d.boton_url, d.paginas, d.frecuencia, d.delay_ms, lang),
    },
  }

  const cfg = ENTITIES[entity]
  if (!cfg) return res.status(400).json({ error: 'Entidad no válida' })

  const record = cfg.fetch(id)
  if (!record) return res.status(404).json({ error: 'Registro no encontrado' })

  const targetLabel = targetLang === 'en' ? 'English' : 'Spanish'
  const sourceLabel = targetLang === 'en' ? 'Spanish' : 'English'

  let translated = { ...record, lang: targetLang }

  if (cfg.fields.length > 0) {
    const fieldsToTranslate = cfg.fields.filter(f => record[f])
    if (fieldsToTranslate.length > 0) {
      const payload = {}
      fieldsToTranslate.forEach(f => { payload[f] = record[f] })

      const msg = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 4096,
        messages: [{
          role: 'user',
          content: `Translate the following JSON fields from ${sourceLabel} to ${targetLabel}. Return ONLY valid JSON with the same keys. Do not add explanations.\n\n${JSON.stringify(payload)}`,
        }],
      })

      try {
        const raw = msg.content[0].text.trim().replace(/^```json\n?/, '').replace(/\n?```$/, '')
        const parsed = JSON.parse(raw)
        Object.assign(translated, parsed)
      } catch (e) {
        return res.status(500).json({ error: 'Error al parsear la traducción' })
      }
    }
  }

  const result = cfg.insert(translated, targetLang)
  res.json({ success: true, newId: result.lastInsertRowid })
})

// Admin: delete a translation override (reverts to default)
r.delete('/translations', requireAdmin, (req, res) => {
  const { lang, key } = req.body
  if (!lang || !key) return res.status(400).json({ error: 'lang y key son requeridos' })
  db.prepare('DELETE FROM translations WHERE lang = ? AND key = ?').run(lang, key)
  res.json({ success: true })
})

export default r
