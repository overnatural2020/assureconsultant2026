# 🚀 Guía de Despliegue — Assure For Life Consultant
## DigitalOcean Droplet (Ubuntu 22.04)

---

## PASO 1 — Crear el Droplet

1. Ve a digitalocean.com → Create → Droplets
2. Selecciona:
   - **Image**: Ubuntu 22.04 LTS
   - **Plan**: Basic → $6/mes (1 GB RAM, 1 vCPU)
   - **Region**: New York o Miami (más cerca de tus usuarios)
   - **Authentication**: SSH Key (recomendado) o Password
3. Crea el droplet y anota la IP (ej: `123.45.67.89`)

---

## PASO 2 — Conectarte al servidor

```bash
ssh root@123.45.67.89
```

---

## PASO 3 — Instalar dependencias en el servidor

```bash
# Actualizar sistema
apt update && apt upgrade -y

# Instalar Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Instalar PM2 (para mantener el servidor corriendo)
npm install -g pm2

# Instalar Nginx (proxy reverso)
apt install -y nginx

# Verificar instalaciones
node --version   # debe mostrar v20.x
npm --version
nginx -v
```

---

## PASO 4 — Subir el código

Desde tu computadora local, crea un archivo ZIP del proyecto y súbelo:

```bash
# En tu computadora local
zip -r assure-consultant.zip assure/

# Subir al servidor
scp assure-consultant.zip root@123.45.67.89:/var/www/
```

O usa Git si tienes el proyecto en GitHub:
```bash
# En el servidor
cd /var/www
git clone https://github.com/TU_USUARIO/assure-consultant.git
```

---

## PASO 5 — Instalar dependencias y compilar

```bash
# En el servidor
cd /var/www/assure

# Backend
cd backend
npm install
cp .env.example .env
# Edita el .env con tus valores
nano .env

# Frontend — compilar para producción
cd ../frontend
npm install
npm run build
```

---

## PASO 6 — Iniciar el backend con PM2

```bash
cd /var/www/assure/backend

# Iniciar
pm2 start src/index.js --name assure-backend

# Guardar para que reinicie automáticamente al rebotar
pm2 save
pm2 startup

# Ver logs
pm2 logs assure-backend
```

---

## PASO 7 — Configurar Nginx

```bash
nano /etc/nginx/sites-available/assure
```

Pega esto (reemplaza `TU_DOMINIO.com` con tu dominio real):

```nginx
server {
    listen 80;
    server_name TU_DOMINIO.com www.TU_DOMINIO.com;

    # Frontend (archivos estáticos compilados)
    root /var/www/assure/frontend/dist;
    index index.html;

    # Rutas del API van al backend Node.js
    location /api/ {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # SPA routing — todas las rutas van al index.html
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

```bash
# Activar el sitio
ln -s /etc/nginx/sites-available/assure /etc/nginx/sites-enabled/
nginx -t   # verificar que no hay errores
systemctl restart nginx
```

---

## PASO 8 — Apuntar tu dominio

En tu proveedor de dominio (GoDaddy, Namecheap, etc.):
- Crea un registro **A** que apunte a la IP del Droplet
- `@` → `123.45.67.89`
- `www` → `123.45.67.89`

Espera 5-30 minutos para que se propague.

---

## PASO 9 — Certificado SSL (HTTPS) — GRATIS

```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d TU_DOMINIO.com -d www.TU_DOMINIO.com
```

Sigue las instrucciones. Certbot configura HTTPS automáticamente. ✅

---

## PASO 10 — Configurar JWT desde el Admin

1. Abre tu sitio en `https://TU_DOMINIO.com/?token=TU_JWT_DE_ADMIN`
   - El JWT de admin debe tener `"role": "admin"` en el payload
2. Ve a **Admin → Configuración JWT**
3. Activa el JWT, ingresa tu secret, guarda
4. Desde ahora, todos los usuarios necesitan venir con `?token=JWT_VÁLIDO`

---

## Estructura del JWT que debes enviar desde tu plataforma

```json
{
  "consultantWebPath": "/assure-for-life-consultant",
  "nombre": "John Doe",
  "telefono": "1234567890",
  "username": "johndoe",
  "realEmail": "john@example.com",
  "nivel": "Consultor Senior",
  "role": "consultant"
}
```

Para el admin:
```json
{
  "nombre": "Admin",
  "role": "admin"
}
```

Firmado con tu JWT secret usando HS256.

---

## Comandos útiles

```bash
# Ver estado del backend
pm2 status

# Ver logs en tiempo real
pm2 logs assure-backend --lines 50

# Reiniciar backend (después de cambios)
pm2 restart assure-backend

# Ver logs de Nginx
tail -f /var/nginx/access.log
tail -f /var/nginx/error.log

# Actualizar el sitio después de cambios
cd /var/www/assure/frontend && npm run build
pm2 restart assure-backend
```

---

## Costo estimado mensual

| Servicio | Costo |
|---|---|
| Droplet $6/mes | $6 |
| SSL (Certbot) | $0 |
| Dominio (si ya tienes) | $0 |
| **Total** | **$6/mes** |

---

## Soporte

Si tienes algún problema durante el despliegue, los errores más comunes son:
1. **Puerto 4000 bloqueado** → `ufw allow 4000` (solo para debug)
2. **Nginx no arranca** → `nginx -t` para ver el error
3. **PM2 no guarda** → corre `pm2 startup` y ejecuta el comando que te da
