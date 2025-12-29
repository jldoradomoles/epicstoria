# Epicstoria Backend

Backend API para la plataforma de eventos históricos Epicstoria.

## Requisitos

- Node.js 18+
- PostgreSQL 15+ (o Docker)

## Instalación

### 1. Instalar dependencias

```bash
cd backend
npm install
```

### 2. Configurar base de datos

#### Opción A: Usando Docker (recomendado)

```bash
docker-compose up -d
```

Esto levantará:

- PostgreSQL en `localhost:5432`
- pgAdmin en `localhost:5050` (admin@epicstoria.com / admin123)

#### Opción B: PostgreSQL local

Crear una base de datos llamada `epicstoria` en tu PostgreSQL local.

### 3. Configurar variables de entorno

```bash
cp .env.example .env
```

Edita `.env` con tus credenciales:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=epicstoria
DB_USER=postgres
DB_PASSWORD=postgres123

JWT_SECRET=tu_clave_secreta_muy_larga_y_segura
JWT_EXPIRES_IN=7d

PORT=3000
FRONTEND_URL=http://localhost:4200
```

### 4. Ejecutar migraciones

```bash
npm run db:migrate
```

### 5. Cargar datos iniciales (eventos)

```bash
npm run db:seed
```

### 6. Iniciar servidor

```bash
# Desarrollo (con hot reload)
npm run dev

# Producción
npm run build
npm start
```

## API Endpoints

### Autenticación

| Método | Endpoint                    | Descripción                        |
| ------ | --------------------------- | ---------------------------------- |
| POST   | `/api/auth/register`        | Registrar nuevo usuario            |
| POST   | `/api/auth/login`           | Iniciar sesión                     |
| GET    | `/api/auth/profile`         | Obtener perfil (requiere auth)     |
| PUT    | `/api/auth/profile`         | Actualizar perfil (requiere auth)  |
| PUT    | `/api/auth/change-password` | Cambiar contraseña (requiere auth) |

### Eventos

| Método | Endpoint                         | Descripción               |
| ------ | -------------------------------- | ------------------------- |
| GET    | `/api/events`                    | Obtener todos los eventos |
| GET    | `/api/events/:id`                | Obtener evento por ID     |
| GET    | `/api/events/categories`         | Obtener categorías        |
| GET    | `/api/events/category/:category` | Eventos por categoría     |
| GET    | `/api/events/search?q=term`      | Buscar eventos            |

### Usuarios

| Método | Endpoint        | Descripción                            |
| ------ | --------------- | -------------------------------------- |
| GET    | `/api/users/me` | Obtener usuario actual (requiere auth) |

## Estructura de la Base de Datos

### Tabla `users`

| Campo             | Tipo         | Descripción            |
| ----------------- | ------------ | ---------------------- |
| id                | SERIAL       | ID único               |
| email             | VARCHAR(255) | Email único            |
| password          | VARCHAR(255) | Password hasheado      |
| name              | VARCHAR(255) | Nombre                 |
| lastname          | VARCHAR(255) | Apellido               |
| avatar_url        | VARCHAR(500) | URL del avatar         |
| bio               | TEXT         | Biografía              |
| favorite_category | VARCHAR(100) | Categoría favorita     |
| created_at        | TIMESTAMP    | Fecha de creación      |
| updated_at        | TIMESTAMP    | Fecha de actualización |

### Tabla `events`

| Campo        | Tipo         | Descripción        |
| ------------ | ------------ | ------------------ |
| id           | VARCHAR(255) | ID único (slug)    |
| title        | VARCHAR(255) | Título             |
| date         | VARCHAR(50)  | Fecha del evento   |
| category     | VARCHAR(100) | Categoría          |
| image_url    | VARCHAR(500) | URL de la imagen   |
| summary      | JSONB        | Resumen            |
| context      | JSONB        | Contexto histórico |
| key_facts    | JSONB        | Datos curiosos     |
| timeline     | JSONB        | Cronología         |
| consequences | JSONB        | Consecuencias      |
