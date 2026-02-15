# 📧 Configuración Rápida de Email con Hostinger

## Paso 1: Crear Cuenta de Email en Hostinger

1. Inicia sesión en **hPanel** de Hostinger
2. Ve a **Emails** → **Cuentas de Email**
3. Haz clic en **Crear Cuenta de Email**
4. Configura:
   - **Nombre**: `noreply` o `contacto` o `info`
   - **Dominio**: Selecciona tu dominio
   - **Contraseña**: Crea una contraseña segura (guárdala)
5. Haz clic en **Crear**

**Email creado**: `noreply@tu-dominio.com`

## Paso 2: Obtener Configuración SMTP

La configuración SMTP de Hostinger es:

```
Servidor SMTP: smtp.hostinger.com
Puerto (SSL): 465
Puerto (TLS): 587
Autenticación: Requerida
```

## Paso 3: Configurar en tu Aplicación

### Backend (.env)

```bash
cd ~/epicstoria/backend
nano .env
```

Agrega o actualiza estas líneas:

```env
# Email con Hostinger
EMAIL_HOST=smtp.hostinger.com
EMAIL_PORT=465
EMAIL_SECURE=true
EMAIL_USER=noreply@tu-dominio.com
EMAIL_PASSWORD=tu-contraseña-que-creaste
```

**Importante**: Reemplaza:

- `tu-dominio.com` con tu dominio real
- `tu-contraseña-que-creaste` con la contraseña del email

### Alternativa con Puerto 587 (TLS)

Si prefieres usar TLS en lugar de SSL:

```env
EMAIL_HOST=smtp.hostinger.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=noreply@tu-dominio.com
EMAIL_PASSWORD=tu-contraseña-que-creaste
```

## Paso 4: Verificar Configuración DNS

Hostinger configura automáticamente los registros necesarios, pero verifica:

### En hPanel:

1. Ve a **Hosting** → **Gestionar**
2. **DNS/Name Servers** → **DNS Records**
3. Verifica que existan:
   - ✅ Registros **MX** (para recibir emails)
   - ✅ Registro **SPF** (TXT): `v=spf1 include:spf.hostinger.com ~all`
   - ✅ Registro **DKIM** (configurado automáticamente)

### Desde el Servidor (Opcional):

```bash
# Verificar MX
dig MX tu-dominio.com

# Verificar SPF
dig TXT tu-dominio.com | grep spf

# Verificar que resuelve
nslookup smtp.hostinger.com
```

## Paso 5: Probar la Configuración

```bash
cd ~/epicstoria/backend

# Probar conexión SMTP
npm run test:email tu-email-personal@gmail.com
```

Deberías ver:

```
✅ Conexión con servidor de email verificada
📧 Email enviado: <message-id>
```

Y recibir 3 emails de prueba.

## Paso 6: Reiniciar el Backend

```bash
pm2 restart epicstoria-backend

# Verificar logs
pm2 logs epicstoria-backend
```

## 🔧 Solución de Problemas Comunes

### Error: "Invalid login"

**Causa**: Contraseña incorrecta o email no existe

**Solución**:

```bash
# 1. Ve a hPanel → Emails
# 2. Haz clic en los 3 puntos junto al email
# 3. Selecciona "Cambiar contraseña"
# 4. Establece una nueva contraseña
# 5. Actualiza el .env con la nueva contraseña
# 6. Reinicia: pm2 restart epicstoria-backend
```

### Error: "Connection refused" o "ETIMEDOUT"

**Causa**: Firewall bloqueando puerto o servidor caído

**Solución**:

```bash
# 1. Verificar que el puerto esté abierto
telnet smtp.hostinger.com 465

# 2. Si falla, probar con puerto 587
telnet smtp.hostinger.com 587

# 3. Verificar firewall del VPS
sudo ufw status

# 4. Si es necesario, permitir puerto
sudo ufw allow 465/tcp
sudo ufw allow 587/tcp
```

### Error: "Relay access denied"

**Causa**: No estás autenticado o el email no pertenece al dominio

**Solución**:

1. Verifica que `EMAIL_USER` sea el email completo: `usuario@tu-dominio.com`
2. Verifica que el dominio en el email coincida con tu dominio en Hostinger
3. No uses emails de otros dominios

### Los emails llegan a spam

**Soluciones**:

1. **Verificar SPF en hPanel:**
   - Hosting → DNS Records
   - Busca registro TXT con `v=spf1`
   - Debe incluir: `include:spf.hostinger.com ~all`

2. **Esperar propagación DNS:**
   - Si el dominio es nuevo, espera 24-48 horas
   - Verifica con: `dig TXT tu-dominio.com`

3. **Usar email profesional:**
   - `contacto@tu-dominio.com` es mejor que `noreply@tu-dominio.com`
   - Evita palabras como "test", "temp", "spam"

4. **Calentar el email (Warm-up):**
   - Envía pocos emails al principio (10-20/día)
   - Incrementa gradualmente
   - Esto ayuda a construir reputación

### Límite de envío excedido

**Límites de Hostinger** (según plan):

- Plan básico: ~100-300 emails/hora
- Plan premium: ~500 emails/hora

**Si necesitas más**:

1. Contacta soporte de Hostinger para aumentar límite
2. Usa múltiples cuentas de email
3. Considera SendGrid/Mailgun para alto volumen

## 📊 Monitoreo de Emails

### Ver emails enviados desde el backend:

```bash
# Logs en tiempo real
pm2 logs epicstoria-backend | grep -i email

# Últimos 50 envíos
pm2 logs epicstoria-backend --lines 50 | grep "Email enviado"

# Errores de email
pm2 logs epicstoria-backend --err | grep -i email
```

### Verificar cola de emails en Hostinger:

1. hPanel → Emails
2. Clic en el email
3. **Actividad** → Ver emails enviados/recibidos

## ✅ Checklist de Verificación

- [ ] Cuenta de email creada en hPanel
- [ ] Contraseña guardada de forma segura
- [ ] `.env` actualizado con credenciales
- [ ] Test de email ejecutado exitosamente
- [ ] Emails de prueba recibidos
- [ ] Registros DNS verificados
- [ ] Backend reiniciado con PM2
- [ ] Email de bienvenida funciona al registrarse
- [ ] Email de recuperación de contraseña funciona
- [ ] Emails NO van a spam

## 🎯 Configuración Recomendada para Producción

```env
# Producción con Hostinger
EMAIL_HOST=smtp.hostinger.com
EMAIL_PORT=465
EMAIL_SECURE=true
EMAIL_USER=contacto@epicstoria.es
EMAIL_PASSWORD=ContraseñaSegura123!
FRONTEND_URL=https://epicstoria.es
```

## 📞 Soporte

- **Documentación Hostinger**: https://support.hostinger.com/es/articles/1583309-como-configurar-una-cuenta-de-correo-electronico
- **Soporte Hostinger**: Chat en vivo disponible 24/7 en hPanel
- **Status de servicios**: https://hostinger.statuspage.io/

---

**¡Listo!** Tu sistema de email con Hostinger está configurado y funcionando. 🎉
