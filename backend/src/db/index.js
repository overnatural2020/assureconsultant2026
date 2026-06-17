// src/db/index.js
import Database from 'better-sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../../data/assure.db')

// Ensure data directory exists
import fs from 'fs'
const dataDir = path.dirname(DB_PATH)
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true })

const db = new Database(DB_PATH)
db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

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
`)

db.exec(`
  CREATE TABLE IF NOT EXISTS admin_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    nombre TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'editor',
    activo INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now'))
  );
`)

db.exec(`
  CREATE TABLE IF NOT EXISTS ranking (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    foto_url TEXT,
    nivel TEXT,
    ventas REAL,
    posicion INTEGER,
    mes TEXT,
    año INTEGER,
    created_at TEXT DEFAULT (datetime('now'))
  );
`)

db.exec(`
  CREATE TABLE IF NOT EXISTS config_anthropic (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    api_key TEXT,
    updated_at TEXT DEFAULT (datetime('now'))
  );
`)

db.exec(`
  CREATE TABLE IF NOT EXISTS translations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lang TEXT NOT NULL,
    key TEXT NOT NULL,
    value TEXT NOT NULL,
    updated_at TEXT DEFAULT (datetime('now')),
    UNIQUE(lang, key)
  );
`)

// Migrations
;[
  "ALTER TABLE reconocimientos ADD COLUMN imagen_card_url TEXT",
  "ALTER TABLE reconocimientos ADD COLUMN link_url TEXT",
  "ALTER TABLE config_jwt ADD COLUMN admin_secret TEXT",
  "ALTER TABLE noticias ADD COLUMN lang TEXT DEFAULT 'all'",
  "ALTER TABLE recursos ADD COLUMN lang TEXT DEFAULT 'all'",
  "ALTER TABLE reconocimientos ADD COLUMN lang TEXT DEFAULT 'all'",
  "ALTER TABLE ranking ADD COLUMN lang TEXT DEFAULT 'all'",
  "ALTER TABLE config_popup ADD COLUMN lang TEXT DEFAULT 'all'",
  "ALTER TABLE recursos ADD COLUMN fecha TEXT",
].forEach(sql => { try { db.exec(sql) } catch {} })

// Insert default JWT config if empty
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

// Seed initial super_admin if no admin users exist
const adminCount = db.prepare('SELECT COUNT(*) as n FROM admin_users').get()
if (adminCount.n === 0) {
  const hash = bcrypt.hashSync('Admin1234!', 10)
  db.prepare(`INSERT INTO admin_users (username, nombre, password_hash, role) VALUES ('admin', 'Administrador', ?, 'super_admin')`).run(hash)
  console.log('\n✅ Usuario admin inicial creado: username=admin, password=Admin1234!\n   ⚠️  Cambia la contraseña desde el panel de administración.\n')
}

export default db
