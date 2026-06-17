// src/db/index.js — uses node-sqlite3-wasm (pure WASM, synchronous init, no native compilation needed)
import _sqlite3 from 'node-sqlite3-wasm'
const { Database } = _sqlite3
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../../data/assure.db')

const dataDir = path.dirname(DB_PATH)
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true })
console.error('📂 DB_PATH:', DB_PATH, '| exists:', fs.existsSync(DB_PATH))

// Synchronous initialization — no top-level await, compatible with require()
const _db = new Database(DB_PATH)

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

// Wraps a prepared statement so callers can use better-sqlite3's rest-param style
class Stmt {
  constructor(sql) {
    this._sql = sql
  }

  get(...args) {
    const stmt = _db.prepare(this._sql)
    try {
      return stmt.get(normalizeParams(args))
    } finally {
      stmt.finalize()
    }
  }

  all(...args) {
    const stmt = _db.prepare(this._sql)
    try {
      return stmt.all(normalizeParams(args))
    } finally {
      stmt.finalize()
    }
  }

  run(...args) {
    const stmt = _db.prepare(this._sql)
    try {
      return stmt.run(normalizeParams(args))
    } finally {
      stmt.finalize()
    }
  }
}

const db = {
  prepare(sql) {
    return new Stmt(sql)
  },
  exec(sql) {
    _db.exec(sql)
  },
  pragma(str) {
    try { _db.exec(`PRAGMA ${str}`) } catch {}
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

// Migrations (safe — ignore already-exists errors)
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
  try { _db.exec(sql) } catch {}
}

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

// Seed content data if tables are empty (runs once on fresh deployment)
const noticiasCount = db.prepare('SELECT COUNT(*) as n FROM noticias').get()
if (!noticiasCount?.n) {
  try {
    const seedPath = path.join(__dirname, './seed-data.json')
    const seedData = JSON.parse(fs.readFileSync(seedPath, 'utf8'))
    for (const r of seedData.noticias) {
      try { db.prepare('INSERT INTO noticias (id,titulo,tipo,resumen,contenido,imagen_url,youtube_url,fecha,destacada,created_at,updated_at,lang) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)').run(r.id,r.titulo,r.tipo,r.resumen,r.contenido,r.imagen_url,r.youtube_url,r.fecha,r.destacada,r.created_at,r.updated_at,r.lang) } catch {}
    }
    for (const r of seedData.recursos) {
      try { db.prepare('INSERT INTO recursos (id,titulo,descripcion,tipo,url,imagen_url,texto_boton,seccion,orden,created_at,lang,fecha) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)').run(r.id,r.titulo,r.descripcion,r.tipo,r.url,r.imagen_url,r.texto_boton,r.seccion,r.orden,r.created_at,r.lang,r.fecha) } catch {}
    }
    for (const r of seedData.reconocimientos) {
      try { db.prepare('INSERT INTO reconocimientos (id,nombre,nivel,descripcion,foto_url,imagen_card_url,link_url,mes,año,ventas,created_at,lang) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)').run(r.id,r.nombre,r.nivel,r.descripcion,r.foto_url,r.imagen_card_url,r.link_url,r.mes,r.año,r.ventas,r.created_at,r.lang) } catch {}
    }
    for (const r of seedData.ranking) {
      try { db.prepare('INSERT INTO ranking (id,nombre,foto_url,nivel,ventas,posicion,mes,año,lang,created_at) VALUES (?,?,?,?,?,?,?,?,?,?)').run(r.id,r.nombre,r.foto_url,r.nivel,r.ventas,r.posicion,r.mes,r.año,r.lang,r.created_at) } catch {}
    }
    console.log('✅ Datos iniciales cargados desde seed-data.json')
  } catch (e) {
    console.error('⚠️  No se pudo cargar seed-data.json:', e.message)
  }
}

export default db
