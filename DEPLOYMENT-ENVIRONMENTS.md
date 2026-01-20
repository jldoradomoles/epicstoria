# Guía de Ambientes de Despliegue - EpicStoria

## 🌍 Ambientes Disponibles

EpicStoria soporta tres ambientes diferentes con configuraciones específicas:

### 1️⃣ Desarrollo (Local)

**Archivo**: `src/environments/environment.ts`

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  useStaticData: false, // Usa backend PostgreSQL
};
```

**Características**:

- ✅ Backend completo con PostgreSQL
- ✅ Login y registro de usuarios
- ✅ Perfil de usuario
- ✅ Subida de archivos Excel
- ✅ Subida de imágenes
- ✅ Todas las funcionalidades

**Cómo ejecutar**:

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
npm start
```

**Acceso**: http://localhost:4200

---

### 2️⃣ GitHub Pages (Estático)

**Archivo**: `src/environments/environment.prod.ts`

```typescript
export const environment = {
  production: true,
  apiUrl: '',
  useStaticData: true, // Usa datos del JSON
};
```

**Características**:

- ✅ Visualización de eventos
- ✅ Búsqueda de eventos
- ✅ Galería de imágenes
- ✅ Quizzes interactivos
- ❌ No login/registro
- ❌ No perfil de usuario
- ❌ No subida de archivos

**Fuente de datos**: `public/data/events.json` (generado desde `eventos-plantilla.xlsx`)

**Cómo desplegar**:

```bash
npm run deploy
```

Este comando automáticamente:

1. Convierte `eventos-plantilla.xlsx` a `events.json`
2. Compila el frontend con `environment.prod.ts`
3. Ajusta rutas CSS para GitHub Pages
4. Despliega a GitHub Pages

**Acceso**: https://jldoradomoles.github.io/epicstoria/

---

### 3️⃣ Hostinger VPS (Producción Completa)

**Archivo**: `src/environments/environment.hostinger.ts`

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://tudominio.com/api',
  useStaticData: false, // Usa backend completo
};
```

**Características**:

- ✅ Backend completo con PostgreSQL
- ✅ Login y registro de usuarios
- ✅ Perfil de usuario
- ✅ Subida de archivos Excel
- ✅ Subida de imágenes
- ✅ Todas las funcionalidades
- ✅ SSL/HTTPS
- ✅ Dominio personalizado

**Cómo compilar**:

```bash
npm run build:hostinger
```

**Despliegue**: Ver [DESPLIEGUE-HOSTINGER-VPS.md](./DESPLIEGUE-HOSTINGER-VPS.md)

**Acceso**: https://tudominio.com

---

## 📊 Comparación de Ambientes

| Funcionalidad      | Desarrollo    | GitHub Pages | Hostinger VPS |
| ------------------ | ------------- | ------------ | ------------- |
| **Backend API**    | ✅ Local      | ❌ No        | ✅ Remoto     |
| **Base de Datos**  | ✅ PostgreSQL | ❌ JSON      | ✅ PostgreSQL |
| **Login/Registro** | ✅ Sí         | ❌ No        | ✅ Sí         |
| **Perfil Usuario** | ✅ Sí         | ❌ No        | ✅ Sí         |
| **Subir Excel**    | ✅ Sí         | ❌ No        | ✅ Sí         |
| **Subir Imágenes** | ✅ Sí         | ❌ No        | ✅ Sí         |
| **Ver Eventos**    | ✅ Sí         | ✅ Sí        | ✅ Sí         |
| **Buscar Eventos** | ✅ Sí         | ✅ Sí        | ✅ Sí         |
| **Galería**        | ✅ Sí         | ✅ Sí        | ✅ Sí         |
| **Quizzes**        | ✅ Sí         | ✅ Sí        | ✅ Sí         |
| **HTTPS**          | ❌ No         | ✅ Sí        | ✅ Sí         |
| **Dominio Custom** | ❌ No         | ❌ No        | ✅ Sí         |

---

## 🔄 Flujo de Trabajo Recomendado

### Para Desarrollo

```bash
# 1. Trabajar en local
cd backend && npm run dev
# En otra terminal:
npm start

# 2. Probar cambios en http://localhost:4200
```

### Para Preview Público (Sin Backend)

```bash
# 1. Actualizar eventos-plantilla.xlsx
# 2. Desplegar a GitHub Pages
npm run deploy

# 3. Ver en https://jldoradomoles.github.io/epicstoria/
```

### Para Producción Completa

```bash
# 1. Actualizar código en repositorio
git push origin main

# 2. En el servidor Hostinger
cd /var/www/epicstoria
git pull
npm run build:hostinger

# 3. Reiniciar servicios
pm2 restart epicstoria-backend
sudo systemctl reload nginx
```

---

## 🔧 Comandos Útiles

### NPM Scripts Disponibles

```bash
# Desarrollo
npm start                    # Servidor dev (localhost:4200)

# Builds
npm run build               # Build por defecto (producción)
npm run build:hostinger     # Build para Hostinger VPS
npm run build:gh-pages      # Build para GitHub Pages

# Despliegue
npm run deploy              # Despliega a GitHub Pages

# Utilidades
npm run excel:convert       # Convierte Excel a JSON
npm run excel:template      # Genera plantilla Excel
npm run format              # Formatea código
```

---

## 🚀 Cambiar de Ambiente

### Cambiar URL del Backend en Hostinger

1. Editar `src/environments/environment.hostinger.ts`
2. Cambiar `apiUrl` a tu dominio real
3. Recompilar: `npm run build:hostinger`

### Actualizar Eventos en GitHub Pages

1. Editar `eventos-plantilla.xlsx`
2. Ejecutar: `npm run deploy`
3. Los eventos se actualizarán automáticamente

### Actualizar Eventos en Hostinger

**Opción 1: Desde la aplicación web**

- Login como admin
- Ir a Perfil → Subir Excel

**Opción 2: Desde el servidor**

```bash
cd /var/www/epicstoria/backend
npm run db:seed  # Re-poblar DB desde seed
```

---

## 📝 Notas Importantes

1. **GitHub Pages** es ideal para demos y previews sin funcionalidad de usuario
2. **Hostinger VPS** es para producción completa con todas las funcionalidades
3. **Nunca commitear** archivos `.env` o credenciales
4. **Siempre probar** en desarrollo antes de desplegar
5. **Actualizar** `apiUrl` en `environment.hostinger.ts` con tu dominio real

---

## ❓ Preguntas Frecuentes

**P: ¿Puedo usar GitHub Pages con backend?**
R: No, GitHub Pages solo sirve archivos estáticos. Para backend necesitas Hostinger VPS.

**P: ¿Los datos de GitHub Pages se sincronizan con Hostinger?**
R: No, son ambientes independientes. GitHub Pages usa JSON, Hostinger usa PostgreSQL.

**P: ¿Cómo actualizo eventos en GitHub Pages?**
R: Edita `eventos-plantilla.xlsx` y ejecuta `npm run deploy`.

**P: ¿Necesito cambiar código para cambiar de ambiente?**
R: No, cada ambiente usa su propio archivo de environment automáticamente.

**P: ¿Puedo tener login en GitHub Pages?**
R: No, por diseño el login está desactivado cuando `useStaticData: true`.
