# Guía de Despliegue en Hostinger VPS

Esta guía te ayudará a desplegar Epicstoria (frontend Angular + backend Node.js) en un VPS de Hostinger.

## 📋 Requisitos Previos

- VPS de Hostinger contratado
- Acceso SSH al VPS
- Dominio apuntando al VPS (opcional pero recomendado)
- Cliente SSH (PuTTY en Windows o terminal en Mac/Linux)

## 🔧 Paso 1: Configuración Inicial del VPS

### 1.1. Conectarse al VPS

```bash
ssh root@tu-ip-del-vps
# O si tienes un usuario específico:
ssh usuario@tu-ip-del-vps
```

### 1.2. Actualizar el Sistema

```bash
sudo apt update
sudo apt upgrade -y
```

### 1.3. Instalar Node.js (v20.x LTS)

```bash
# Instalar Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verificar instalación
node --version
npm --version
```

### 1.4. Instalar PostgreSQL

```bash
# Instalar PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Iniciar servicio
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Verificar instalación
sudo systemctl status postgresql
```

### 1.5. Instalar Nginx

```bash
# Instalar Nginx
sudo apt install -y nginx

# Iniciar y habilitar Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Verificar instalación
sudo systemctl status nginx
```

### 1.6. Instalar PM2 (Gestor de procesos Node.js)

```bash
sudo npm install -g pm2
```

### 1.7. Instalar Git

```bash
sudo apt install -y git
```

## 🗄️ Paso 2: Configurar PostgreSQL

### 2.1. Crear Usuario y Base de Datos

```bash
# Acceder a PostgreSQL
sudo -u postgres psql

# Dentro de PostgreSQL, ejecutar:
CREATE USER epicstoria_user WITH PASSWORD 'tu_password_seguro';
CREATE DATABASE epicstoria_db OWNER epicstoria_user;
GRANT ALL PRIVILEGES ON DATABASE epicstoria_db TO epicstoria_user;

# Salir de PostgreSQL
\q
```

### 2.2. Configurar Acceso Remoto (si es necesario)

```bash
# Editar configuración de PostgreSQL
sudo nano /etc/postgresql/[version]/main/postgresql.conf

# Buscar y descomentar/modificar:
listen_addresses = 'localhost'

# Editar pg_hba.conf
sudo nano /etc/postgresql/[version]/main/pg_hba.conf

# Añadir al final:
local   all             epicstoria_user                                 md5

# Reiniciar PostgreSQL
sudo systemctl restart postgresql
```

## 📦 Paso 3: Desplegar el Backend

### 3.1. Clonar el Repositorio

```bash
# Crear directorio para la aplicación
sudo mkdir -p /var/www/epicstoria
sudo chown -R $USER:$USER /var/www/epicstoria
cd /var/www/epicstoria

# Clonar repositorio
git clone https://github.com/jldoradomoles/epicstoria.git .
# O si usas autenticación:
git clone https://<token>@github.com/jldoradomoles/epicstoria.git .
```

### 3.2. Configurar Variables de Entorno del Backend

```bash
cd /var/www/epicstoria/backend

# Crear archivo .env
nano .env
```

Contenido del archivo `.env`:

```env
# Server
PORT=3000
NODE_ENV=production

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=epicstoria_db
DB_USER=epicstoria_user
DB_PASSWORD=tu_password_seguro

# JWT
JWT_SECRET=tu_jwt_secret_muy_seguro_generado_aleatoriamente

# Frontend URL (tu dominio)
FRONTEND_URL=https://tudominio.com
```

### 3.3. Configurar Environment del Frontend para Hostinger

```bash
cd /var/www/epicstoria

# Editar environment.hostinger.ts
nano src/environments/environment.hostinger.ts
```

Contenido:

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://tudominio.com/api', // Tu dominio real
  useStaticData: false, // En Hostinger usamos backend completo
};
```

### 3.4. Instalar Dependencias y Compilar Backend

```bash
cd /var/www/epicstoria/backend

# Instalar dependencias
npm install

# Compilar TypeScript
npm run build
```

### 3.5. Inicializar Base de Datos

```bash
# Ejecutar migraciones
npm run db:migrate

# Poblar con datos iniciales (incluye usuarios admin)
npm run db:seed
```

**Nota:** Los usuarios admin creados son:

- Email: `admin@epicstoria.com` - Password: `Admin@Secure#2026!$gHI`
- Email: `superadmin@epicstoria.com` - Password: `SuperAdmin@Secure#2026!$gHI`

**⚠️ IMPORTANTE:** Cambia estas contraseñas después del primer login.

### 3.6. Iniciar Backend con PM2

```bash
# Iniciar aplicación
pm2 start dist/index.js --name epicstoria-backend

# Configurar PM2 para inicio automático
pm2 startup
pm2 save

# Ver logs
pm2 logs epicstoria-backend

# Ver estado
pm2 status
```

## 🎨 Paso 4: Desplegar el Frontend

### 4.1. Compilar Frontend para Hostinger

```bash
cd /var/www/epicstoria

# Instalar dependencias
npm install

# Compilar con configuración de Hostinger
npm run build:hostinger
```

**Nota:** El comando `build:hostinger` usa `environment.hostinger.ts` que tiene:

- `useStaticData: false` (usa backend completo)
- `apiUrl` apuntando a tu dominio

### 4.2. Verificar Build

```bash
# El frontend compilado estará en:
ls -la dist/epicstoria/browser/

# Debería contener archivos HTML, JS, CSS e imágenes
```

```bash
cd /var/www/epicstoria

# Instalar dependencias
npm install

# Compilar para producción
npm run build -- --configuration production
```

Los archivos compilados estarán en `dist/epicstoria/browser/`.

## 🌐 Paso 5: Configurar Nginx

### 5.1. Crear Configuración de Nginx

```bash
sudo nano /etc/nginx/sites-available/epicstoria
```

Contenido del archivo:

```nginx
# Configuración para Epicstoria
server {
    listen 80;
    server_name tudominio.com www.tudominio.com;

    # Redirigir HTTP a HTTPS (después de configurar SSL)
    # return 301 https://$server_name$request_uri;

    # Frontend Angular
    root /var/www/epicstoria/dist/epicstoria/browser;
    index index.html;

    # Configuración para Angular (SPA)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API Backend (proxy a Node.js)
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Servir imágenes estáticas
    location /images {
        alias /var/www/epicstoria/public/images;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Configuración de tamaño máximo de archivos
    client_max_body_size 10M;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript
               application/x-javascript application/xml+rss
               application/javascript application/json;
}
```

### 5.2. Activar Configuración

```bash
# Crear enlace simbólico
sudo ln -s /etc/nginx/sites-available/epicstoria /etc/nginx/sites-enabled/

# Eliminar configuración por defecto si existe
sudo rm /etc/nginx/sites-enabled/default

# Verificar configuración
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
```

## 🔒 Paso 6: Configurar SSL con Let's Encrypt (HTTPS)

### 6.1. Instalar Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 6.2. Obtener Certificado SSL

```bash
# Obtener certificado (reemplaza con tu dominio)
sudo certbot --nginx -d tudominio.com -d www.tudominio.com

# Seguir las instrucciones en pantalla
# Certbot configurará automáticamente Nginx para usar HTTPS
```

### 6.3. Renovación Automática

```bash
# Verificar renovación automática
sudo certbot renew --dry-run

# Certbot creará un cron job automático para renovar
```

## 🔥 Paso 7: Configurar Firewall (UFW)

```bash
# Habilitar UFW
sudo ufw enable

# Permitir SSH
sudo ufw allow ssh
sudo ufw allow 22/tcp

# Permitir HTTP y HTTPS
sudo ufw allow 'Nginx Full'
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Ver estado
sudo ufw status
```

## 📝 Paso 8: Crear Directorio para Imágenes

```bash
# Crear directorio para imágenes de eventos
mkdir -p /var/www/epicstoria/public/images/eventos

# Dar permisos apropiados
sudo chown -R www-data:www-data /var/www/epicstoria/public/images
sudo chmod -R 755 /var/www/epicstoria/public/images
```

## 🔄 Paso 9: Actualizar la Aplicación

Para futuras actualizaciones:

```bash
# Detener backend
pm2 stop epicstoria-backend

# Actualizar código
cd /var/www/epicstoria
git pull origin main

# Backend
cd backend
npm install
npm run build
npm run db:migrate  # Si hay cambios en la base de datos

# Frontend
cd ..
npm install
npm run build -- --configuration production

# Reiniciar servicios
pm2 restart epicstoria-backend
sudo systemctl reload nginx
```

## 🛠️ Comandos Útiles

### PM2

```bash
# Ver logs del backend
pm2 logs epicstoria-backend

# Reiniciar backend
pm2 restart epicstoria-backend

# Detener backend
pm2 stop epicstoria-backend

# Monitorear recursos
pm2 monit

# Ver información
pm2 info epicstoria-backend
```

### Nginx

```bash
# Verificar configuración
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx

# Recargar configuración sin downtime
sudo systemctl reload nginx

# Ver logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### PostgreSQL

```bash
# Acceder a la base de datos
sudo -u postgres psql -d epicstoria_db

# Backup de base de datos
pg_dump -U epicstoria_user epicstoria_db > backup.sql

# Restaurar backup
psql -U epicstoria_user epicstoria_db < backup.sql
```

## 🔍 Resolución de Problemas

### Backend no inicia

```bash
# Ver logs de PM2
pm2 logs epicstoria-backend

# Verificar variables de entorno
cat /var/www/epicstoria/backend/.env

# Verificar conexión a PostgreSQL
sudo -u postgres psql -c "\l"
```

### Frontend no carga

```bash
# Verificar archivos compilados
ls -la /var/www/epicstoria/dist/epicstoria/browser/

# Ver logs de Nginx
sudo tail -f /var/log/nginx/error.log

# Verificar configuración de Nginx
sudo nginx -t
```

### Error de permisos en subida de imágenes

```bash
# Dar permisos al directorio de imágenes
sudo chown -R www-data:www-data /var/www/epicstoria/public/images
sudo chmod -R 755 /var/www/epicstoria/public/images
```

### Base de datos no responde

```bash
# Verificar estado de PostgreSQL
sudo systemctl status postgresql

# Reiniciar PostgreSQL
sudo systemctl restart postgresql

# Ver logs
sudo tail -f /var/log/postgresql/postgresql-[version]-main.log
```

## 📊 Monitoreo y Mantenimiento

### Configurar Backups Automáticos

```bash
# Crear script de backup
sudo nano /usr/local/bin/backup-epicstoria.sh
```

Contenido del script:

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/epicstoria"

# Crear directorio si no existe
mkdir -p $BACKUP_DIR

# Backup de base de datos
pg_dump -U epicstoria_user epicstoria_db > $BACKUP_DIR/db_$DATE.sql

# Backup de imágenes
tar -czf $BACKUP_DIR/images_$DATE.tar.gz /var/www/epicstoria/public/images

# Eliminar backups antiguos (más de 7 días)
find $BACKUP_DIR -type f -mtime +7 -delete

echo "Backup completado: $DATE"
```

```bash
# Dar permisos de ejecución
sudo chmod +x /usr/local/bin/backup-epicstoria.sh

# Crear cron job para backup diario a las 2 AM
sudo crontab -e

# Añadir:
0 2 * * * /usr/local/bin/backup-epicstoria.sh >> /var/log/backup-epicstoria.log 2>&1
```

## 🎉 ¡Listo!

Tu aplicación Epicstoria ahora está desplegada en Hostinger VPS y accesible en tu dominio.

### URLs Importantes

- **Frontend:** https://tudominio.com
- **API:** https://tudominio.com/api
- **Login Admin:** https://tudominio.com/login

### Credenciales Iniciales

- **Email:** admin@epicstoria.com
- **Password:** Admin@Secure#2026!$gHI

**⚠️ Cambia la contraseña inmediatamente después del primer login.**

## 📚 Recursos Adicionales

- [Documentación de Hostinger VPS](https://www.hostinger.es/tutoriales/vps)
- [Documentación de Nginx](https://nginx.org/en/docs/)
- [Documentación de PM2](https://pm2.keymetrics.io/docs/usage/quick-start/)
- [Documentación de PostgreSQL](https://www.postgresql.org/docs/)
- [Let's Encrypt](https://letsencrypt.org/)

---

**Nota:** Esta guía asume que estás usando Ubuntu 20.04/22.04 en tu VPS de Hostinger. Si usas otra distribución, algunos comandos pueden variar.
