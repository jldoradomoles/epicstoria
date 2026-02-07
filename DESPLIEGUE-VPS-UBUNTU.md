# 🚀 Guía Completa de Despliegue en VPS Ubuntu (IONOS)

Esta guía te llevará paso a paso desde cero hasta tener Epicstoria funcionando en un VPS Ubuntu de IONOS.

## 📋 Requisitos Previos

- VPS con Ubuntu 20.04 o 22.04 LTS
- Acceso SSH (usuario root o con sudo)
- Dominio configurado (opcional pero recomendado)

---

## PARTE 1: CONFIGURACIÓN INICIAL DEL SERVIDOR

### 1.1 Conectarse al VPS por SSH

```bash
ssh root@tu-ip-del-vps
# o si tienes un usuario no-root:
ssh tu-usuario@tu-ip-del-vps
```

### 1.2 Actualizar el Sistema

```bash
sudo apt update
sudo apt upgrade -y
```

### 1.3 Crear Usuario para la Aplicación (Recomendado)

```bash
# Crear usuario
sudo adduser epicstoria

# Darle privilegios sudo
sudo usermod -aG sudo epicstoria

# Cambiar a ese usuario
su - epicstoria
```

---

## PARTE 2: INSTALAR SOFTWARE NECESARIO

### 2.1 Instalar Node.js 20.x

```bash
# Instalar curl si no está
sudo apt install -y curl

# Agregar repositorio de NodeSource para Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Instalar Node.js
sudo apt install -y nodejs

# Verificar instalación
node --version  # Debe mostrar v20.x.x
npm --version   # Debe mostrar 10.x.x
```

### 2.2 Instalar PostgreSQL

```bash
# Instalar PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Verificar que está corriendo
sudo systemctl status postgresql

# Habilitar que inicie automáticamente
sudo systemctl enable postgresql
```

### 2.3 Instalar PM2 (Gestor de Procesos)

```bash
sudo npm install -g pm2
```

### 2.4 Instalar Nginx (Servidor Web/Proxy)

```bash
sudo apt install -y nginx

# Iniciar y habilitar Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 2.5 Instalar Git

```bash
sudo apt install -y git
```

---

## PARTE 3: CONFIGURAR POSTGRESQL

### 3.1 Crear Base de Datos y Usuario

```bash
# Entrar a PostgreSQL
sudo -u postgres psql

# En el prompt de PostgreSQL, ejecutar:
CREATE DATABASE epicstoria;
CREATE USER epicstoria_user WITH PASSWORD 'TuPasswordSegura123!';
GRANT ALL PRIVILEGES ON DATABASE epicstoria TO epicstoria_user;

# Dar permisos al schema public (PostgreSQL 15+)
\c epicstoria
GRANT ALL ON SCHEMA public TO epicstoria_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO epicstoria_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO epicstoria_user;

# Salir
\q
```

### 3.2 Configurar Acceso a PostgreSQL

```bash
# Editar archivo de configuración
sudo nano /etc/postgresql/*/main/pg_hba.conf

# Cambiar la línea (si existe):
# local   all             all                                     peer
# Por:
local   all             all                                     md5

# Reiniciar PostgreSQL
sudo systemctl restart postgresql
```

---

## PARTE 4: CLONAR Y CONFIGURAR LA APLICACIÓN

### 4.1 Clonar el Repositorio

```bash
cd ~
git clone https://github.com/jldoradomoles/epicstoria.git
cd epicstoria
```

### 4.2 Configurar Variables de Entorno del Backend

```bash
cd backend
cp .env.example .env
nano .env
```

Edita el archivo `.env` con tus datos:

```env
# Server
PORT=3000
NODE_ENV=production

# Frontend URL
FRONTEND_URL=https://tu-dominio.com

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=epicstoria
DB_USER=epicstoria_user
DB_PASSWORD=TuPasswordSegura123!

# JWT
JWT_SECRET=fjdskldJFK45D41+*-k5d45f4JKDCJ
JWT_EXPIRES_IN=7d

# Email Configuration (IONOS)
EMAIL_HOST=smtp.ionos.es
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=noreply@tu-dominio.com
EMAIL_PASSWORD=tu-contraseña-del-email-ionos
```

**⚠️ Importante**:

- Cambia `JWT_SECRET` por una clave aleatoria larga (puedes generar una con: `openssl rand -base64 32`)
- Configura tus credenciales de email (sigue la sección 4.2.1 a continuación)

### 4.2.1 Configuración de Email (IMPORTANTE)

El sistema de notificaciones por email requiere configuración adicional.

#### **Opción A: Email de IONOS (RECOMENDADO - Incluido en tu hosting)**

Si tienes una cuenta de email con IONOS (ej: `contacto@tu-dominio.com`), esta es la mejor opción porque está incluida en tu plan.

1. **Obtener credenciales de email de IONOS:**

   ```
   1. Inicia sesión en el Panel de Control de IONOS
   2. Ve a "Email" → "Direcciones de Email"
   3. Busca o crea una cuenta de email (ej: noreply@tu-dominio.com)
   4. Anota la contraseña (o créala si es nueva)
   ```

2. **Configurar en `.env`:**

   ```env
   # Email con IONOS
   EMAIL_HOST=smtp.ionos.es
   EMAIL_PORT=587
   EMAIL_SECURE=false
   EMAIL_USER=noreply@tu-dominio.com
   EMAIL_PASSWORD=tu-contraseña-del-email-ionos
   ```

   **Alternativa con SSL (puerto 465):**

   ```env
   EMAIL_HOST=smtp.ionos.es
   EMAIL_PORT=465
   EMAIL_SECURE=true
   EMAIL_USER=noreply@tu-dominio.com
   EMAIL_PASSWORD=tu-contraseña-del-email-ionos
   ```

3. **Configuración de IONOS SMTP:**
   - ✅ **Servidor SMTP**: `smtp.ionos.es` (España) o `smtp.ionos.com` (Internacional)
   - ✅ **Puerto TLS (Recomendado)**: `587` con `EMAIL_SECURE=false`
   - ✅ **Puerto SSL**: `465` con `EMAIL_SECURE=true`
   - ✅ **Autenticación**: Requerida (usa el email completo como usuario)
   - ✅ **Límite de envío**: ~500 emails/día (según plan)

**⚠️ Notas importantes sobre IONOS Email:**

- Usa un email específico para la app (ej: `noreply@tu-dominio.com`)
- El dominio del email debe estar registrado/gestionado en IONOS
- IONOS requiere el **email completo** como usuario (no solo el nombre)
- Si tu dominio es nuevo, espera 24-48h para propagación DNS
- IONOS configura automáticamente SPF, DKIM y otros registros

#### **Opción B: Gmail (Para desarrollo/pruebas)**

1. **Crear una Contraseña de Aplicación de Gmail:**

   ```
   1. Ve a https://myaccount.google.com/
   2. Seguridad → Verificación en dos pasos (actívala si no lo está)
   3. Seguridad → Contraseñas de aplicaciones
   4. Selecciona "Correo" y "Otro dispositivo"
   5. Copia la contraseña de 16 caracteres generada
   ```

2. **Configurar en `.env`:**
   ```env
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_SECURE=false
   EMAIL_USER=tu-email@gmail.com
   EMAIL_PASSWORD=la-contraseña-de-16-caracteres-sin-espacios
   ```

⚠️ **Límites de Gmail**: 500 emails/día. No recomendado para producción con mucho tráfico.

#### **Opción B: SendGrid (Para producción - RECOMENDADO)**

SendGrid ofrece **100 emails/día gratis** y es más confiable para producción.

1. **Crear cuenta en SendGrid:**

   ```
   1. Regístrate en https://sendgrid.com/
   2. Verifica tu email
   3. Ve a Settings → API Keys
   4. Crea una nueva API Key con permisos de "Mail Send"
   5. Copia la API Key (solo se muestra una vez)
   ```

2. **Configurar en `.env`:**

   ```env
   EMAIL_HOST=smtp.sendgrid.net
   EMAIL_PORT=587
   EMAIL_SECURE=false
   EMAIL_USER=apikey
   EMAIL_PASSWORD=TU_API_KEY_DE_SENDGRID
   ```

3. **Verificar dominio de envío (Recomendado):**
   ```
   1. En SendGrid: Settings → Sender Authentication
   2. Verifica tu dominio para mejor deliverability
   3. O al menos verifica un email individual (Single Sender Verification)
   ```

#### **Opción C: Mailgun (Alternativa para producción)**

1. **Crear cuenta en Mailgun:**

   ```
   1. Regístrate en https://www.mailgun.com/
   2. Ve a Sending → Domain Settings → SMTP Credentials
   3. Copia las credenciales SMTP
   ```

2. **Configurar en `.env`:**
   ```env
   EMAIL_HOST=smtp.mailgun.org
   EMAIL_PORT=587
   EMAIL_SECURE=false
   EMAIL_USER=postmaster@tu-dominio.mailgun.org
   EMAIL_PASSWORD=tu-contraseña-smtp
   ```

#### **Opción D: Amazon SES (Para alto volumen)**

1. **Configurar AWS SES:**

   ```
   1. Crear cuenta en AWS
   2. Activar Amazon SES
   3. Verificar dominio o email
   4. Generar credenciales SMTP
   ```

2. **Configurar en `.env`:**
   ```env
   EMAIL_HOST=email-smtp.us-east-1.amazonaws.com
   EMAIL_PORT=587
   EMAIL_SECURE=false
   EMAIL_USER=tu-username-smtp-ses
   EMAIL_PASSWORD=tu-password-smtp-ses
   ```

### 4.2.2 Probar Configuración de Email

Después de configurar el email, prueba que funcione:

```bash
cd ~/epicstoria/backend

# Instalar dependencias si no lo has hecho
npm install

# Ejecutar test de email
npm run test:email tu-email@ejemplo.com
```

Deberías ver:

```
✅ Conexión con servidor de email verificada
📧 Email enviado: <message-id>
```

Y recibir 3 emails de prueba en tu bandeja:

- Email de bienvenida
- Email de reset de contraseña
- Email de confirmación de cambio

### 4.2.3 Configuración Avanzada de Email (Opcional)

Para evitar que los emails caigan en spam:

**1. Configurar SPF Record (si usas tu propio dominio):**

```
Tipo: TXT
Nombre: @
Valor: v=spf1 include:_spf.google.com ~all
       (o el valor que te proporcione SendGrid/Mailgun)
```

**2. Configurar DKIM:**

- SendGrid y Mailgun lo configuran automáticamente
- Para Gmail, ya está configurado

**3. Configurar DMARC (Opcional):**

```
Tipo: TXT
Nombre: _dmarc
Valor: v=DMARC1; p=none; rua=mailto:dmarc@tu-dominio.com
```

### 4.3 Instalar Dependencias del Backend

```bash
npm install
```

### 4.4 Ejecutar Migraciones de Base de Datos

```bash
# Migración principal
npm run db:migrate

# Migración de puntos
npm run db:migrate-points

# Migración de amistades
npm run db:migrate-friendships

# Migración de reset de contraseñas
npm run db:add-reset-columns

# Poblar con datos (opcional, para desarrollo)
# npm run db:seed
```

### 4.4.1 Restaurar Datos desde Base de Datos Local (Opcional)

Si ya tienes datos en tu base de datos local (usuarios, eventos, imágenes, etc.) y quieres migrarlos al servidor de IONOS:

**En tu máquina local (Windows):**

```powershell
# Primero, navega al directorio donde quieres guardar el backup
cd C:\Users\Usuario\Documents\repos\epicstoria

# pg_dump está en el directorio de instalación de PostgreSQL
# Ajusta la versión según tu instalación (15, 16, etc.)
$PG_BIN = "C:\Program Files\PostgreSQL\16\bin"

# Hacer backup de la base de datos local
# Opción 1: Backup completo (estructura + datos)
& "$PG_BIN\pg_dump.exe" -U postgres -d epicstoria > epicstoria_backup.sql

# Opción 2: Solo datos (si ya ejecutaste las migraciones en el servidor) - RECOMENDADO
& "$PG_BIN\pg_dump.exe" -U postgres -d epicstoria --data-only > epicstoria_data.sql

# Opción 3: Tablas específicas (ej: solo usuarios y eventos)
& "$PG_BIN\pg_dump.exe" -U postgres -d epicstoria -t users -t events -t friendships -t messages --data-only > epicstoria_partial.sql

# Verificar que se creó el archivo
ls *.sql
```

**Alternativa si no encuentras pg_dump:**

```powershell
# Buscar donde está instalado PostgreSQL
Get-ChildItem "C:\Program Files" -Filter pg_dump.exe -Recurse -ErrorAction SilentlyContinue

# Una vez encontrado, usa la ruta completa, por ejemplo:
& "C:\Program Files\PostgreSQL\16\bin\pg_dump.exe" -U postgres -d epicstoria --data-only > epicstoria_data.sql
```

**Transferir el archivo al servidor de IONOS:**

```powershell
# Opción 1: Usando SCP (desde PowerShell o CMD en Windows)
scp epicstoria_backup.sql epicstoria@tu-ip-vps:~/

# Opción 2: Usando SFTP
# 1. Conectar por SFTP con FileZilla, WinSCP, o similar
# 2. Subir el archivo .sql al directorio home del servidor
```

**En el servidor de IONOS:**

```bash
# Restaurar el backup en la base de datos
psql -U epicstoria_user -d epicstoria < ~/epicstoria_backup.sql

# O si usaste --data-only:
psql -U epicstoria_user -d epicstoria < ~/epicstoria_data.sql

# Verificar que los datos se importaron
psql -U epicstoria_user -d epicstoria -c "SELECT COUNT(*) FROM users;"
psql -U epicstoria_user -d epicstoria -c "SELECT COUNT(*) FROM events;"

# Limpiar el archivo de backup (opcional)
rm ~/epicstoria_backup.sql
```

**⚠️ Notas importantes:**

- Si importas un backup completo (con estructura), hazlo **antes** de ejecutar las migraciones
- Si importas solo datos (`--data-only`), hazlo **después** de las migraciones
- Si tienes imágenes, también necesitas copiar la carpeta `backend/public/images/` al servidor:

```powershell
# En local (Windows), comprimir las imágenes
cd C:\Users\Usuario\Documents\repos\epicstoria\backend\public
tar -czf images.tar.gz images/

# Subir al servidor
scp images.tar.gz epicstoria@tu-ip-vps:~/

# En el servidor, descomprimir
cd ~/epicstoria/backend/public
tar -xzf ~/images.tar.gz
rm ~/images.tar.gz
```

### 4.5 Construir el Backend

---

```bash
npm run build
```

---

## PARTE 5: CONFIGURAR EL FRONTEND

### 5.1 Configurar Variables de Entorno

```bash
cd ~/epicstoria

# Editar environment de producción
nano src/environments/environment.prod.ts
```

Actualiza la URL de tu API:

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://tu-dominio.com/api', // o http://tu-ip:3000/api
};
```

### 5.2 Instalar Dependencias y Construir

```bash
npm install
npm run build:ionos
```

Esto generará la aplicación en `dist/epicstoria/`.

**Nota**: El comando `build:ionos` usa la configuración de producción optimizada para el servidor.

---

## PARTE 6: CONFIGURAR PM2

### 6.1 Iniciar Backend con PM2

```bash
cd ~/epicstoria/backend

# Iniciar con el archivo de configuración
pm2 start ecosystem.config.js

# Verificar que está corriendo
pm2 status
pm2 logs
```

### 6.2 Configurar PM2 para Auto-inicio

```bash
# Guardar configuración actual
pm2 save

# Generar script de inicio
pm2 startup

# Ejecutar el comando que PM2 te muestra (ejemplo):
# sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u epicstoria --hp /home/epicstoria
```

### 6.3 Iniciar Frontend SSR con PM2

```bash
cd ~/epicstoria

# Crear archivo de configuración PM2 para frontend
cat > ecosystem.frontend.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'epicstoria-frontend',
    script: './dist/epicstoria/server/server.mjs',
    instances: 1,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 4000
    }
  }]
};
EOF

# Iniciar frontend
pm2 start ecosystem.frontend.config.js
pm2 save
```

---

## PARTE 7: CONFIGURAR NGINX

### 7.1 Crear Configuración de Nginx

```bash
sudo nano /etc/nginx/sites-available/epicstoria
```

Pega esta configuración:

```nginx
server {
    listen 80;
    server_name tu-dominio.com www.tu-dominio.com;  # Cambia por tu dominio o IP

    # Tamaño máximo de archivos subidos
    client_max_body_size 10M;

    # Logs
    access_log /var/log/nginx/epicstoria-access.log;
    error_log /var/log/nginx/epicstoria-error.log;

    # API Backend (Puerto 3000)
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

    # Imágenes del backend
    location /images {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Frontend SSR (Puerto 4000)
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
    }
}
```

### 7.2 Habilitar el Sitio

```bash
# Crear enlace simbólico
sudo ln -s /etc/nginx/sites-available/epicstoria /etc/nginx/sites-enabled/

# Eliminar configuración por defecto
sudo rm /etc/nginx/sites-enabled/default

# Verificar configuración
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
```

---

## PARTE 8: CONFIGURAR FIREWALL

```bash
# Habilitar UFW
sudo ufw enable

# Permitir SSH
sudo ufw allow 22/tcp

# Permitir HTTP y HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Verificar estado
sudo ufw status
```

---

## PARTE 9: CONFIGURAR SSL CON CERTBOT (HTTPS)

### 9.1 Instalar Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 9.2 Obtener Certificado SSL

```bash
sudo certbot --nginx -d tu-dominio.com -d www.tu-dominio.com
```

Sigue las instrucciones. Certbot configurará automáticamente Nginx para HTTPS.

### 9.3 Verificar Auto-renovación

```bash
sudo certbot renew --dry-run
```

---

## PARTE 10: CONFIGURAR TAREAS PROGRAMADAS (CRON)

---

### 10.1 Configurar Limpieza de Mensajes

```bash
cd ~/epicstoria/backend

# Hacer ejecutable el script
chmod +x install-crontab.sh

# Instalar cron job
./install-crontab.sh
```

---

## PARTE 11: VERIFICACIÓN Y MONITOREO

### 11.1 Verificar que Todo Funciona

```bash
# Estado de PM2
pm2 status

# Logs del backend
pm2 logs epicstoria-backend

# Logs del frontend
pm2 logs epicstoria-frontend

# Estado de Nginx
sudo systemctl status nginx

# Estado de PostgreSQL
sudo systemctl status postgresql

# Verificar puertos abiertos (comando moderno)
sudo ss -tlnp | grep -E ':(80|443|3000|4000|5432)'

# O instalar net-tools para usar netstat:
# sudo apt install -y net-tools
# sudo netstat -tlnp | grep -E ':(80|443|3000|4000|5432)'
```

**Salida esperada del comando de puertos:**

```
LISTEN 0      511          0.0.0.0:80         0.0.0.0:*    users:(("nginx",pid=1234,fd=6))
LISTEN 0      511          0.0.0.0:443        0.0.0.0:*    users:(("nginx",pid=1234,fd=7))
LISTEN 0      511        127.0.0.1:3000       0.0.0.0:*    users:(("node",pid=5678,fd=18))
LISTEN 0      511        127.0.0.1:4000       0.0.0.0:*    users:(("node",pid=5679,fd=18))
LISTEN 0      244        127.0.0.1:5432       0.0.0.0:*    users:(("postgres",pid=9012,fd=5))
```

**Nota:** El número antes de la dirección IP (ej: `511`, `244`) es el "backlog" y puede variar según la configuración. Es normal que difiera del ejemplo.

**Interpretación:**

- ✅ **Puerto 80** (HTTP): Nginx escuchando → Frontend accesible por HTTP
- ✅ **Puerto 443** (HTTPS): Nginx escuchando → Frontend accesible por HTTPS (si configuraste SSL)
- ✅ **Puerto 3000**: Node.js (backend) escuchando en localhost → API funcionando
- ✅ **Puerto 4000**: Node.js (frontend SSR) escuchando en localhost → Frontend SSR funcionando
- ✅ **Puerto 5432**: PostgreSQL escuchando en localhost → Base de datos funcionando

**⚠️ Nota importante:**

- Los puertos 3000, 4000 y 5432 deben mostrar `127.0.0.1` (localhost), NO `0.0.0.0`
- Esto es correcto porque solo Nginx debe ser accesible desde internet
- El backend y la BD solo aceptan conexiones locales (más seguro)

### 11.2 Probar la Aplicación

Abre tu navegador:

- `http://tu-dominio.com` o `http://tu-ip` → Frontend
- `http://tu-dominio.com/api/health` → Backend health check

### 11.3 Probar Sistema de Emails

```bash
# 1. Probar envío desde línea de comandos
cd ~/epicstoria/backend
npm run test:email tu-email@ejemplo.com

# 2. Probar registro de usuario (envía email de bienvenida)
# Desde el frontend, registra una cuenta de prueba

# 3. Probar recuperación de contraseña
# Usa la función "¿Olvidaste tu contraseña?" en /recuperar-password

# 4. Verificar en logs que los emails se enviaron
pm2 logs epicstoria-backend --lines 50 | grep "Email enviado"
```

**Checklist de verificación de emails:**

- [ ] Email de bienvenida se recibe al registrarse
- [ ] Email de recuperación llega al solicitar reset
- [ ] Email de confirmación llega al cambiar contraseña
- [ ] Los emails NO van a spam
- [ ] Los enlaces en los emails funcionan correctamente
- [ ] Los emails se ven bien en móvil y escritorio

---

## PARTE 12: COMANDOS ÚTILES

### PM2

```bash
# Ver logs en tiempo real
pm2 logs

# Reiniciar aplicaciones
pm2 restart all

# Detener aplicaciones
pm2 stop all

# Ver monitoreo
pm2 monit

# Ver métricas
pm2 list
```

### Nginx

```bash
# Reiniciar
sudo systemctl restart nginx

# Recargar configuración
sudo systemctl reload nginx

# Ver logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/epicstoria-error.log
```

### PostgreSQL

```bash
# Conectar a la base de datos
psql -U epicstoria_user -d epicstoria

# Backup
pg_dump -U epicstoria_user epicstoria > backup.sql

# Restaurar
psql -U epicstoria_user epicstoria < backup.sql
```

### Git (Actualizaciones)

```bash
cd ~/epicstoria

# Obtener últimos cambios
git pull

# Backend
cd backend
npm install
npm run build
pm2 restart epicstoria-backend

# Frontend
cd ..
npm install
npm run build:ionos
pm2 restart epicstoria-frontend
```

---

## 🔧 SOLUCIÓN DE PROBLEMAS

### Error 502 Bad Gateway

```bash
# Verificar que PM2 está corriendo
pm2 status

# Ver logs
pm2 logs

# Reiniciar aplicaciones
pm2 restart all
```

### Error de Conexión a Base de Datos

```bash
# Verificar PostgreSQL
sudo systemctl status postgresql

# Verificar credenciales en .env
nano ~/epicstoria/backend/.env

# Probar conexión
psql -U epicstoria_user -d epicstoria
```

### Puerto ya en uso

```bash
# Ver qué está usando el puerto
sudo lsof -i :3000
sudo lsof -i :4000

# Matar proceso
sudo kill -9 <PID>

# Reiniciar con PM2
pm2 restart all
```

### Problemas con Email

#### Los emails no se envían

```bash
# 1. Verificar configuración
cd ~/epicstoria/backend
cat .env | grep EMAIL

# 2. Probar conexión
npm run test:email tu-email@ejemplo.com

# 3. Ver logs del backend
pm2 logs epicstoria-backend | grep -i email
```

**Errores comunes:**

**"Failed to send email" o "Connection refused":**

- Verifica que `EMAIL_HOST`, `EMAIL_PORT` sean correctos
- **IONOS**: Usa `smtp.ionos.es` puerto 587 (TLS) o 465 (SSL)
- Gmail: asegúrate de usar contraseña de aplicación (16 caracteres)
- Verifica que no haya firewall bloqueando el puerto 587/465

```bash
# Probar conectividad al servidor SMTP
# Para IONOS
telnet smtp.ionos.es 587
nc -zv smtp.ionos.es 587

# Para Gmail
telnet smtp.gmail.com 587
nc -zv smtp.gmail.com 587
```

**"Failed to send email" o "Connection refused":**

- Verifica que `EMAIL_HOST`, `EMAIL_PORT` sean correctos
- **IONOS**: Usa `smtp.ionos.es` puerto 587 (TLS) o 465 (SSL)
- Gmail: asegúrate de usar contraseña de aplicación (16 caracteres)
- Verifica que no haya firewall bloqueando el puerto 587/465

```bash
# Probar conectividad al servidor SMTP
# Para IONOS
telnet smtp.ionos.es 587
nc -zv smtp.ionos.es 587

# Para Gmail
telnet smtp.gmail.com 587
nc -zv smtp.gmail.com 587
```

**"Invalid login" o "Authentication failed":**

- **IONOS**:
  - Verifica que el email existe en el Panel de Control de IONOS
  - Usa el email completo: `usuario@tu-dominio.com`
  - Verifica la contraseña en Panel IONOS → Email → Gestionar
  - Asegúrate que el dominio esté activo y verificado
  - IONOS puede tardar 15-30 minutos en activar nuevas cuentas
- Gmail: usa contraseña de aplicación, no tu contraseña normal
- SendGrid: el usuario debe ser exactamente `apikey`
- Verifica que no haya espacios en `EMAIL_PASSWORD`

**"Greeting never received":**

- Cambia `EMAIL_SECURE=false` para puerto 587
- Usa `EMAIL_SECURE=true` solo para puerto 465
- **IONOS**: Puerto 587 (TLS) es el recomendado

**Errores específicos de IONOS:**

**"Relay access denied" o "Not authenticated":**

```bash
# Verificar que el email existe
# 1. Ve a Panel IONOS → Email
# 2. Verifica que la dirección existe y está activa
# 3. Resetea la contraseña si es necesario
# 4. Asegúrate de usar el email completo: usuario@tu-dominio.com
# 5. Verifica que el dominio esté asociado a tu cuenta IONOS
```

**DNS no propagado:**

```bash
# Verificar registros MX del dominio
dig MX tu-dominio.com

# Verificar SPF (IONOS lo configura automáticamente)
dig TXT tu-dominio.com | grep spf

# Esperar 24-48h si el dominio es nuevo
# IONOS suele propagar en 1-6 horas
```

#### Los emails llegan a spam

**Soluciones:**

1. **Con IONOS Email (automático):**
   - ✅ IONOS configura automáticamente SPF, DKIM y DMARC
   - ✅ Verifica en Panel IONOS → Dominio → DNS que estén activos
   - ✅ Usa un email profesional (ej: `contacto@` en lugar de `noreply@`)

2. **Verificar registros DNS en IONOS:**

   ```bash
   # Verificar desde tu servidor
   dig TXT tu-dominio.com
   dig MX tu-dominio.com

   # O desde Panel IONOS:
   # Dominios → tu-dominio.com → DNS
   ```

   **Registros que debe tener tu dominio:**
   - ✅ **MX Record**: Apuntando a servidores de IONOS (mx00.ionos.es, mx01.ionos.es)
   - ✅ **SPF Record (TXT)**: `v=spf1 include:_spf.perfora.net include:_spf.kundenserver.de ~all`
   - ✅ **DKIM Record (TXT)**: Configurado automáticamente por IONOS
   - ✅ **DMARC Record (TXT)**: `v=DMARC1; p=none; rua=mailto:admin@tu-dominio.com`

3. **Usar servicio profesional adicional** (SendGrid, Mailgun) si necesitas más control

   ```bash
   # En tu panel de dominio, agrega:

   # SPF Record
   Tipo: TXT
   Nombre: @
   Valor: v=spf1 include:sendgrid.net ~all

   # DKIM (proporcionado por SendGrid/Mailgun)
   Tipo: TXT
   Nombre: [proporcionado por el servicio]
   Valor: [proporcionado por el servicio]
   ```

4. **Verificar dominio de envío** en SendGrid/Mailgun
5. **Usa un dominio profesional** en el remitente, no email gratuito

#### Límites de envío excedidos

**Gmail**: Máximo 500 emails/día
**SendGrid Free**: 100 emails/día
**Mailgun Free**: 100 emails/día (primeros 3 meses)

**Soluciones:**

- Actualizar a plan pago si necesitas más
- Usar múltiples proveedores
- Implementar cola de emails con prioridades

#### Verificar emails enviados

```bash
# Ver logs del backend
pm2 logs epicstoria-backend --lines 100 | grep "Email enviado"

# Ver todos los intentos de email
pm2 logs epicstoria-backend --lines 200 | grep -i email
```

#### Probar envío manual desde el servidor

```bash
# Instalar mailutils
sudo apt install -y mailutils

# Enviar email de prueba
echo "Test email desde servidor" | mail -s "Test" tu-email@ejemplo.com

# Ver cola de correo
mailq
```

---

## 📊 MONITOREO Y MANTENIMIENTO

### Logs

```bash
# Logs de aplicación
pm2 logs --lines 100

# Logs de Nginx
sudo tail -f /var/log/nginx/epicstoria-error.log

# Logs de sistema
sudo journalctl -u nginx -f
```

### Actualizaciones de Seguridad

```bash
# Actualizar sistema regularmente
sudo apt update
sudo apt upgrade -y

# Actualizar Node.js packages
cd ~/epicstoria/backend
npm audit fix

cd ~/epicstoria
npm audit fix
```

### Backups Automáticos

Crea un script de backup:

```bash
nano ~/backup-epicstoria.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/home/epicstoria/backups"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup de base de datos
pg_dump -U epicstoria_user epicstoria > $BACKUP_DIR/db_$DATE.sql

# Backup de imágenes
tar -czf $BACKUP_DIR/images_$DATE.tar.gz /home/epicstoria/epicstoria/backend/public/images

# Mantener solo últimos 7 días
find $BACKUP_DIR -type f -mtime +7 -delete

echo "Backup completado: $DATE"
```

```bash
chmod +x ~/backup-epicstoria.sh

# Agregar a crontab (backup diario a las 2 AM)
crontab -e
# Agregar: 0 2 * * * /home/epicstoria/backup-epicstoria.sh
```

---

## ✅ CHECKLIST FINAL

### Servidor y Software Base

- [ ] Ubuntu 20.04/22.04 actualizado
- [ ] Node.js 20.x instalado y verificado
- [ ] PostgreSQL instalado y corriendo
- [ ] PM2 instalado globalmente
- [ ] Nginx instalado y configurado
- [ ] Git instalado
- [ ] Firewall (UFW) configurado

### Base de Datos

- [ ] Base de datos PostgreSQL creada
- [ ] Usuario de base de datos creado con permisos
- [ ] Migración principal ejecutada (`db:migrate`)
- [ ] Migración de puntos ejecutada (`db:migrate-points`)
- [ ] Migración de amistades ejecutada (`db:migrate-friendships`)
- [ ] Migración de reset password ejecutada (`db:add-reset-columns`)
- [ ] Conexión a BD verificada

### Configuración de la Aplicación

- [ ] Repositorio clonado desde GitHub
- [ ] Variables de entorno configuradas (`.env`)
- [ ] `JWT_SECRET` generado y configurado
- [ ] `FRONTEND_URL` configurado correctamente
- [ ] Dependencias del backend instaladas
- [ ] Dependencias del frontend instaladas
- [ ] Backend compilado (`npm run build`)
- [ ] Frontend SSR compilado (`npm run build:ssr`)

### Sistema de Email ⭐

- [ ] Proveedor de email elegido (Gmail/SendGrid/Mailgun/SES)
- [ ] Credenciales de email configuradas en `.env`
- [ ] Variables `EMAIL_*` todas configuradas correctamente
- [ ] Contraseña de aplicación generada (si usas Gmail)
- [ ] API Key configurada (si usas SendGrid/Mailgun)
- [ ] Test de email ejecutado (`npm run test:email`)
- [ ] Email de bienvenida funciona al registrarse
- [ ] Email de recuperación de password funciona
- [ ] Email de confirmación funciona
- [ ] Emails NO van a carpeta de spam
- [ ] Dominio verificado (si usas servicio profesional)
- [ ] SPF/DKIM configurados (opcional pero recomendado)

### Procesos y Servicios

- [ ] Backend corriendo en PM2 (puerto 3000)
- [ ] Frontend corriendo en PM2 (puerto 4000)
- [ ] PM2 configurado para auto-inicio
- [ ] Procesos PM2 guardados (`pm2 save`)
- [ ] Nginx configurado como reverse proxy
- [ ] Configuración de Nginx probada (`nginx -t`)
- [ ] Nginx reiniciado correctamente

### Seguridad

- [ ] Firewall habilitado (SSH, HTTP, HTTPS permitidos)
- [ ] SSL/HTTPS configurado con Certbot (si usas dominio)
- [ ] Certificado SSL verificado y renovación automática configurada
- [ ] Passwords seguros en todas las configuraciones
- [ ] `.env` con permisos restrictivos (`chmod 600 .env`)

### Tareas Programadas

- [ ] Cron job de limpieza de mensajes instalado
- [ ] Script de backups configurado (recomendado)
- [ ] Backups automáticos probados

### Verificación Final

- [ ] Frontend accesible desde navegador
- [ ] API health check responde (`/api/health`)
- [ ] Registro de usuario funciona
- [ ] Login funciona
- [ ] Sistema de puntos funciona
- [ ] Chat funciona
- [ ] Imágenes se cargan correctamente
- [ ] No hay errores en `pm2 logs`
- [ ] No hay errores en logs de Nginx

### Monitoreo

- [ ] Logs de PM2 revisados
- [ ] Logs de Nginx revisados
- [ ] Logs de PostgreSQL revisados
- [ ] Emails de prueba enviados y recibidos
- [ ] Rendimiento del servidor monitoreado

---

## 🎉 ¡LISTO!

Tu aplicación Epicstoria ahora está desplegada en tu VPS Ubuntu de IONOS.

**URLs de acceso:**

- Frontend: `https://tu-dominio.com`
- API: `https://tu-dominio.com/api`
- Health check: `https://tu-dominio.com/api/health`

**Soporte:**
Si encuentras problemas, revisa los logs con `pm2 logs` y los logs de Nginx en `/var/log/nginx/`.
