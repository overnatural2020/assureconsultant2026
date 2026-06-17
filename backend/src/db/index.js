// src/db/index.js
import initSqlJs from 'sql.js'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../../data/assure.db')

const dataDir = path.dirname(DB_PATH)
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true })

const SQL = await initSqlJs()

let _db
if (fs.existsSync(DB_PATH)) {
  _db = new SQL.Database(fs.readFileSync(DB_PATH))
} else {
  _db = new SQL.Database()
}

function saveDb() {
  fs.writeFileSync(DB_PATH, Buffer.from(_db.export()))
}

function normalizeParams(args) {
  if (args.length === 0) return []
  if (args.length === 1) {
    const p = args[0]
    if (p === null || p === undefined) return []
    if (Array.isArray(p)) return p
    if (typeof p === 'object') return p
    return [p]
  }
  return Array.from(args)
}

class Stmt {
  constructor(sql) {
    this._sql = sql
  }

  get(...args) {
    const params = normalizeParams(args)
    const stmt = _db.prepare(this._sql)
    try {
      if (params.length || (params && typeof params === 'object' && !Array.isArray(params) && Object.keys(params).length)) {
        stmt.bind(params)
      }
      const stepped = stmt.step()
      return stepped ? stmt.getAsObject() : undefined
    } finally {
      stmt.free()
    }
  }

  all(...args) {
    const params = normalizeParams(args)
    const stmt = _db.prepare(this._sql)
    const results = []
    try {
      if (params.length || (params && typeof params === 'object' && !Array.isArray(params) && Object.keys(params).length)) {
        stmt.bind(params)
      }
      while (stmt.step()) {
        results.push(stmt.getAsObject())
      }
    } finally {
      stmt.free()
    }
    return results
  }

  run(...args) {
    const params = normalizeParams(args)
    const stmt = _db.prepare(this._sql)
    try {
      stmt.run(params)
    } finally {
      stmt.free()
    }
    saveDb()
    const changed = _db.getRowsModified()
    const lastId = _db.exec('SELECT last_insert_rowid()')?.[0]?.values?.[0]?.[0]
    return { changes: changed, lastInsertRowid: lastId }
  }
}

const db = {
  prepare(sql) {
    return new Stmt(sql)
  },
  exec(sql) {
    _db.run(sql)
    saveDb()
  },
  pragma(str) {
    try { _db.run(`PRAGMA ${str}`) } catch {}
  },
}

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS noticias (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo TEXT NOT NULL,
    tipo TEXT,
    resumen TEXT,
    contenido TEXT,
    imagen_url TEXT,
    youtube_url TEXT,
    fecha TEXT,
    destacada INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS recursos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo TEXT NOT NULL,
    descripcion TEXT,
    tipo TEXT,
    url TEXT,
    imagen_url TEXT,
    texto_boton TEXT DEFAULT 'Descargar',
    seccion TEXT DEFAULT 'consultores',
    orden INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS forum_posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    contenido TEXT NOT NULL,
    autor TEXT,
    autor_nivel TEXT,
    reply_count INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS forum_replies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
    contenido TEXT NOT NULL,
    autor TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS reconocimientos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    nivel TEXT,
    descripcion TEXT,
    foto_url TEXT,
    imagen_card_url TEXT,
    link_url TEXT,
    mes TEXT,
    año INTEGER,
    ventas REAL,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS config_jwt (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    activo INTEGER DEFAULT 0,
    jwt_secret TEXT,
    web_pass TEXT,
    admin_secret TEXT,
    mensaje_acceso_denegado TEXT DEFAULT 'Acceso no autorizado. Necesitas un token válido para acceder.',
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS config_popup (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    activo INTEGER DEFAULT 0,
    titulo TEXT,
    mensaje TEXT,
    boton_texto TEXT DEFAULT 'Entrar',
    boton_url TEXT,
    paginas TEXT DEFAULT '[]',
    frecuencia TEXT DEFAULT 'session',
    delay_ms INTEGER DEFAULT 1000,
    lang TEXT DEFAULT 'all',
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS config_prompt (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    introduccion TEXT,
    instrucciones TEXT,
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS asistente_docs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo TEXT,
    categoria TEXT,
    archivo_url TEXT,
    resumen TEXT,
    puntos_clave TEXT DEFAULT '[]',
    terminos_importantes TEXT DEFAULT '[]',
    activo INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS admin_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    nombre TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'editor',
    activo INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS ranking (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    foto_url TEXT,
    nivel TEXT,
    ventas REAL,
    posicion INTEGER,
    mes TEXT,
    año INTEGER,
    lang TEXT DEFAULT 'all',
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS config_anthropic (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    api_key TEXT,
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS translations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lang TEXT NOT NULL,
    key TEXT NOT NULL,
    value TEXT NOT NULL,
    updated_at TEXT DEFAULT (datetime('now')),
    UNIQUE(lang, key)
  );
`)

// Migrations (safe - catch already-exists errors)
const migrations = [
  "ALTER TABLE reconocimientos ADD COLUMN imagen_card_url TEXT",
  "ALTER TABLE reconocimientos ADD COLUMN link_url TEXT",
  "ALTER TABLE config_jwt ADD COLUMN admin_secret TEXT",
  "ALTER TABLE noticias ADD COLUMN lang TEXT DEFAULT 'all'",
  "ALTER TABLE recursos ADD COLUMN lang TEXT DEFAULT 'all'",
  "ALTER TABLE reconocimientos ADD COLUMN lang TEXT DEFAULT 'all'",
  "ALTER TABLE ranking ADD COLUMN lang TEXT DEFAULT 'all'",
  "ALTER TABLE config_popup ADD COLUMN lang TEXT DEFAULT 'all'",
  "ALTER TABLE recursos ADD COLUMN fecha TEXT",
]
for (const sql of migrations) {
  try { _db.run(sql) } catch {}
}
saveDb()

// Seed default JWT config
const jwtRow = db.prepare('SELECT id FROM config_jwt LIMIT 1').get()
if (!jwtRow) {
  db.prepare(`INSERT INTO config_jwt (activo, jwt_secret, mensaje_acceso_denegado) VALUES (0, '', 'Acceso no autorizado. Necesitas un token válido para acceder.')`).run()
}

// Generate admin_secret if missing
const adminSecretRow = db.prepare('SELECT admin_secret FROM config_jwt LIMIT 1').get()
if (!adminSecretRow?.admin_secret) {
  const secret = crypto.randomBytes(32).toString('hex')
  db.prepare('UPDATE config_jwt SET admin_secret = ?').run(secret)
}

// Seed initial super_admin
const adminCount = db.prepare('SELECT COUNT(*) as n FROM admin_users').get()
if (!adminCount?.n) {
  const hash = bcrypt.hashSync('Admin1234!', 10)
  db.prepare(`INSERT INTO admin_users (username, nombre, password_hash, role) VALUES ('admin', 'Administrador', ?, 'super_admin')`).run(hash)
  console.log('\n✅ Usuario admin inicial creado: username=admin, password=Admin1234!\n   ⚠️  Cambia la contraseña desde el panel de administración.\n')
}

export default db
