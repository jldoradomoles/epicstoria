# Configuración de Limpieza de Mensajes para Producción

## 🚀 Instalación Rápida con Crontab

### En Desarrollo (Windows):

La limpieza funciona automáticamente con node-cron mientras el servidor esté activo.

### En Producción (Hostinger VPS Linux):

```bash
# Navegar al directorio backend
cd /ruta/a/tu/proyecto/backend

# Ejecutar el instalador automático
bash install-crontab.sh
```

**¡Eso es todo!** El script instalará automáticamente la tarea en crontab para ejecutarse diariamente a las 3:00 AM.

### Para desinstalar:

```bash
bash uninstall-crontab.sh
```

---

## 📋 ¿Qué hace el instalador?

El script `install-crontab.sh` realiza automáticamente:

1. ✅ Da permisos de ejecución a `cleanup-messages.sh`
2. ✅ Crea el directorio `logs/` si no existe
3. ✅ Verifica si ya existe una tarea instalada
4. ✅ Instala la tarea en crontab del sistema
5. ✅ Muestra confirmación e instrucciones de uso

---

## 🔍 Verificación y Monitoreo

### Ver si la tarea está instalada:

```bash
crontab -l
```

### Ver logs de ejecución:

```bash
tail -f backend/logs/cleanup.log
```

### Ejecutar limpieza manualmente (para probar):

```bash
cd backend
bash cleanup-messages.sh
```

O directamente:

```bash
npx ts-node src/database/cleanup-messages.ts
```

---

## 🛡️ Doble Protección en Producción

El sistema incluye **dos mecanismos** de limpieza:

### 1. Node-cron (Automático)

- Se ejecuta mientras el servidor Node.js esté activo
- Configurado en `src/services/message-cleanup.scheduler.ts`
- Ejecuta a las 3:00 AM diariamente

### 2. Crontab del Sistema (Respaldo)

- Se ejecuta independientemente del proceso Node.js
- Asegura ejecución incluso si el servidor se reinicia
- Ejecuta a las 3:00 AM diariamente

### 3. Límite Inmediato al Enviar

- Cada vez que se envía un mensaje, se verifica el límite de 100
- Se eliminan automáticamente los mensajes más antiguos si se excede
- Implementado en `src/services/chat.service.ts`

---

## 🎯 Configuración Recomendada en Hostinger

### Paso 1: Usar PM2 para mantener el proceso activo

```bash
# Instalar PM2
npm install -g pm2

# Compilar el proyecto
cd backend
npm run build

# Iniciar con PM2
pm2 start dist/index.js --name epicstoria-backend

# Guardar configuración
pm2 save

# Configurar inicio automático al reiniciar el servidor
pm2 startup
```

### Paso 2: Instalar Crontab como respaldo

```bash
cd backend
bash install-crontab.sh
```

Con esta configuración tienes **máxima confiabilidad**:

- ✅ Node-cron ejecuta si el proceso está activo
- ✅ Crontab ejecuta independientemente
- ✅ PM2 mantiene el servidor activo 24/7
- ✅ Límite de 100 mensajes siempre activo

---

## 📊 Estructura de Archivos

```
backend/
├── cleanup-messages.sh          # Script bash de limpieza
├── install-crontab.sh           # Instalador automático
├── uninstall-crontab.sh         # Desinstalador
├── logs/
│   └── cleanup.log              # Logs de ejecución
└── src/
    ├── database/
    │   └── cleanup-messages.ts  # Script manual
    └── services/
        ├── chat.service.ts                    # Límite al enviar
        ├── message-cleanup.service.ts         # Lógica de limpieza
        └── message-cleanup.scheduler.ts       # Node-cron
```

---

## 🔧 Solución de Problemas

### La limpieza no se ejecuta:

1. **Verificar crontab:**

```bash
crontab -l | grep cleanup-messages
```

2. **Ver logs:**

```bash
tail -50 backend/logs/cleanup.log
```

3. **Probar manualmente:**

```bash
cd backend
bash cleanup-messages.sh
```

4. **Ver logs del sistema:**

```bash
grep CRON /var/log/syslog | tail -20
```

### Errores comunes:

**"Permission denied"**

```bash
chmod +x backend/cleanup-messages.sh
```

**"Command not found: ts-node"**

- Asegúrate de compilar el proyecto: `npm run build`
- El script automáticamente usará `node dist/...` en producción

**"Database connection error"**

- Verifica las variables de entorno en `.env`
- Asegúrate de que PostgreSQL esté activo

---

## 📝 Variables de Entorno

Asegúrate de configurar en `.env`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=epicstoria
DB_USER=tu_usuario
DB_PASSWORD=tu_password
```

El script `cleanup-messages.sh` carga automáticamente estas variables.

---

## ✨ Resumen

### Para Instalar en Producción:

```bash
cd backend
bash install-crontab.sh
```

### Para Verificar:

```bash
crontab -l
tail -f backend/logs/cleanup.log
```

### Para Desinstalar:

```bash
bash uninstall-crontab.sh
```

La limpieza elimina:

- ❌ Mensajes con más de **7 días**
- ❌ Mensajes que excedan los **100 por conversación**

¡Y está listo para funcionar en Hostinger! 🚀
