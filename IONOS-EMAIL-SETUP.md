# 📧 Guía de Configuración de Email con IONOS

Esta guía detallada te ayudará a configurar el sistema de emails de Epicstoria usando IONOS como proveedor de email.

## 📋 Requisitos Previos

- ✅ Cuenta de IONOS activa
- ✅ Dominio registrado o gestionado en IONOS
- ✅ Backend de Epicstoria instalado

---

## PARTE 1: CREAR CUENTA DE EMAIL EN IONOS

### 1.1 Acceder al Panel de Control de IONOS

1. Ve a [https://www.ionos.es/](https://www.ionos.es/) (o tu región correspondiente)
2. Haz clic en **"Iniciar sesión"**
3. Ingresa con tus credenciales de IONOS

### 1.2 Crear Dirección de Email

1. **Navega a la sección de Email:**
   - En el menú principal, selecciona **"Email"**
   - O ve a **"Hosting & Dominios"** → **"Email"**

2. **Crear nueva dirección:**
   - Haz clic en **"Crear nueva dirección de email"**
   - O selecciona tu dominio y luego **"Nueva dirección de email"**

3. **Configurar la dirección:**

   ```
   Dirección de email: noreply@tu-dominio.com
   Nombre visible: Epicstoria
   Contraseña: [Genera una contraseña segura]
   Confirmar contraseña: [Repite la contraseña]
   Cuota de buzón: 2-5 GB (según necesites)
   ```

4. **Guardar credenciales:**
   - ⚠️ **IMPORTANTE**: Anota la contraseña, la necesitarás para la configuración del backend
   - Guárdala de forma segura

### 1.3 Verificar la Cuenta Creada

1. Ve a **Email** → **Direcciones de email**
2. Verifica que aparece `noreply@tu-dominio.com` en la lista
3. Estado debe mostrar **"Activa"**

---

## PARTE 2: OBTENER CONFIGURACIÓN SMTP

### 2.1 Información del Servidor SMTP de IONOS

IONOS proporciona los siguientes servidores SMTP según tu región:

#### **Para España:**

```
Servidor SMTP: smtp.ionos.es
Puerto TLS: 587
Puerto SSL: 465
```

#### **Para otros países:**

```
Servidor SMTP: smtp.ionos.com
Puerto TLS: 587
Puerto SSL: 465
```

### 2.2 Parámetros de Configuración

```
Servidor: smtp.ionos.es (o smtp.ionos.com)
Puerto: 587 (TLS recomendado) o 465 (SSL)
Usuario: noreply@tu-dominio.com (email completo)
Contraseña: [La contraseña que creaste]
Autenticación: Requerida
Cifrado: STARTTLS (puerto 587) o SSL/TLS (puerto 465)
```

---

## PARTE 3: CONFIGURAR EL BACKEND

### 3.1 Editar Variables de Entorno

En tu servidor VPS o local:

```bash
cd ~/epicstoria/backend
nano .env
```

### 3.2 Configuración Recomendada (Puerto 587 - TLS)

```env
# Email Configuration - IONOS
EMAIL_HOST=smtp.ionos.es
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=noreply@tu-dominio.com
EMAIL_PASSWORD=tu-contraseña-del-email-ionos
```

**¿Por qué esta configuración?**

- ✅ Puerto 587 es el estándar para SMTP con STARTTLS
- ✅ `EMAIL_SECURE=false` porque usamos STARTTLS (no SSL directo)
- ✅ Compatible con la mayoría de firewalls
- ✅ Recomendado por IONOS

### 3.3 Configuración Alternativa (Puerto 465 - SSL)

```env
# Email Configuration - IONOS (SSL)
EMAIL_HOST=smtp.ionos.es
EMAIL_PORT=465
EMAIL_SECURE=true
EMAIL_USER=noreply@tu-dominio.com
EMAIL_PASSWORD=tu-contraseña-del-email-ionos
```

**Cuándo usar esta configuración:**

- Si tu firewall bloquea el puerto 587
- Si prefieres SSL directo en lugar de STARTTLS
- Si tienes problemas con la configuración TLS

### 3.4 Variables Completas

Tu archivo `.env` debe incluir (además de las variables de email):

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
JWT_SECRET=tu-clave-secreta-super-segura-y-larga-aqui
JWT_EXPIRES_IN=7d

# Email Configuration - IONOS
EMAIL_HOST=smtp.ionos.es
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=noreply@tu-dominio.com
EMAIL_PASSWORD=tu-contraseña-del-email-ionos
```

---

## PARTE 4: PROBAR LA CONFIGURACIÓN

### 4.1 Usar el Script de Prueba

Epicstoria incluye un script para probar el envío de emails:

```bash
cd ~/epicstoria/backend
npm run test:email
```

**Salida esperada:**

```
🔍 Probando configuración de email...

✅ Conexión exitosa con el servidor SMTP
📧 Email de prueba enviado a: tu-email@ejemplo.com

🎉 Todos los emails de prueba se enviaron correctamente
```

### 4.2 Verificar Logs

Si hay errores, verifica los logs:

```bash
# Si usas PM2
pm2 logs epicstoria-backend --lines 50

# O consulta logs directamente
tail -f ~/epicstoria/backend/logs/error.log
```

### 4.3 Probar desde la Aplicación

1. **Registro de Usuario:**
   - Ve a `https://tu-dominio.com/registro`
   - Crea una cuenta de prueba
   - Verifica que recibes el email de bienvenida

2. **Recuperación de Contraseña:**
   - Ve a `https://tu-dominio.com/recuperar-password`
   - Ingresa el email de tu cuenta
   - Verifica que recibes el email con el enlace de recuperación

---

## PARTE 5: CONFIGURACIÓN DNS (IMPORTANTE PARA DELIVERABILITY)

### 5.1 ¿Por Qué es Importante?

Los registros DNS correctos aseguran que:

- ✅ Tus emails no lleguen a spam
- ✅ Los servidores de destino confíen en tu dominio
- ✅ Se autentique tu servidor de envío

### 5.2 Verificar Registros DNS Existentes

IONOS configura automáticamente algunos registros cuando creas una cuenta de email. Verifica:

```bash
# Verificar registros MX
dig MX tu-dominio.com

# Verificar SPF
dig TXT tu-dominio.com | grep spf

# Verificar DMARC
dig TXT _dmarc.tu-dominio.com
```

### 5.3 Registros DNS Necesarios

#### **1. Registro MX (Mail Exchange)**

IONOS lo configura automáticamente:

```
Tipo: MX
Nombre: @
Prioridad: 10
Valor: mx00.ionos.es
```

```
Tipo: MX
Nombre: @
Prioridad: 20
Valor: mx01.ionos.es
```

#### **2. Registro SPF (Sender Policy Framework)**

IONOS también lo configura automáticamente, pero verifica:

```
Tipo: TXT
Nombre: @
Valor: v=spf1 include:_spf.perfora.net include:_spf.kundenserver.de ~all
```

**Explicación:**

- `v=spf1`: Versión de SPF
- `include:_spf.perfora.net`: Autoriza servidores de IONOS
- `include:_spf.kundenserver.de`: Autoriza servidores adicionales de IONOS
- `~all`: Marca como sospechosos otros servidores (modo "soft fail")

#### **3. Registro DKIM**

IONOS lo configura automáticamente. No necesitas hacer nada.

#### **4. Registro DMARC (Opcional pero Recomendado)**

Si quieres mayor control, puedes agregar:

```
Tipo: TXT
Nombre: _dmarc
Valor: v=DMARC1; p=none; rua=mailto:admin@tu-dominio.com
```

**Explicación:**

- `v=DMARC1`: Versión de DMARC
- `p=none`: Política (none = monitorear, quarantine = cuarentena, reject = rechazar)
- `rua=mailto:admin@tu-dominio.com`: Email para recibir reportes

### 5.4 Agregar/Verificar Registros DNS en IONOS

1. **Acceder a DNS:**
   - Panel IONOS → **Dominios**
   - Selecciona tu dominio
   - Haz clic en **DNS**

2. **Verificar registros existentes:**
   - Busca los registros MX, TXT (SPF), TXT (DMARC)
   - IONOS los crea automáticamente al crear la cuenta de email

3. **Agregar DMARC si no existe:**
   - Haz clic en **Agregar registro**
   - Tipo: **TXT**
   - Nombre: **\_dmarc**
   - Valor: `v=DMARC1; p=none; rua=mailto:admin@tu-dominio.com`
   - Guardar

### 5.5 Tiempo de Propagación

- **Registros MX y SPF**: 1-6 horas (IONOS es rápido)
- **Registros nuevos**: Hasta 24-48 horas en todo el mundo
- **Verificación**: Usa herramientas como [MXToolbox](https://mxtoolbox.com/)

---

## PARTE 6: SOLUCIÓN DE PROBLEMAS

### 6.1 Error: "Invalid login" o "Authentication failed"

**Causas comunes:**

1. **Contraseña incorrecta:**

   ```bash
   # Solución: Resetear contraseña en Panel IONOS
   # Panel IONOS → Email → Seleccionar email → Cambiar contraseña
   ```

2. **Usuario incorrecto:**

   ```bash
   # ❌ MAL: noreply
   # ✅ BIEN: noreply@tu-dominio.com
   ```

   **En .env debe estar:**

   ```env
   EMAIL_USER=noreply@tu-dominio.com
   ```

3. **Email no activado:**
   - Ve a Panel IONOS → Email
   - Verifica que el estado sea **"Activa"**
   - Si está "Pendiente", espera 15-30 minutos

4. **Contraseña con caracteres especiales:**
   ```env
   # Si tu contraseña tiene caracteres especiales, enciérrala en comillas:
   EMAIL_PASSWORD="tu-contraseña-con-caracteres-especiales!"
   ```

### 6.2 Error: "Connection refused" o "Connection timeout"

**Causas comunes:**

1. **Puerto bloqueado por firewall:**

   ```bash
   # Verificar conectividad
   telnet smtp.ionos.es 587

   # Si falla, probar puerto 465
   telnet smtp.ionos.es 465

   # O usar nc
   nc -zv smtp.ionos.es 587
   ```

2. **Firewall del servidor bloqueando:**

   ```bash
   # Permitir puerto 587 saliente
   sudo ufw allow out 587/tcp

   # O puerto 465
   sudo ufw allow out 465/tcp

   # Recargar firewall
   sudo ufw reload
   ```

3. **Servidor SMTP incorrecto:**

   ```env
   # Verifica que uses el correcto:
   # Para España:
   EMAIL_HOST=smtp.ionos.es

   # Para internacional:
   EMAIL_HOST=smtp.ionos.com
   ```

### 6.3 Error: "Greeting never received"

**Solución:**

Verifica la combinación puerto/EMAIL_SECURE:

```env
# Puerto 587 → EMAIL_SECURE=false
EMAIL_PORT=587
EMAIL_SECURE=false

# Puerto 465 → EMAIL_SECURE=true
EMAIL_PORT=465
EMAIL_SECURE=true
```

### 6.4 Los Emails Llegan a Spam

**Soluciones:**

1. **Verificar registros DNS:**

   ```bash
   # SPF
   dig TXT tu-dominio.com | grep spf

   # MX
   dig MX tu-dominio.com

   # DMARC
   dig TXT _dmarc.tu-dominio.com
   ```

2. **Usar herramientas de verificación:**
   - [Mail-tester.com](https://www.mail-tester.com/) - Evalúa tus emails
   - [MXToolbox](https://mxtoolbox.com/) - Verifica DNS y blacklists

3. **Configurar DMARC:**
   - Agrega el registro DMARC (ver sección 5.4)

4. **Esperar propagación DNS:**
   - Nuevos dominios pueden tardar 24-48h
   - Verifica con `dig` después de ese tiempo

5. **Usar email profesional en el FROM:**

   ```typescript
   // En backend/src/services/email.service.ts
   from: '"Epicstoria" <contacto@tu-dominio.com>',
   // En lugar de noreply@...
   ```

6. **Incluir contenido relevante:**
   - Evita solo imágenes
   - Incluye texto
   - No uses demasiados enlaces
   - No uses palabras "spam" (GRATIS, OFERTA, etc.)

### 6.5 Límite de Envío Excedido

**Límites de IONOS:**

- Planes básicos: ~500 emails/día
- Planes superiores: Consulta tu plan específico

**Soluciones:**

1. **Verificar tu límite:**
   - Panel IONOS → Email → Configuración
   - Busca "Límite de envío"

2. **Distribuir envíos:**

   ```typescript
   // Ejemplo: Agregar delay entre emails masivos
   await delay(1000); // 1 segundo entre emails
   ```

3. **Actualizar plan:**
   - Si necesitas más, contacta a IONOS para plan superior

### 6.6 Email Enviado pero No Llega

**Pasos de depuración:**

1. **Verificar logs del backend:**

   ```bash
   pm2 logs epicstoria-backend --lines 100 | grep -i email
   ```

2. **Buscar el email en spam:**
   - Revisa la carpeta de spam del destinatario

3. **Verificar email válido:**

   ```bash
   # El destinatario debe existir
   # Prueba con tu propio email primero
   ```

4. **Verificar desde Panel IONOS:**
   - Panel → Email → Estadísticas
   - Verifica si hay emails enviados recientemente

---

## PARTE 7: MONITOREO Y MEJORES PRÁCTICAS

### 7.1 Monitorear Envíos

```bash
# Ver logs de emails enviados
pm2 logs epicstoria-backend | grep "Email enviado"

# Ver errores de email
pm2 logs epicstoria-backend --err | grep -i email
```

### 7.2 Mejores Prácticas

1. **✅ Usa un email específico para la app:**
   - `noreply@tu-dominio.com` o `contacto@tu-dominio.com`
   - No uses tu email personal

2. **✅ Configura un email de respuesta válido:**

   ```typescript
   replyTo: 'contacto@tu-dominio.com';
   ```

3. **✅ Personaliza los emails:**
   - Usa el nombre del usuario
   - Incluye logo de tu marca
   - Mantén un diseño profesional

4. **✅ Implementa reintentos:**

   ```typescript
   // En caso de fallo, reintentar
   try {
     await emailService.sendWelcomeEmail(...);
   } catch (error) {
     // Log error y reintentar después
   }
   ```

5. **✅ No envíes emails desde el hilo principal:**
   ```typescript
   // Enviar de forma asíncrona
   emailService
     .sendWelcomeEmail(email, name)
     .catch((err) => logger.error('Error enviando email:', err));
   ```

### 7.3 Límites y Cuotas

**Límites de IONOS (verificar tu plan específico):**

- Emails/día: ~500
- Emails/hora: ~100
- Tamaño máximo: 50 MB por email
- Adjuntos: Hasta 50 MB total

**Recomendaciones:**

- No envíes emails masivos de golpe
- Implementa cola de emails si necesitas enviar muchos
- Usa servicios como SendGrid para newsletters masivas

---

## PARTE 8: CONFIGURACIÓN AVANZADA

### 8.1 Configurar Email de Respuesta (Reply-To)

En `backend/src/services/email.service.ts`:

```typescript
const mailOptions = {
  from: '"Epicstoria" <noreply@tu-dominio.com>',
  to: email,
  subject: 'Asunto',
  replyTo: 'contacto@tu-dominio.com', // 👈 Email de respuesta
  html: htmlContent,
};
```

### 8.2 Usar Templates HTML Profesionales

Mejora los templates en `email.service.ts`:

```typescript
private getEmailTemplate(title: string, content: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
                  color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; background: #fff; }
        .footer { text-align: center; padding: 20px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${title}</h1>
        </div>
        <div class="content">
          ${content}
        </div>
        <div class="footer">
          <p>© 2026 Epicstoria. Todos los derechos reservados.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
```

### 8.3 Implementar Cola de Emails (Opcional)

Para aplicaciones con muchos usuarios:

```bash
npm install bull redis
```

```typescript
// backend/src/services/email-queue.service.ts
import Queue from 'bull';

const emailQueue = new Queue('email', {
  redis: { host: 'localhost', port: 6379 },
});

emailQueue.process(async (job) => {
  const { type, email, data } = job.data;

  if (type === 'welcome') {
    await emailService.sendWelcomeEmail(email, data.name);
  }
  // ... otros tipos
});

export const queueEmail = (type: string, email: string, data: any) => {
  emailQueue.add({ type, email, data });
};
```

---

## 📚 RECURSOS ADICIONALES

### Documentación Oficial IONOS

- [Centro de Ayuda IONOS](https://www.ionos.es/ayuda/)
- [Configuración Email IONOS](https://www.ionos.es/ayuda/email/)

### Herramientas de Verificación

- [Mail-Tester](https://www.mail-tester.com/) - Prueba deliverability
- [MXToolbox](https://mxtoolbox.com/) - Verifica DNS y blacklists
- [DMARC Analyzer](https://www.dmarcanalyzer.com/) - Analiza DMARC

### Mejores Prácticas Email

- [Email on Acid](https://www.emailonacid.com/) - Testing de emails
- [Litmus](https://www.litmus.com/) - Testing y analytics

---

## ✅ CHECKLIST FINAL

Antes de considerar la configuración completa, verifica:

- [ ] Cuenta de email creada en Panel IONOS
- [ ] Variables `.env` configuradas correctamente
- [ ] Puerto y EMAIL_SECURE configurados según puerto usado
- [ ] `npm run test:email` ejecutado exitosamente
- [ ] Email de prueba recibido
- [ ] Registro de usuario envía email de bienvenida
- [ ] Recuperación de contraseña envía email
- [ ] Registros DNS verificados (MX, SPF)
- [ ] DMARC configurado (opcional pero recomendado)
- [ ] Emails NO llegan a spam
- [ ] Logs del backend sin errores de email

---

## 🆘 SOPORTE

Si después de seguir esta guía sigues teniendo problemas:

1. **Revisa los logs:**

   ```bash
   pm2 logs epicstoria-backend --lines 100
   ```

2. **Contacta a Soporte IONOS:**
   - Email: [Formulario de contacto](https://www.ionos.es/contacto)
   - Teléfono: Disponible en su web

3. **Verifica la documentación del proyecto:**
   - `EMAIL-SYSTEM.md` - Documentación técnica del sistema
   - `CONFIGURACION-EMAIL.md` - Guía general de configuración

---

**¡Listo!** 🎉 Tu sistema de emails con IONOS está configurado y funcionando.
