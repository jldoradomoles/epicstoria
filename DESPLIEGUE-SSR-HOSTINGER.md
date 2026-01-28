# 🚀 Guía de Despliegue SSR en Hostinger VPS

## ⚠️ IMPORTANTE: Cambios con SSR

Ahora que la aplicación usa **Server-Side Rendering (SSR)**, el despliegue cambia completamente:

- ❌ **Ya NO puedes** usar hosting estático (GitHub Pages, Netlify, etc.)
- ✅ **Debes usar** un servidor Node.js (VPS, servidor dedicado, etc.)
- 🔄 La aplicación se ejecuta como un servidor Express en Node.js

---

## 📋 Requisitos Previos

- VPS de Hostinger con acceso SSH
- Node.js v20.x o superior
- PM2 para gestión de procesos
- Nginx como proxy inverso (recomendado)
- PostgreSQL para el backend

---

## 🎯 Arquitectura del Despliegue

```
Internet → Nginx (puerto 80/443)
              ↓
          Frontend SSR (Puerto 4000)
              ↓
          Backend API (Puerto 3000)
              ↓
          PostgreSQL
```

---

## 🔧 Paso 1: Preparar el VPS

### 1.1. Conectarse al VPS

```bash
ssh root@tu-ip-del-vps
```

### 1.2. Instalar Dependencias

```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Instalar PM2
sudo npm install -g pm2

# Instalar Nginx
sudo apt install -y nginx

# Verificar versiones
node --version  # Debe ser v20.x o superior
pm2 --version
nginx -v
```

---

## 📦 Paso 2: Subir la Aplicación

### 2.1. En tu máquina local - Compilar para producción

```bash
# Compilar frontend con SSR
npm run build:hostinger

# O si no tienes ese script, usar:
ng build --configuration hostinger
```

**Esto generará:**

- `dist/epicstoria/browser/` - Archivos del navegador
- `dist/epicstoria/server/` - Servidor SSR (server.mjs)

### 2.2. Subir archivos al VPS

**Opción A: Git (Recomendado)**

```bash
# En el VPS
cd /var/www
sudo git clone https://github.com/jldoradomoles/epicstoria.git
cd epicstoria

# Instalar dependencias
npm install --production

# Compilar en el servidor
npm run build:hostinger
```

**Opción B: SCP/FTP**

```bash
# Desde tu máquina local
scp -r dist/epicstoria root@tu-ip:/var/www/epicstoria/

# También subir node_modules necesarios
scp -r node_modules root@tu-ip:/var/www/epicstoria/
```

### 2.3. Subir Backend

```bash
# En el VPS
cd /var/www/epicstoria
cd backend

# Instalar dependencias
npm install --production

# Configurar variables de entorno
nano .env
```

**Contenido del `.env` del backend:**

```env
PORT=3000
NODE_ENV=production

# Base de datos
DB_HOST=localhost
DB_PORT=5432
DB_NAME=epicstoria_db
DB_USER=epicstoria_user
DB_PASSWORD=tu_password_seguro

# JWT
JWT_SECRET=tu_secret_jwt_muy_seguro_y_aleatorio

# Frontend URL (para CORS)
FRONTEND_URL=https://epicstoria.com
```

---

## 🚀 Paso 3: Configurar PM2

### 3.1. Crear archivo de configuración PM2

```bash
cd /var/www/epicstoria
nano ecosystem.config.js
```

**Contenido del `ecosystem.config.js`:**

```javascript
module.exports = {
  apps: [
    {
      name: 'epicstoria-frontend',
      script: 'dist/epicstoria/server/server.mjs',
      cwd: '/var/www/epicstoria',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 4000,
      },
      error_file: '/var/www/epicstoria/logs/frontend-error.log',
      out_file: '/var/www/epicstoria/logs/frontend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    },
    {
      name: 'epicstoria-backend',
      script: 'dist/index.js',
      cwd: '/var/www/epicstoria/backend',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      error_file: '/var/www/epicstoria/logs/backend-error.log',
      out_file: '/var/www/epicstoria/logs/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    },
  ],
};
```

### 3.2. Crear directorio de logs

```bash
mkdir -p /var/www/epicstoria/logs
```

### 3.3. Iniciar aplicaciones con PM2

```bash
cd /var/www/epicstoria

# Iniciar aplicaciones
pm2 start ecosystem.config.js

# Verificar estado
pm2 status

# Ver logs
pm2 logs

# Configurar PM2 para inicio automático
pm2 startup
pm2 save
```

---

## 🌐 Paso 4: Configurar Nginx

### 4.1. Crear configuración de Nginx

```bash
sudo nano /etc/nginx/sites-available/epicstoria
```

**Contenido:**

```nginx
# Frontend SSR (Puerto 4000)
server {
    listen 80;
    server_name epicstoria.com www.epicstoria.com;

    # Logs
    access_log /var/log/nginx/epicstoria-access.log;
    error_log /var/log/nginx/epicstoria-error.log;

    # Proxy al servidor SSR de Angular
    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Proxy a la API del backend
    location /api/ {
        proxy_pass http://localhost:3000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Sitemap dinámico (desde backend)
    location /sitemap.xml {
        proxy_pass http://localhost:3000/sitemap.xml;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        add_header Content-Type application/xml;
    }

    # Robots.txt (servido por frontend)
    location /robots.txt {
        proxy_pass http://localhost:4000/robots.txt;
        proxy_set_header Host $host;
    }

    # Archivos estáticos (imágenes)
    location /images/ {
        alias /var/www/epicstoria/public/images/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

### 4.2. Activar la configuración

```bash
# Crear enlace simbólico
sudo ln -s /etc/nginx/sites-available/epicstoria /etc/nginx/sites-enabled/

# Eliminar configuración por defecto (opcional)
sudo rm /etc/nginx/sites-enabled/default

# Verificar configuración
sudo nginx -t

# Recargar Nginx
sudo systemctl reload nginx
```

---

## 🔒 Paso 5: Configurar SSL con Let's Encrypt (HTTPS)

```bash
# Instalar Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtener certificado SSL
sudo certbot --nginx -d epicstoria.com -d www.epicstoria.com

# El certificado se renovará automáticamente
# Verificar renovación automática:
sudo certbot renew --dry-run
```

**Nginx se actualizará automáticamente para usar HTTPS.**

---

## 🗄️ Paso 6: Configurar PostgreSQL y Migrar Datos

```bash
# Conectarse a PostgreSQL
sudo -u postgres psql

# Crear usuario y base de datos
CREATE USER epicstoria_user WITH PASSWORD 'tu_password_seguro';
CREATE DATABASE epicstoria_db OWNER epicstoria_user;
GRANT ALL PRIVILEGES ON DATABASE epicstoria_db TO epicstoria_user;
\q

# Ejecutar migraciones desde el backend
cd /var/www/epicstoria/backend
npm run migrate

# O ejecutar el script manualmente
node -r esbuild-register src/database/migrate.ts
```

---

## 🔄 Paso 7: Configurar Cron para Limpieza de Mensajes

```bash
cd /var/www/epicstoria/backend

# Hacer ejecutable el script
chmod +x cleanup-messages.sh

# Instalar crontab
bash install-crontab.sh

# Verificar que está instalado
crontab -l
```

---

## ✅ Paso 8: Verificar Despliegue

### 8.1. Verificar que los procesos están corriendo

```bash
pm2 status
```

**Deberías ver:**

- `epicstoria-frontend` → `online` → puerto 4000
- `epicstoria-backend` → `online` → puerto 3000

### 8.2. Verificar Nginx

```bash
sudo systemctl status nginx
```

### 8.3. Probar URLs

```bash
# Frontend SSR
curl http://localhost:4000

# Backend API
curl http://localhost:3000/api/health

# Sitemap
curl http://localhost:3000/sitemap.xml

# Desde fuera (con tu dominio)
curl https://epicstoria.com
```

### 8.4. Ver logs en tiempo real

```bash
# Logs del frontend
pm2 logs epicstoria-frontend

# Logs del backend
pm2 logs epicstoria-backend

# Logs de Nginx
sudo tail -f /var/log/nginx/epicstoria-access.log
sudo tail -f /var/log/nginx/epicstoria-error.log
```

---

## 🔄 Actualizar la Aplicación

### Opción A: Con Git

```bash
cd /var/www/epicstoria

# Descargar cambios
git pull origin main

# Instalar nuevas dependencias (si hay)
npm install --production

# Recompilar frontend
npm run build:hostinger

# Recompilar backend
cd backend
npm run build

# Reiniciar PM2
pm2 restart all

# O reiniciar individualmente
pm2 restart epicstoria-frontend
pm2 restart epicstoria-backend
```

### Opción B: Manual (SCP)

```bash
# Desde tu máquina local, compilar
npm run build:hostinger

# Subir archivos
scp -r dist/epicstoria root@tu-ip:/var/www/epicstoria/

# En el VPS, reiniciar
pm2 restart epicstoria-frontend
```

---

## 📊 Comandos Útiles de PM2

```bash
# Ver estado
pm2 status

# Ver logs
pm2 logs
pm2 logs epicstoria-frontend
pm2 logs epicstoria-backend

# Reiniciar
pm2 restart all
pm2 restart epicstoria-frontend

# Detener
pm2 stop all
pm2 stop epicstoria-frontend

# Eliminar de PM2
pm2 delete all
pm2 delete epicstoria-frontend

# Ver información detallada
pm2 info epicstoria-frontend

# Monitoreo en tiempo real
pm2 monit
```

---

## 🐛 Solución de Problemas

### Problema 1: "Cannot GET /"

**Causa:** El servidor SSR no está corriendo.

**Solución:**

```bash
pm2 restart epicstoria-frontend
pm2 logs epicstoria-frontend
```

### Problema 2: API no responde

**Causa:** Backend no está corriendo o PostgreSQL no está activo.

**Solución:**

```bash
# Verificar PostgreSQL
sudo systemctl status postgresql

# Verificar backend
pm2 restart epicstoria-backend
pm2 logs epicstoria-backend
```

### Problema 3: 502 Bad Gateway

**Causa:** Nginx no puede conectarse al servidor SSR.

**Solución:**

```bash
# Verificar que el servidor SSR está corriendo
pm2 status

# Verificar que está escuchando en el puerto correcto
netstat -tulpn | grep 4000

# Revisar logs de Nginx
sudo tail -f /var/log/nginx/epicstoria-error.log
```

### Problema 4: Imágenes no se cargan

**Causa:** Permisos incorrectos o ruta incorrecta.

**Solución:**

```bash
# Verificar permisos
sudo chmod -R 755 /var/www/epicstoria/public/images

# Verificar propiedad
sudo chown -R www-data:www-data /var/www/epicstoria/public/images
```

---

## 📈 Monitoreo y Logs

### Logs de PM2

```bash
# Ver todos los logs
pm2 logs

# Limpiar logs antiguos
pm2 flush

# Ver logs guardados
cat /var/www/epicstoria/logs/frontend-out.log
cat /var/www/epicstoria/logs/backend-error.log
```

### Logs de Nginx

```bash
# Access logs
sudo tail -f /var/log/nginx/epicstoria-access.log

# Error logs
sudo tail -f /var/log/nginx/epicstoria-error.log
```

### Monitoreo de recursos

```bash
# Uso de CPU y memoria
pm2 monit

# Uso del sistema
htop
```

---

## 🔐 Seguridad

### Firewall (UFW)

```bash
# Habilitar firewall
sudo ufw enable

# Permitir SSH
sudo ufw allow 22/tcp

# Permitir HTTP y HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Verificar estado
sudo ufw status
```

### Asegurar PostgreSQL

```bash
# Editar configuración
sudo nano /etc/postgresql/*/main/pg_hba.conf

# Asegurarse que solo localhost puede conectarse
# local   all             all                                     peer
# host    all             all             127.0.0.1/32            md5
```

---

## ✅ Checklist de Despliegue

- [ ] VPS configurado con Node.js, PM2, Nginx
- [ ] PostgreSQL instalado y configurado
- [ ] Código compilado con `npm run build:hostinger`
- [ ] Archivos subidos al VPS
- [ ] Variables de entorno configuradas (.env)
- [ ] PM2 configurado con `ecosystem.config.js`
- [ ] Aplicaciones iniciadas con `pm2 start`
- [ ] Nginx configurado como proxy inverso
- [ ] SSL configurado con Let's Encrypt
- [ ] Base de datos migrada
- [ ] Cron de limpieza de mensajes configurado
- [ ] Sitemap.xml accesible
- [ ] robots.txt accesible
- [ ] PM2 configurado para inicio automático
- [ ] Pruebas completas funcionando

---

## 📞 Recursos Adicionales

- [Documentación PM2](https://pm2.keymetrics.io/)
- [Nginx Server Blocks](https://nginx.org/en/docs/)
- [Let's Encrypt Certbot](https://certbot.eff.org/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

---

**¡Tu aplicación SSR está lista para producción! 🚀**
