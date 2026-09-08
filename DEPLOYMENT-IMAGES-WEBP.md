# 🚀 Guía de Despliegue - Migración de Imágenes a .webp

## 📋 Resumen

Este documento describe cómo desplegar la migración de URLs de imágenes de eventos de extensión `.jpg` a `.webp` en producción.

## 🎯 Objetivo

Convertir todas las URLs de imágenes en la base de datos de producción a formato `.webp` antes de subir las nuevas imágenes con esa extensión, evitando que se rompan las referencias en producción.

## 📋 Pasos de Despliegue

### Fase 1: Preparación en Desarrollo/Staging

1. **Hacer pull de los cambios más recientes**:

   ```bash
   git pull origin main
   ```

2. **Instalar dependencias**:

   ```bash
   cd backend
   npm install
   ```

3. **Probar el script en BD de staging** (si aplica):
   ```bash
   npm run db:migrate-images-to-webp
   ```

### Fase 2: Despliegue en Producción

**Opción A: Con la API ejecutando**

1. **SSH a servidor de producción**:

   ```bash
   ssh user@production.server
   ```

2. **Navegar al directorio del backend**:

   ```bash
   cd /path/to/epicstoria/backend
   ```

3. **Hacer pull de los cambios**:

   ```bash
   git pull origin main
   ```

4. **Instalar dependencias** (si hay cambios):

   ```bash
   npm install
   ```

5. **Ejecutar la migración**:

   ```bash
   npm run db:migrate-images-to-webp
   ```

6. **Reiniciar la API** (si es necesario):
   ```bash
   npm run build
   systemctl restart epicstoria-backend  # O el comando correspondiente
   ```

**Opción B: Automatizado en CI/CD**

1. Hacer push del branch a GitHub
2. El pipeline de CI/CD ejecutará automáticamente:
   - Compilar código TypeScript
   - Ejecutar migraciones pendientes (incluyendo `migrate-images-to-webp.ts`)
   - Desplegar la aplicación

### Fase 3: Verificación Post-Despliegue

1. **Verificar que la migración se completó correctamente**:

   ```bash
   npm run db:check-image-urls
   ```

2. **Confirmar que todas las URLs ahora usan `.webp`**:
   - Las salidas deben mostrar URLs como `/images/eventos/evento-name.webp`
   - No debe haber URLs con `.jpg`, `.png`, etc.

3. **Validar en la aplicación web**:
   - Abrir la página de eventos en producción
   - Verificar que las imágenes se cargan correctamente
   - Comprobar que no hay errores en la consola del navegador

## ⚠️ Consideraciones Importantes

### Idempotencia

✅ El script `migrate-images-to-webp.ts` es **idempotente**

- Puede ejecutarse múltiples veces sin efectos negativos
- Solo actualiza URLs que no sean ya `.webp`
- Es seguro ejecutar después de cada despliegue

### Rollback (si es necesario)

Si es necesario revertir el cambio:

```bash
# Volver a la versión anterior de la BD
git checkout HEAD~1 backend/src/database/migrate-images-to-webp.ts

# Convertir URLs de vuelta a .jpg
npm run db:convert-images-to-jpg  # (Comando no implementado, crear si es necesario)
```

### Timing Recomendado

- ✅ **Mejor**: Desplegar durante horas de bajo tráfico
- ✅ **Alternativa**: Ejecutar en paralelo si el servidor lo permite
- ❌ **No recomendado**: Durante picos de tráfico

## 📝 Scripts Disponibles

| Comando                             | Descripción                                    |
| ----------------------------------- | ---------------------------------------------- |
| `npm run db:migrate-images-to-webp` | Migración de BD (idempotente, para producción) |
| `npm run db:convert-images-to-webp` | Conversión rápida (sin logs detallados)        |
| `npm run db:check-image-urls`       | Verificar estado actual de URLs                |
| `npm run db:normalize-placeholders` | Corregir URLs de placeholder                   |

## 🔍 Monitoreo Post-Despliegue

### Logs a revisar

```bash
# Ver logs de la aplicación
journalctl -u epicstoria-backend -f  # Linux/systemd
tail -f /var/log/epicstoria/backend.log  # Según configuración

# Buscar errores de migración
grep -i "webp\|migration\|error" /var/log/epicstoria/backend.log
```

### Métricas a validar

- ✅ Todas las imágenes cargan correctamente
- ✅ No hay errores 404 en imágenes
- ✅ Performance similar o mejor (WebP es más comprimido)
- ✅ No hay alertas de BD

## 🆘 Solución de Problemas

### Error: "No se puede conectar a la BD"

- Verificar variables de entorno (`DATABASE_URL`, etc.)
- Confirmar que el servidor BD está disponible
- Revisar permisos de acceso a BD

### Error: "invalid input syntax for type json"

- Esto fue un problema en versiones anteriores del script
- La versión actual maneja correctamente el JSON para PostgreSQL
- Si aparece, revisar el log completo del error

### Las imágenes no cargan

1. Verificar que el servidor web sirve archivos `.webp`
2. Comprobar que las imágenes reales existen en disco con extensión `.webp`
3. Verificar permisos de lectura del directorio de imágenes

## ✅ Checklist de Despliegue

- [ ] Cambios mergeados a rama principal
- [ ] Tests pasados en CI/CD
- [ ] BD de producción tiene backup
- [ ] Script `migrate-images-to-webp.ts` presente en código
- [ ] Variables de entorno configuradas correctamente
- [ ] Ventana de mantenimiento comunicada a usuarios (si es necesario)
- [ ] Script de migración ejecutado exitosamente
- [ ] Verificación post-despliegue completada
- [ ] Logs revisados sin errores
- [ ] Usuarios confirman que imágenes cargan correctamente

## 📞 Contacto y Soporte

Si encuentras problemas durante el despliegue:

1. Revisa los logs del servidor
2. Ejecuta `npm run db:check-image-urls` para diagnosticar
3. Consulta el documento de troubleshooting en el repositorio

---

**Última actualización**: 2026-09-07
**Versión del script**: 1.0.0
**Compatible con**: PostgreSQL 10+, Node.js 18+
