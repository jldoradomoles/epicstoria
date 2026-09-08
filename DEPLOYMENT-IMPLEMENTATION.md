# 📋 Guía de Implementación - Despliegue de Migración de Imágenes a .webp

## 🎯 Objetivo

Integrar el script de migración de imágenes a `.webp` en el proceso de despliegue de producción para que se ejecute automáticamente sin romper referencias en la aplicación.

## 📦 Archivos Incluidos

```
backend/
├── src/database/
│   ├── migrate-images-to-webp.ts      ← Script principal (idempotente)
│   ├── convert-images-to-webp.ts      ← Conversión rápida
│   ├── check-image-urls.ts            ← Verificación
│   ├── verify-image-urls.ts           ← Validación de URLs
│   └── normalize-placeholder-images.ts ← Limpieza de placeholders
├── scripts/
│   └── post-deploy.sh                 ← Script bash de post-deploy
└── package.json
    ├── db:migrate-images-to-webp      ← Comando principal
    ├── db:convert-images-to-webp      ← Alternativo rápido
    └── ... (otros comandos)

DEPLOYMENT-IMAGES-WEBP.md              ← Guía de despliegue detallada
```

## 🚀 Opciones de Despliegue

### Opción 1: Despliegue Manual (Recomendado para primeras veces)

**En servidor de producción**:

```bash
# 1. Navegar al directorio del proyecto
cd /var/www/epicstoria

# 2. Actualizar código
git pull origin main

# 3. Instalar/actualizar dependencias
cd backend
npm install --production=false

# 4. Compilar TypeScript
npm run build

# 5. Ejecutar migración de imágenes
npm run db:migrate-images-to-webp

# 6. Reiniciar servicios (según tu setup)
# Option A: Con PM2
pm2 reload ecosystem.config.js

# Option B: Con systemd
systemctl restart epicstoria-backend

# Option C: Con Docker
docker-compose restart epicstoria-backend
```

### Opción 2: Script Post-Deploy Automático

**Ejecutar el script bash**:

```bash
cd /var/www/epicstoria
bash backend/scripts/post-deploy.sh
```

El script automáticamente:

- ✅ Instala dependencias
- ✅ Compila código
- ✅ Ejecuta migración de imágenes
- ✅ Proporciona instrucciones para reiniciar

### Opción 3: GitHub Actions (CI/CD)

**Agregar a tu workflow de GitHub Actions**:

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: cd backend && npm install --production=false

      - name: Build
        run: cd backend && npm run build

      - name: Migrate images to WebP
        run: cd backend && npm run db:migrate-images-to-webp
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          NODE_ENV: production

      - name: Deploy to server
        run: |
          # Tu comando de despliegue aquí
          # Ejemplo: ssh deploy@server "cd /var/www/epicstoria && git pull && pm2 reload ecosystem.config.js"
```

### Opción 4: Despliegue con Docker

**Si usas Docker, agregar a tu Dockerfile o docker-compose.yml**:

```dockerfile
# Dockerfile.backend
FROM node:18

WORKDIR /app

COPY backend /app

RUN npm install --production=false
RUN npm run build

# Post-deploy hook
RUN npm run db:migrate-images-to-webp || true  # Continuar si falla

CMD ["npm", "start"]
```

O en `docker-compose.yml`:

```yaml
services:
  backend:
    build:
      context: .
      dockerfile: backend/Dockerfile
    environment:
      DATABASE_URL: ${DATABASE_URL}
      NODE_ENV: production
    volumes:
      - ./backend/logs:/app/logs
    restart: always
```

## 🔄 Flujo de Despliegue Recomendado

```
1. Developer hace push a main
         ↓
2. CI/CD inicia (GitHub Actions, etc.)
         ↓
3. Tests pasan ✅
         ↓
4. Build completado
         ↓
5. [NUEVO] npm run db:migrate-images-to-webp
         ↓
6. Deploy a producción
         ↓
7. Restart servicios (PM2, systemd, etc.)
         ↓
8. [NUEVO] npm run db:check-image-urls (verificación)
         ↓
9. ✅ Despliegue completado
```

## ⚙️ Variables de Entorno Requeridas

Asegurar que estas variables estén configuradas en producción:

```bash
# En .env.production o en el servidor
NODE_ENV=production
DATABASE_URL=postgresql://user:password@host:5432/epicstoria
PORT=3000
PUBLIC_DIR=/var/www/epicstoria/public  # Opcional, para migración
```

## 📊 Scripts de Utilidad

### Verificar estado actual

```bash
cd backend
npm run db:check-image-urls
```

Output esperado:

```
URLs de .webp: 28
URLs de .jpg: 0
URLs externas: 0
URLs rotas: 0
```

### Ejecutar migración manualmente (sin logs detallados)

```bash
cd backend
npm run db:convert-images-to-webp
```

### Normalizarimágenes de placeholder (si quedan)

```bash
cd backend
npm run db:normalize-placeholders
```

## ⚠️ Puntos Críticos

### 1. **Idempotencia**

✅ El script `migrate-images-to-webp` puede ejecutarse múltiples veces

- Detecta si una URL ya es `.webp`
- No hace cambios innecesarios
- Es seguro ejecutar en cada despliegue

### 2. **Conexión a BD**

- ⚠️ Asegurar que `DATABASE_URL` esté correctamente configurada
- ⚠️ BD debe estar accesible desde el servidor de despliegue
- ⚠️ Usuario de BD debe tener permisos UPDATE en tabla events

### 3. **Timing**

- ✅ Ejecutar durante ventanas de bajo tráfico si es posible
- ✅ La migración es rápida (~1-2 segundos para 28 eventos)
- ✅ No bloquea la aplicación si se ejecuta en paralelo

### 4. **Rollback**

Si es necesario revertir:

```bash
# 1. Revertir código
git revert <commit-hash>

# 2. Crear script de rollback si es necesario
cd backend
npm run db:convert-images-to-jpg  # (crear si es crítico)

# 3. Redeploy
```

## 🔍 Monitoreo Post-Despliegue

### Verificar logs

```bash
# Ver logs de backend
tail -f /var/www/epicstoria/logs/backend-out.log
tail -f /var/www/epicstoria/logs/backend-error.log

# Con systemd
journalctl -u epicstoria-backend -f
```

### Validar en navegador

1. Abrir http://produccion.com/eventos
2. Abrir DevTools → Network
3. Filtrar por "eventos" (imágenes)
4. Verificar que devuelven HTTP 200
5. Comprobar extensión es `.webp`

### Alertas a monitorear

- ❌ 404 errors en imágenes
- ❌ Errores de BD en logs
- ❌ Fallos en carga de eventos
- ✅ Todas las imágenes cargan con 200 OK

## 📝 Checklist Final

### Antes del despliegue

- [ ] Código mergeado a main
- [ ] Tests pasados
- [ ] Cambios testeados en staging
- [ ] BD de prod está backup-eada
- [ ] Variables de entorno configuradas

### Durante el despliegue

- [ ] Script de migración ejecutado sin errores
- [ ] Build completó correctamente
- [ ] Servicios restarteados
- [ ] Logs revisados sin errores

### Después del despliegue

- [ ] `npm run db:check-image-urls` muestra todas .webp
- [ ] Imágenes cargan en navegador
- [ ] No hay 404s en DevTools
- [ ] Performance similar o mejor

## 🆘 Troubleshooting

### Error: "Database connection failed"

```bash
# Verificar conexión
psql $DATABASE_URL -c "SELECT 1;"
```

### Error: "Permission denied for UPDATE"

```bash
# Verificar permisos de usuario en BD
psql $DATABASE_URL -c "GRANT UPDATE ON events TO your_user;"
```

### Las imágenes todavía muestran .jpg

```bash
# Ejecutar verificación
npm run db:check-image-urls

# Si falta alguna, ejecutar nuevamente
npm run db:migrate-images-to-webp
```

### Server se cayó después de migración

```bash
# Revisar logs
journalctl -u epicstoria-backend -n 50

# Si necesario, rollback
git revert HEAD
npm run build && npm start
```

## 📞 Soporte

Para preguntas o problemas:

1. Revisar logs en `/var/www/epicstoria/logs/`
2. Ejecutar `npm run db:check-image-urls`
3. Verificar que BD esté accesible
4. Consultar este documento

---

**Versión**: 1.0.0
**Última actualización**: 2026-09-07
**Compatibilidad**: PostgreSQL 10+, Node.js 18+, All OS
