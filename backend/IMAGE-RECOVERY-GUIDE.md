# 🔧 Guía de Recuperación de Imágenes Adicionales

## Problema Ocurrido

El script `db:convert-images-to-webp` eliminó inadvertidamente el array `additional_images` en la base de datos PostgreSQL, dejándolo en `NULL` para todos los eventos.

**Fecha del incidente:** 2026-09-08
**Causa:** Lógica incorrecta en la conversión que asignaba `null` cuando el array estaba vacío después de la conversión.

---

## 🚀 OPCIÓN MÁS RÁPIDA: Recovery Wizard

Si no sabes por dónde empezar, usa el wizard interactivo:

```bash
cd backend
npm run db:recovery-wizard
```

Este script te guiará paso a paso a través de todas las opciones y te dirá exactamente qué hacer.

---

## 📊 Scripts Disponibles

### 1. **Diagnóstico** (VER QUÉ PASÓ)

```bash
npm run db:diagnostic-images
```

Genera un reporte con:

- Total de eventos
- Cuántos tienen imágenes adicionales vacías
- Estado de cada imagen (formatos webp vs antiguos)
- Recomendaciones de acción

### 2. **Backup** (CREAR RESPALDO)

```bash
npm run db:export-backup
```

Crea: `backups/events-backup-YYYY-MM-DD.json`

Contiene todos los eventos con sus imágenes. Útil antes de cualquier operación.

### 3. **Recuperación desde Filesystem** (SI TIENES LAS IMÁGENES EN EL SERVIDOR)

```bash
npm run db:recover-images-fs -- /ruta/a/imagenes
```

**¿Cuándo usar?**

- Las imágenes aún existen en el servidor
- Solo se perdieron las URLs en la BD
- Quieres reconstruir el array desde los archivos reales

**Estructura esperada:**

```
/ruta/a/imagenes/
├── eventos/
│   ├── evento-1-id/
│   │   ├── main.webp (imagen principal, será ignorada)
│   │   ├── adicional-1.webp
│   │   └── adicional-2.webp
│   └── evento-2-id/
│       └── ...
```

### 4. **Verificar Backups del Sistema** (BUSCAR BACKUP POSTGRESQL)

```bash
npm run db:backup-diagnostics
```

Busca automáticamente:

- Archivos SQL de backup
- WAL archiving status
- Archivos WAL disponibles
- Rutas comunes de backup

### 5. **Rollback desde Backup JSON** (RESTAURAR DESDE EXPORT ANTERIOR)

```bash
npm run db:rollback-images -- ./backups/events-backup-2026-09-07.json
```

**¿Cuándo usar?**

- Ejecutaste `db:export-backup` ANTES del problema
- Tienes el archivo JSON con datos anteriores
- Quieres restaurar a ese estado

---

## 🛠️ Flujos de Recuperación

### FLUJO 1: Recuperar desde Filesystem (RECOMENDADO si las imágenes existen)

```bash
# 1. Ver el daño
npm run db:diagnostic-images

# 2. Crear backup de seguridad
npm run db:export-backup

# 3. Recuperar desde filesystem
npm run db:recover-images-fs -- /var/www/html/public/images
# O en Windows:
npm run db:recover-images-fs -- "C:\inetpub\wwwroot\images"

# 4. Verificar resultados
npm run db:diagnostic-images
```

### FLUJO 2: Recuperar desde Backup SQL

```bash
# 1. Respaldar estado actual
pg_dump -U postgres epicstoria > backup-actual-$(date +%s).sql

# 2. Restaurar desde backup previo
psql -U postgres epicstoria < backup-anterior.sql

# 3. Recuperar imágenes desde filesystem
npm run db:recover-images-fs -- /ruta/a/imagenes

# 4. Verificar
npm run db:diagnostic-images
```

### FLUJO 3: Recuperar desde Backup del Sistema

```bash
# 1. Buscar backups disponibles
npm run db:backup-diagnostics

# 2. Si hay backups automáticos, restaurar:
psql -U postgres epicstoria < /var/backups/postgresql/backup.sql

# 3. Luego seguir FLUJO 1 o 2
```

### FLUJO 4: Sin backup - Contactar Hosting

Si no tienes ningún backup:

1. **Accede al panel de control:**
   - **Hostinger:** cpanel/whm → Databases → MySQL/PostgreSQL
   - **AWS RDS:** Console → RDS → Snapshots
   - **Azure:** Portal → Backups
   - **DigitalOcean:** Manage → Backups
   - **OVH:** Web Hosting → Databases

2. **Pedir:**
   - Un backup anterior a 2026-09-08
   - O Point-in-Time Recovery (PITR) a un momento anterior

3. **Una vez tengas el backup:**
   - Seguir FLUJO 2 o 3

---

## ⚠️ ADVERTENCIAS IMPORTANTES

### NUNCA ejecutar sin backup:

```bash
# ❌ MAL
npm run db:convert-images-to-webp

# ✅ BIEN
npm run db:export-backup  # Primero crear backup
npm run db:recover-images-fs -- /ruta/imagenes  # Luego recuperar
```

### El script `convert-images-to-webp` tiene un BUG:

- Establece `additional_images = null` si está vacío
- Esto causa pérdida de datos
- **NUNCA usarlo** hasta que se corrija

### Script SEGURO alternativo:

```bash
npm run db:migrate-images-to-webp  # Este es más seguro (idempotente)
```

---

## 🔍 Troubleshooting

### "No se encontró la carpeta de imágenes"

```bash
# Verificar dónde están las imágenes en tu servidor
find /var -name "*imag*" -type d 2>/dev/null
find /home -name "*public*" -type d 2>/dev/null
find /opt -name "*images*" -type d 2>/dev/null

# Luego usar la ruta correcta:
npm run db:recover-images-fs -- /ruta/correcta
```

### "No se encontraron archivos SQL de backup"

```bash
# Buscar en todas partes
find / -name "*.sql" -type f 2>/dev/null | head -20

# O contactar hosting para acceso a backups
```

### "Error de permisos al restaurar"

```bash
# Asegurarse de que PostgreSQL puede acceder:
sudo chown postgres:postgres backup.sql
psql -U postgres epicstoria < backup.sql
```

### "additional_images sigue vacío después de recuperar"

```bash
# Posible problema: Las imágenes no existen en filesystem
# Solución: Verificar que existan:
ls -la /ruta/a/imagenes/eventos/*/

# Si no existen, el backup está corrupto
# Contactar hosting para backup anterior
```

---

## 📞 Contactar Hosting

Si nada funciona, contacta al hosting con esta información:

**Asunto:** Recuperación de datos - Backup de base de datos PostgreSQL

**Mensaje:**

```
Necesito recuperar una base de datos PostgreSQL (epicstoria)
a un punto anterior a 2026-09-08 12:00 UTC.

Datos necesarios:
1. Un backup (.sql) o punto de restauración Point-in-Time Recovery (PITR)
2. Confirmación de que la tabla 'events' tenga el campo 'additional_images' poblado

Información:
- Base de datos: epicstoria
- Usuario: postgres
- Tabla afectada: events
- Campo: additional_images
- Fecha aproximada del incidente: 2026-09-08
```

---

## ✅ Checklist de Recuperación

- [ ] Ejecutar `npm run db:diagnostic-images` para ver el daño
- [ ] Crear backup actual con `npm run db:export-backup`
- [ ] Elegir método de recuperación (filesystem, backup SQL, etc)
- [ ] Ejecutar recuperación (`npm run db:recover-images-fs` o restaurar BD)
- [ ] Verificar resultados con `npm run db:diagnostic-images`
- [ ] Si bien, actualizar el script `convert-images-to-webp` para evitar bug
- [ ] Si mal, contactar hosting o intentar siguiente método

---

## 🎯 Próximos Pasos

### 1. Recuperar el daño (AHORA)

```bash
npm run db:recovery-wizard
```

### 2. Prevenir en el futuro

- Usar `db:migrate-images-to-webp` en vez de `db:convert-images-to-webp`
- Siempre ejecutar `db:export-backup` antes de cambios
- Ejecutar `db:diagnostic-images` después de cambios
- Configurar backups automáticos en hosting

### 3. Actualizar script (CÓDIGO)

Ver archivo: `backend/src/database/convert-images-to-webp.ts`
Línea problemática: establece `null` si array está vacío
Cambiar a: mantener array original si conversión falla

---

## 📚 Referencias Técnicas

**Archivo con el bug:**

- `backend/src/database/convert-images-to-webp.ts`

**Script alternativo más seguro:**

- `backend/src/database/migrate-images-to-webp.ts`

**Scripts de recuperación creados:**

- `backend/src/database/diagnostic-images.ts` - Diagnóstico
- `backend/src/database/export-events-backup.ts` - Crear backup
- `backend/src/database/recover-images-from-filesystem.ts` - Recuperar desde filesystem
- `backend/src/database/postgres-backup-diagnostics.ts` - Buscar backups
- `backend/src/database/recovery-wizard.ts` - Wizard interactivo

---

¿Preguntas? Ejecuta primero el wizard:

```bash
cd backend
npm run db:recovery-wizard
```
