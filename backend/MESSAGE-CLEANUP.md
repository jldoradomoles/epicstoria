# Sistema de Limpieza de Mensajes del Chat

Este documento explica cómo funciona el sistema automático de limpieza de mensajes implementado.

## 📋 Reglas de Limpieza

### 1. Eliminación por Antigüedad

- **Frecuencia**: Automática, todos los días a las 3:00 AM
- **Regla**: Se eliminan todos los mensajes con más de **7 días** de antigüedad
- **Propósito**: Mantener solo conversaciones recientes

### 2. Límite por Conversación

- **Límite**: Máximo **100 mensajes** por conversación entre dos usuarios
- **Momento**: Se aplica automáticamente al enviar cada mensaje
- **Comportamiento**: Cuando se supera el límite, se eliminan los mensajes más antiguos

## 🔄 Limpieza Automática

El sistema ejecuta una tarea programada diariamente:

```typescript
// Se ejecuta todos los días a las 3:00 AM
scheduleMessageCleanup();
```

### Lo que hace:

1. Busca y elimina mensajes con más de 7 días
2. Revisa todas las conversaciones y elimina excedentes si hay más de 100 mensajes

## ⚙️ Limpieza Manual

Puedes ejecutar la limpieza manualmente cuando lo necesites:

```bash
cd backend
npx ts-node src/database/cleanup-messages.ts
```

Este script mostrará:

- Número de mensajes antiguos eliminados
- Número de mensajes excedentes eliminados por conversación
- Total de mensajes eliminados

## 🗂️ Archivos del Sistema

### Servicios

- **`message-cleanup.service.ts`**: Lógica de limpieza
  - `deleteOldMessages()`: Elimina mensajes >7 días
  - `limitMessagesPerConversation()`: Mantiene máximo 100 mensajes por conversación
  - `runCleanup()`: Ejecuta ambas limpiezas

- **`message-cleanup.scheduler.ts`**: Tarea programada con cron
  - Se ejecuta diariamente a las 3:00 AM

### Scripts

- **`cleanup-messages.ts`**: Script manual para ejecutar limpieza

### Integración

- **`index.ts`**: Inicia la tarea programada al arrancar el servidor

## 📊 Ejemplo de Uso

### Estado actual de mensajes:

```
Conversación Usuario A <-> Usuario B:
- 150 mensajes (50 de hace 10 días, 100 recientes)
```

### Después de la limpieza:

```
Conversación Usuario A <-> Usuario B:
- 100 mensajes (solo los 100 más recientes de menos de 7 días)
```

## ⏰ Programación

La tarea se ejecuta automáticamente usando `node-cron`:

- **Patrón**: `'0 3 * * *'` (Todos los días a las 3:00 AM)
- **Zona horaria**: Hora del servidor

## 🔧 Modificar las Reglas

Si necesitas cambiar las reglas de limpieza:

### Cambiar días de retención (actualmente 7):

Edita `message-cleanup.service.ts`:

```typescript
WHERE created_at < NOW() - INTERVAL '7 days'  // Cambiar '7' por el número deseado
```

### Cambiar límite de mensajes (actualmente 100):

Edita `message-cleanup.service.ts` y `chat.service.ts`:

```typescript
OFFSET 100  // Cambiar '100' por el límite deseado
```

### Cambiar horario de limpieza (actualmente 3:00 AM):

Edita `message-cleanup.scheduler.ts`:

```typescript
cron.schedule('0 3 * * *', ...)  // Cambiar el patrón cron
```

Patrones cron comunes:

- `'0 3 * * *'` - Diario a las 3:00 AM
- `'0 2 * * 0'` - Semanal, domingos a las 2:00 AM
- `'*/30 * * * *'` - Cada 30 minutos

## 📝 Notas Importantes

1. **Irreversible**: Los mensajes eliminados no se pueden recuperar
2. **Rendimiento**: La limpieza está optimizada con índices en la base de datos
3. **Logs**: Cada limpieza registra el número de mensajes eliminados en la consola
4. **Arranque**: La tarea programada se inicia automáticamente al arrancar el servidor

## 🚀 Activación

El sistema está **activado automáticamente** y no requiere configuración adicional. Al iniciar el backend verás:

```
🚀 Server running on http://localhost:3000
📚 API Documentation: http://localhost:3000/api
⏰ Tarea de limpieza de mensajes programada para las 3:00 AM diariamente
```
