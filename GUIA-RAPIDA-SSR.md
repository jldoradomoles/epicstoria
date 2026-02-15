# ⚡ Guía Rápida: Despliegue SSR en Hostinger

## 🎯 Resumen

Con SSR, tu aplicación Angular se ejecuta como un **servidor Node.js** que renderiza HTML en el servidor antes de enviarlo al navegador.

---

## 📋 Checklist Paso a Paso

### 1️⃣ Preparar tu Máquina Local

```bash
# Compilar para producción
npm run build:hostinger

# Verificar que se generó correctamente
ls dist/epicstoria/server/server.mjs  # Debe existir
```

### 2️⃣ En el VPS - Preparación Inicial (Solo una vez)

```bash
# Conectarse
ssh root@tu-ip-vps

# Instalar dependencias
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs nginx
sudo npm install -g pm2

# Clonar repositorio
cd /var/www
git clone https://github.com/jldoradomoles/epicstoria.git
cd epicstoria

# Instalar dependencias
npm install --production
cd backend && npm install --production
```

### 3️⃣ Configurar Variables de Entorno

```bash
# Frontend - No necesita .env

# Backend
cd /var/www/epicstoria/backend
nano .env
```

```env
PORT=3000
NODE_ENV=production
DB_HOST=localhost
DB_PORT=5432
DB_NAME=epicstoria_db
DB_USER=epicstoria_user
DB_PASSWORD=tu_password_seguro
JWT_SECRET=tu_secret_muy_seguro
FRONTEND_URL=https://epicstoria.es
```

### 4️⃣ Configurar PostgreSQL

```bash
sudo -u postgres psql

CREATE USER epicstoria_user WITH PASSWORD 'tu_password';
CREATE DATABASE epicstoria_db OWNER epicstoria_user;
GRANT ALL PRIVILEGES ON DATABASE epicstoria_db TO epicstoria_user;
\q

# Migrar base de datos
cd /var/www/epicstoria/backend
npm run migrate
```

### 5️⃣ Iniciar con PM2

```bash
cd /var/www/epicstoria

# Compilar si no lo hiciste localmente
npm run build:hostinger
cd backend && npm run build && cd ..

# Crear directorio de logs
mkdir -p logs

# Iniciar con PM2
pm2 start ecosystem.config.js

# Verificar
pm2 status

# Configurar inicio automático
pm2 startup
pm2 save
```

### 6️⃣ Configurar Nginx

```bash
sudo nano /etc/nginx/sites-available/epicstoria
```

**Pega esta configuración:**

```nginx
server {
    listen 80;
    server_name epicstoria.es www.epicstoria.es;

    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api/ {
        proxy_pass http://localhost:3000/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }

    location /sitemap.xml {
        proxy_pass http://localhost:3000/sitemap.xml;
    }

    location /images/ {
        alias /var/www/epicstoria/public/images/;
        expires 30d;
    }
}
```

```bash
# Activar configuración
sudo ln -s /etc/nginx/sites-available/epicstoria /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 7️⃣ Configurar SSL (HTTPS)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d epicstoria.es -d www.epicstoria.es
```

### 8️⃣ Verificar que Todo Funciona

```bash
# Estado de PM2
pm2 status
# Debe mostrar frontend y backend en "online"

# Probar URLs
curl http://localhost:4000  # Frontend SSR
curl http://localhost:3000/api/health  # Backend
curl https://epicstoria.es  # Público
```

---

## 🔄 Actualizar la Aplicación

```bash
cd /var/www/epicstoria

# Descargar cambios
git pull origin main

# Recompilar
npm run build:hostinger
cd backend && npm run build && cd ..

# Reiniciar
pm2 restart all
```

---

## 🐛 Problemas Comunes

| Problema           | Solución                                              |
| ------------------ | ----------------------------------------------------- |
| "Cannot GET /"     | `pm2 restart epicstoria-frontend`                     |
| 502 Bad Gateway    | Verificar que PM2 está corriendo: `pm2 status`        |
| API no responde    | `pm2 restart epicstoria-backend`                      |
| Imágenes no cargan | `sudo chmod -R 755 /var/www/epicstoria/public/images` |

---

## 📝 Comandos Útiles

```bash
# Ver logs en tiempo real
pm2 logs

# Ver logs del frontend
pm2 logs epicstoria-frontend

# Ver estado
pm2 status

# Reiniciar todo
pm2 restart all

# Monitoreo
pm2 monit

# Limpiar logs
pm2 flush
```

---

## ✅ Resultado Final

Tu aplicación estará disponible en:

- **Frontend**: https://epicstoria.es (SSR en puerto 4000)
- **API**: https://epicstoria.es/api/* (Backend en puerto 3000)
- **Sitemap**: https://epicstoria.es/sitemap.xml
- **Robots**: https://epicstoria.es/robots.txt

---

**📖 Para la guía completa con detalles:** Ver [DESPLIEGUE-SSR-HOSTINGER.md](./DESPLIEGUE-SSR-HOSTINGER.md)
