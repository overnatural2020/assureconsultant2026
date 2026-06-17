# Assure For Life Consultant — Portal

Portal web para consultores de Assure For Life con autenticación JWT, gestión de contenido, foro comunitario, reconocimientos y más.

## Estructura del Proyecto

```
assure/
├── frontend/          # React + Vite + Tailwind CSS
│   ├── src/
│   │   ├── pages/         # Páginas públicas y de admin
│   │   ├── components/    # Componentes reutilizables
│   │   ├── lib/           # Auth, API client
│   │   └── i18n/          # Traducciones ES/EN
│   └── package.json
├── backend/           # Node.js + Express + SQLite
│   ├── src/
│   │   ├── routes/        # API endpoints
│   │   ├── middleware/     # JWT auth
│   │   └── db/            # SQLite schema
│   └── package.json
└── DEPLOY.md          # Guía de despliegue en DigitalOcean
```

## Páginas incluidas

**Públicas (requieren JWT):**
- `/inicio` — Home con bienvenida personalizada
- `/noticias` — Listado de noticias
- `/noticias/:id` — Detalle de noticia
- `/recursos` — Recursos y materiales
- `/membresias` — Planes de membresía
- `/comunidad` — Reconocimientos + Foro
- `/faqs` — Preguntas frecuentes (19 preguntas en ES/EN)
- `/ranking-consultores` — Ranking

**Admin (requieren JWT con role=admin):**
- `/paneladmin` — Panel principal
- `/admin/noticias` — Gestión de noticias
- `/admin/reconocimientos` — Gestión de reconocimientos
- `/admin/jwt` — Configuración JWT

## Desarrollo local

```bash
# Backend
cd backend
npm install
cp .env.example .env
npm run dev

# Frontend (en otra terminal)
cd frontend
npm install
npm run dev
```

## Despliegue

Ver `DEPLOY.md` para instrucciones completas de DigitalOcean.

## Flujo JWT

1. Usuario llega desde plataforma externa con `?token=JWT`
2. Frontend envía el token al backend para validación
3. Backend verifica con el secret configurado en `/admin/jwt`
4. Si válido, el token se guarda en `sessionStorage`
5. Todas las llamadas API incluyen el token como `Bearer`

## Idiomas

El sitio soporta **Español** e **Inglés** con toggle en la navbar. Las FAQs están pre-cargadas en ambos idiomas.
