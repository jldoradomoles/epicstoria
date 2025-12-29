# Epicstoria

Plataforma interactiva para explorar eventos históricos con quiz educativos.

## 🏗️ Arquitectura

El proyecto consta de dos partes:

- **Frontend**: Angular 20+ con Tailwind CSS
- **Backend**: Node.js/Express con PostgreSQL

## 🚀 Inicio Rápido

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
