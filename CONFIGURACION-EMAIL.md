# 📧 Guía de Configuración del Sistema de Email

Esta guía te ayudará a configurar el sistema de notificaciones por email en Epicstoria.

## 🚀 Pasos de Configuración

### 1. Migrar la Base de Datos

Primero, ejecuta el script de migración para agregar las columnas necesarias:

```bash
cd backend
npm run db:add-reset-columns
```

Esto agregará las siguientes columnas a la tabla `users`:

- `reset_token` - Para almacenar el token de reseteo (hasheado)
- `reset_token_expiry` - Fecha de expiración del token

### 2. Configurar Variables de Entorno

Copia el archivo de ejemplo y configura tus credenciales:

```bash
cd backend
cp .env.example .env
```

Edita el archivo `.env` y configura las variables de email:

#### Opción A: IONOS (Recomendado para producción)

```env
EMAIL_HOST=smtp.ionos.es
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=noreply@tu-dominio.com
EMAIL_PASSWORD=tu-contraseña-email-ionos
FRONTEND_URL=https://tu-dominio.com
```

**⚠️ Importante para IONOS:**

1. Inicia sesión en el Panel de Control de IONOS
2. Ve a **Email** → **Direcciones de Email**
3. Crea una cuenta de email (ej: `noreply@tu-dominio.com`)
4. Anota la contraseña que creaste
5. Usa el **email completo** como `EMAIL_USER`
6. Para guía detallada, consulta [IONOS-EMAIL-SETUP.md](./IONOS-EMAIL-SETUP.md)

#### Opción B: Gmail (Para desarrollo/pruebas)

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=tu-email@gmail.com
EMAIL_PASSWORD=tu-contraseña-de-aplicacion
FRONTEND_URL=http://localhost:4200
```

**⚠️ Importante para Gmail:**

1. Ve a tu cuenta de Google: https://myaccount.google.com/
2. Ve a **Seguridad**
3. Activa la **Verificación en dos pasos** (si no está activada)
4. Busca **Contraseñas de aplicaciones**
5. Genera una nueva contraseña para "Correo"
6. Usa esa contraseña (16 caracteres) en `EMAIL_PASSWORD`

#### Opción C: Otros Proveedores

<details>
<summary><strong>Outlook/Hotmail</strong></summary>

```env
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=tu-email@outlook.com
EMAIL_PASSWORD=tu-contraseña
```

</details>

<details>
<summary><strong>SendGrid (Para producción)</strong></summary>

```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=apikey
EMAIL_PASSWORD=tu-sendgrid-api-key
```

</details>

<details>
<summary><strong>Mailgun (Para producción)</strong></summary>

```env
EMAIL_HOST=smtp.mailgun.org
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=postmaster@tu-dominio.mailgun.org
EMAIL_PASSWORD=tu-mailgun-password
```

</details>

### 3. Probar la Configuración

Verifica que todo funcione correctamente:

```bash
cd backend
npm run test:email tu-email@ejemplo.com
```

Este comando:

- ✅ Verifica la conexión con el servidor SMTP
- 📧 Envía emails de prueba (bienvenida, reset, confirmación)
- 🎯 Te permite verificar que los emails se reciben correctamente

### 4. Iniciar el Servidor

```bash
cd backend
npm run dev
```

## 📡 API Endpoints Disponibles

### 1. Registro de Usuario

Envía automáticamente un email de bienvenida

```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "usuario@ejemplo.com",
  "password": "password123",
  "name": "Juan",
  "lastname": "Pérez"
}
```

### 2. Solicitar Reset de Contraseña

```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "usuario@ejemplo.com"
}
```

### 3. Resetear Contraseña

```http
POST /api/auth/reset-password
Content-Type: application/json

{
  "token": "token-recibido-por-email",
  "password": "nueva-contraseña"
}
```

## 🎨 Flujos de Usuario en Frontend

### Flujo de Registro

1. Usuario completa formulario en `/register`
2. Sistema crea cuenta y envía email de bienvenida
3. Usuario puede iniciar sesión inmediatamente

### Flujo de Reset de Contraseña

1. Usuario hace clic en "¿Olvidaste tu contraseña?" en `/login`
2. Ingresa email en `/recuperar-password`
3. Recibe email con enlace único
4. Hace clic en el enlace → redirige a `/restablecer-password?token=xxx`
5. Ingresa nueva contraseña
6. Recibe confirmación por email
7. Puede iniciar sesión con nueva contraseña

## 🔒 Características de Seguridad

- ✅ Tokens generados con `crypto.randomBytes(32)` (máxima aleatoriedad)
- ✅ Tokens almacenados hasheados (SHA256) en base de datos
- ✅ Expiración automática de tokens (1 hora)
- ✅ Tokens de un solo uso
- ✅ No revela si un email existe en la base de datos
- ✅ Confirmación por email al cambiar contraseña
- ✅ Envío no bloqueante de emails de bienvenida

## 🎯 Tipos de Emails

### 1. Email de Bienvenida

- **Cuándo:** Al registrarse un nuevo usuario
- **Contenido:** Saludo personalizado, características de la plataforma, botón de exploración
- **No bloqueante:** Si falla el envío, el registro continúa

### 2. Email de Reset de Contraseña

- **Cuándo:** Usuario solicita resetear contraseña
- **Contenido:** Enlace único, advertencias de seguridad, tiempo de expiración
- **Seguridad:** Token hasheado, válido 1 hora

### 3. Email de Confirmación

- **Cuándo:** Contraseña cambiada exitosamente
- **Contenido:** Confirmación del cambio, timestamp, instrucciones si no fue el usuario

## ⚠️ Solución de Problemas

### Error: "Failed to send email"

**Posibles causas:**

- Credenciales incorrectas
- Puerto bloqueado por firewall
- Gmail sin contraseña de aplicación

**Solución:**

```bash
# Verificar conexión
npm run test:email tu-email@ejemplo.com

# Revisar logs del servidor
npm run dev
```

### Los emails van a spam

**Solución:**

- Para desarrollo, marca como "No es spam"
- Para producción, usa un servicio profesional (SendGrid, Mailgun)
- Configura SPF, DKIM y DMARC en tu dominio

### Token inválido o expirado

**Causas:**

- El token expira después de 1 hora
- El token ya fue usado
- Error al copiar el enlace

**Solución:**

- Solicitar un nuevo reset de contraseña

## 🛠️ Personalización

### Cambiar Tiempo de Expiración del Token

Edita [auth.service.ts](backend/src/services/auth.service.ts):

```typescript
// Cambiar de 1 hora a 30 minutos
expiryDate.setHours(expiryDate.getHours() + 1); // Actual
expiryDate.setMinutes(expiryDate.getMinutes() + 30); // Nuevo
```

### Personalizar Plantillas de Email

Las plantillas están en [email.service.ts](backend/src/services/email.service.ts):

- `sendWelcomeEmail()` - Email de bienvenida
- `sendPasswordResetEmail()` - Email de reset
- `sendPasswordChangedConfirmation()` - Email de confirmación

### Agregar Nuevo Tipo de Email

```typescript
// En email.service.ts
static async sendCustomEmail(
  email: string,
  data: any
): Promise<void> {
  const subject = 'Tu asunto';
  const html = `
    <!-- Tu HTML aquí -->
  `;

  await this.sendEmail(email, subject, html);
}
```

## 📊 Monitoreo

### Ver Logs de Emails

Los logs se muestran en la consola del servidor:

```
📧 Email enviado: <message-id>
✅ Conexión con servidor de email verificada
❌ Error enviando email: <error>
```

### Estadísticas (Próximamente)

- Total de emails enviados
- Tasa de éxito/fallo
- Tiempo promedio de envío
- Emails por tipo

## 🚀 Producción

### Variables de Entorno Recomendadas

```env
# Usar servicio profesional
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=apikey
EMAIL_PASSWORD=${SENDGRID_API_KEY}

# URL de producción
FRONTEND_URL=https://epicstoria.es
```

### Consideraciones

- ✅ Usa un servicio de email profesional (SendGrid, AWS SES, Mailgun)
- ✅ Configura límites de tasa (rate limiting)
- ✅ Implementa cola de emails para alto volumen
- ✅ Monitorea tasas de entrega y rebote
- ✅ Configura webhooks para eventos de email

## 📚 Recursos Adicionales

- [Documentación completa](backend/EMAIL-SYSTEM.md)
- [Nodemailer Docs](https://nodemailer.com/)
- [SendGrid Guide](https://docs.sendgrid.com/)
- [Gmail App Passwords](https://support.google.com/accounts/answer/185833)

## ✅ Checklist de Configuración

- [ ] Migración de base de datos ejecutada
- [ ] Variables de entorno configuradas
- [ ] Contraseña de aplicación generada (si usas Gmail)
- [ ] Test de email ejecutado exitosamente
- [ ] Servidor backend iniciado
- [ ] Email de prueba recibido
- [ ] Flujo de registro probado
- [ ] Flujo de reset de contraseña probado

---

**¿Necesitas ayuda?** Revisa los logs del servidor o abre un issue en el repositorio.
