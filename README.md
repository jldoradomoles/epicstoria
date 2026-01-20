# Epicstoria

Plataforma interactiva para explorar eventos históricos con quiz educativos.

## 🏗️ Arquitectura

El proyecto consta de dos partes:

- **Frontend**: Angular 20+ con Tailwind CSS
- **Backend**: Node.js/Express con PostgreSQL

## � Documentación de Despliegue

EpicStoria soporta múltiples ambientes de despliegue:

- **[Guía de Ambientes](./DEPLOYMENT-ENVIRONMENTS.md)** - Comparación completa de ambientes (Desarrollo, GitHub Pages, Hostinger)
- **[Sistema de Datos Estáticos](./STATIC-DATA-SYSTEM.md)** - Cómo funciona el sistema para GitHub Pages
- **[Despliegue en Hostinger VPS](./DESPLIEGUE-HOSTINGER-VPS.md)** - Guía paso a paso para producción completa

## 🚀 Inicio Rápido (Desarrollo Local)

### Requisitos

- Node.js 18+
- Docker (para PostgreSQL) o PostgreSQL 15+ instalado localmente

### 1. Clonar e instalar

```bash
git clone https://github.com/jldoradomoles/epicstoria.git
cd epicstoria

# Frontend
npm install

# Backend
cd backend
npm install
```

### 2. Configurar base de datos

```bash
cd backend

# Opción A: Usando Docker (recomendado)
docker-compose up -d

# Opción B: PostgreSQL local
# Crear base de datos 'epicstoria' manualmente
```

### 3. Configurar variables de entorno

```bash
# El archivo .env ya viene configurado para desarrollo
# Edita backend/.env si necesitas cambiar algo
```

### 4. Ejecutar migraciones y seed

```bash
cd backend
npm run db:migrate  # Crear tablas
npm run db:seed     # Cargar eventos desde JSON
```

### 5. Iniciar servidores

```bash
# Terminal 1 - Backend (puerto 3000)
cd backend
npm run dev

# Terminal 2 - Frontend (puerto 4200)
npm start
```

Abre http://localhost:4200 en tu navegador.

## 📁 Estructura del Proyecto

```
epicstoria/
├── src/                    # Frontend Angular
│   ├── app/
│   │   ├── components/     # Componentes reutilizables
│   │   ├── guards/         # Guards de autenticación
│   │   ├── models/         # Interfaces TypeScript
│   │   ├── pages/          # Páginas/vistas
│   │   ├── pipes/          # Pipes personalizados
│   │   ├── services/       # Servicios (Auth, API)
│   │   └── utils/          # Utilidades
│   └── environments/       # Configuración de entornos
├── backend/                # Backend Node.js
│   ├── src/
│   │   ├── config/         # Configuración BD
│   │   ├── database/       # Migraciones y seeds
│   │   ├── middleware/     # Middleware (auth, error)
│   │   ├── models/         # Modelos de datos
│   │   ├── routes/         # Rutas API
│   │   └── services/       # Lógica de negocio
│   └── docker-compose.yml  # PostgreSQL en Docker
└── public/                 # Assets estáticos
    ├── data/               # Datos JSON (eventos)
    └── images/             # Imágenes
```

## 🔑 API Endpoints

### Autenticación

- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/profile` - Obtener perfil (auth)
- `PUT /api/auth/profile` - Actualizar perfil (auth)
- `PUT /api/auth/change-password` - Cambiar contraseña (auth)

### Eventos

- `GET /api/events` - Listar todos los eventos
- `GET /api/events/:id` - Obtener evento por ID
- `GET /api/events/categories` - Listar categorías
- `GET /api/events/category/:category` - Eventos por categoría
- `GET /api/events/search?q=term` - Buscar eventos
- `POST /api/events/upload` - Subir archivo Excel (admin)
- `POST /api/events/upload-image` - Subir imagen única (admin)
- `POST /api/events/upload-images` - Subir múltiples imágenes (admin)

## 👨‍💼 Funcionalidades de Administración

### Sistema de Subida de Datos

Los administradores tienen acceso a herramientas especiales en su perfil:

1. **Subida de Eventos por Excel** - Carga masiva de eventos desde archivo `.xlsx`
2. **Subida de Imágenes** - Sistema para subir imágenes de eventos (hasta 10 simultáneas, 5MB cada una)

Para más detalles, consulta:

- [SISTEMA-SUBIDA-IMAGENES.md](SISTEMA-SUBIDA-IMAGENES.md) - Documentación del sistema de imágenes
- [GUIA-NOMBRES-IMAGENES.md](GUIA-NOMBRES-IMAGENES.md) - Guía de buenas prácticas para nombrar imágenes
- [DESPLIEGUE-HOSTINGER-VPS.md](DESPLIEGUE-HOSTINGER-VPS.md) - Guía de despliegue en VPS

## 🛠️ Scripts Disponibles

### Frontend

```bash
npm start          # Servidor de desarrollo
npm run build      # Build de producción
npm run deploy     # Deploy a GitHub Pages
```

### Backend

```bash
npm run dev        # Servidor con hot reload
npm run build      # Compilar TypeScript
npm run db:migrate # Ejecutar migraciones
npm run db:seed    # Cargar datos iniciales
```

## 📝 Licencia

MIT

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
