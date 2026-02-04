# Sistema de Notificaciones por Email

Este documento describe el sistema de notificaciones por email implementado en Epicstoria.

## 📧 Características

El sistema de emails proporciona las siguientes funcionalidades:

1. **Email de bienvenida** - Enviado automáticamente al registrar un nuevo usuario
2. **Reseteo de contraseña** - Sistema completo de recuperación de contraseña
3. **Confirmación de cambio de contraseña** - Notificación de seguridad

## 🔧 Configuración

### Variables de Entorno

Agrega las siguientes variables a tu archivo `.env`:

```env
# Configuración de Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=tu-email@gmail.com
EMAIL_PASSWORD=tu-contraseña-de-aplicacion
FRONTEND_URL=http://localhost:4200
```

### Configuración de Gmail

Si usas Gmail, necesitas configurar una **Contraseña de Aplicación**:

1. Ve a tu cuenta de Google: https://myaccount.google.com/
2. Seguridad → Verificación en dos pasos (debe estar activada)
3. Contraseñas de aplicaciones
4. Genera una nueva contraseña para "Correo"
5. Usa esa contraseña en `EMAIL_PASSWORD`

### Otros proveedores de email

#### SendGrid

```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=apikey
EMAIL_PASSWORD=tu-api-key-de-sendgrid
```

#### Mailgun

```env
EMAIL_HOST=smtp.mailgun.org
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=postmaster@tu-dominio.mailgun.org
EMAIL_PASSWORD=tu-password-de-mailgun
```

#### Outlook/Hotmail

```env
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=tu-email@outlook.com
EMAIL_PASSWORD=tu-contraseña
```

## 🚀 Migración de Base de Datos

Antes de usar el sistema, ejecuta la migración para agregar las columnas necesarias:

```bash
cd backend
npm run db:add-reset-columns
```

O manualmente:

```bash
cd backend
npx ts-node src/database/add-password-reset-columns.ts
```

Esto agregará las siguientes columnas a la tabla `users`:

- `reset_token` - Token hasheado para reseteo de contraseña
- `reset_token_expiry` - Fecha de expiración del token

## 📡 API Endpoints

### 1. Registro de Usuario

**Endpoint**: `POST /api/auth/register`

Al registrarse, el usuario recibe automáticamente un email de bienvenida.

```json
{
  "email": "usuario@ejemplo.com",
  "password": "password123",
  "name": "Juan",
  "lastname": "Pérez"
}
```

### 2. Solicitar Reset de Contraseña

**Endpoint**: `POST /api/auth/forgot-password`

```json
{
  "email": "usuario@ejemplo.com"
}
```

**Respuesta**:

```json
{
  "success": true,
  "message": "If the email exists, a password reset link has been sent"
}
```

**Nota**: Por seguridad, siempre devuelve el mismo mensaje independientemente de si el email existe o no.

### 3. Resetear Contraseña

**Endpoint**: `POST /api/auth/reset-password`

```json
{
  "token": "token-recibido-por-email",
  "password": "nueva-contraseña"
}
```

**Respuesta**:

```json
{
  "success": true,
  "message": "Password has been reset successfully"
}
```

## 🔒 Seguridad

### Token de Reset

- Generado usando `crypto.randomBytes(32)` para máxima seguridad
- Almacenado hasheado (SHA256) en la base de datos
- Válido por **1 hora** solamente
- Se elimina automáticamente después de usarse

### Mejores Prácticas Implementadas

- Los tokens se hashean antes de almacenar en BD
- El email no revela si una cuenta existe o no (forgot-password)
- Tokens de un solo uso
- Expiración automática
- Confirmación por email al cambiar contraseña

## 📱 Flujo de Usuario

### Reset de Contraseña

1. Usuario hace clic en "¿Olvidaste tu contraseña?"
2. Ingresa su email
3. Recibe un email con un enlace único
4. Hace clic en el enlace (válido por 1 hora)
5. Ingresa nueva contraseña
6. Recibe confirmación por email

### Registro

1. Usuario se registra en la plataforma
2. Recibe automáticamente un email de bienvenida
3. Puede empezar a usar la plataforma inmediatamente

## 🎨 Plantillas de Email

Todos los emails usan diseño HTML responsive con:

- Gradientes modernos (púrpura/azul)
- Diseño mobile-friendly
- Botones de llamada a la acción claros
- Footer con información legal

### Tipos de Emails

#### 1. Email de Bienvenida

- Saludo personalizado con el nombre del usuario
- Lista de características de la plataforma
- Botón para explorar la aplicación
- Diseño atractivo con branding de Epicstoria

#### 2. Email de Reset de Contraseña

- Enlace único de reseteo
- Token visible en caso de problemas
- Advertencias de seguridad
- Tiempo de expiración claro (1 hora)

#### 3. Email de Confirmación de Cambiopemasil

- Confirma que la contraseña fue cambiada
- Timestamp del cambio
- Instrucciones si no fue el usuario

## 🧪 Testing

### Verificar Conexión de Email

```typescript
import { EmailService } from './services/email.service';

// En tu código
await EmailService.verifyConnection();
```

### Probar Envío Manual

```typescript
// Email de bienvenida
await EmailService.sendWelcomeEmail('test@example.com', 'Test User');

// Email de reset
await EmailService.sendPasswordResetEmail('test@example.com', 'Test User', 'test-token-123');

// Email de confirmación
await EmailService.sendPasswordChangedConfirmation('test@example.com', 'Test User');
```

## ⚠️ Solución de Problemas

### Error: "Failed to send email"

- Verifica que las credenciales en `.env` sean correctas
- Para Gmail, asegúrate de usar una contraseña de aplicación
- Verifica que el servidor SMTP sea accesible
- Comprueba los logs del servidor para más detalles

### Los emails no llegan

- Revisa la carpeta de spam
- Verifica que `EMAIL_USER` sea correcto
- Comprueba que el puerto y configuración secure sean correctos
- Intenta con `EMAIL_SECURE=true` y `EMAIL_PORT=465` para Gmail

### Token inválido o expirado

- Los tokens expiran después de 1 hora
- Cada token solo se puede usar una vez
- Solicita un nuevo reset si el token expiró

## 🔄 Actualización del package.json

Agrega el script de migración al `package.json`:

```json
{
  "scripts": {
    "db:add-reset-columns": "ts-node src/database/add-password-reset-columns.ts"
  }
}
```

## 📝 Notas Adicionales

- Los emails se envían de forma **no bloqueante** en el registro
- Si falla el envío del email de bienvenida, el registro continúa
- Si falla el envío del email de reset, se limpia el token de la BD
- Todos los errores de email se loguean en la consola del servidor

## 🎯 Próximas Mejoras

- [ ] Plantillas de email personalizables
- [ ] Soporte para múltiples idiomas
- [ ] Sistema de colas para envío masivo
- [ ] Estadísticas de emails enviados
- [ ] Webhooks para eventos de email
