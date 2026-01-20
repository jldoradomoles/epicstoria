# Sistema de Datos Estáticos para GitHub Pages

## 📋 Descripción

EpicStoria puede funcionar en dos modos:

1. **Modo Desarrollo** (con backend y base de datos PostgreSQL)
2. **Modo Producción/GitHub Pages** (datos estáticos desde JSON, sin autenticación)

## 🔧 Configuración

### Modo Desarrollo

```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  useStaticData: false, // Usa el backend
};
```

### Modo Producción (GitHub Pages)

```typescript
// src/environments/environment.prod.ts
export const environment = {
  production: true,
  apiUrl: '',
  useStaticData: true, // Usa datos del JSON
};
```

## 📊 Gestión de Eventos

### Actualizar eventos para GitHub Pages

1. **Edita el archivo Excel**: `eventos-plantilla.xlsx` en la raíz del proyecto

2. **Genera el JSON automáticamente** (se ejecuta antes de build:gh-pages):

   ```bash
   npm run excel:convert eventos-plantilla.xlsx public/data/events.json
   ```

3. **El archivo se genera en**: `public/data/events.json`

### Deploy a GitHub Pages

```bash
npm run deploy
```

Este comando automáticamente:

1. Convierte el Excel a JSON
2. Compila el proyecto en modo producción
3. Ajusta las rutas CSS para GitHub Pages
4. Despliega a GitHub Pages

## 🚫 Funcionalidades Desactivadas en GitHub Pages

Cuando `useStaticData: true`:

- ❌ Login de usuarios
- ❌ Registro de usuarios
- ❌ Perfil de usuario
- ❌ Subida de archivos Excel
- ❌ Subida de imágenes
- ✅ Visualización de eventos
- ✅ Búsqueda de eventos
- ✅ Filtrado por categorías
- ✅ Galería
- ✅ Quizzes

## 📁 Estructura de Archivos

```
epicstoria/
├── eventos-plantilla.xlsx          # Archivo fuente de eventos
├── public/
│   └── data/
│       └── events.json             # Generado automáticamente
├── src/
│   ├── environments/
│   │   ├── environment.ts          # Desarrollo
│   │   └── environment.prod.ts     # Producción
│   └── app/
│       ├── services/
│       │   └── event-api.service.ts  # Detecta modo y carga datos
│       └── guards/
│           └── auth.guard.ts         # Bloquea auth en modo estático
```

## 🔄 Flujo de Datos

### Desarrollo

```
EventApiService → Backend API → PostgreSQL → Response
```

### GitHub Pages

```
EventApiService → public/data/events.json → Response
```

## 💡 Notas Importantes

1. **El archivo `events.json` se genera automáticamente** durante el build de GitHub Pages
2. **No edites manualmente** el archivo `events.json`, siempre edita el Excel
3. **Las imágenes deben estar en** `public/images/eventos/`
4. **El sistema valida automáticamente** si las imágenes existen y usa placeholder si no

## 🎯 Ejemplo de Uso

Para agregar un nuevo evento:

1. Abre `eventos-plantilla.xlsx`
2. Agrega una nueva fila con los datos del evento
3. Asegúrate de que la imagen existe en `public/images/eventos/`
4. Ejecuta `npm run deploy`

¡Listo! El evento aparecerá en GitHub Pages.
