# Sistema de Puntos - Epicstoria

## Descripción General

Se ha implementado un sistema de puntos y estrellas para recompensar a los usuarios por completar quizzes y (en el futuro) ganar juegos. Este sistema gamifica la experiencia de aprendizaje y motiva a los usuarios a participar más.

## Características Principales

### 1. **Puntos**

- Los usuarios ganan puntos al completar quizzes de eventos
- Los puntos se otorgan basándose en el porcentaje de respuestas correctas:
  - **50% - 59%**: 5 puntos
  - **60% - 69%**: 6 puntos
  - **70% - 79%**: 7 puntos
  - **80% - 89%**: 8 puntos
  - **90% - 99%**: 9 puntos
  - **100%**: 10 puntos
- Los puntos se acumulan en el perfil del usuario
- No se ganan puntos si el puntaje es menor al 50%

### 2. **Estrellas**

- Se otorga **1 estrella por cada 100 puntos**
- Las estrellas se muestran visualmente en el perfil del usuario
- Barra de progreso hacia la próxima estrella

### 3. **Restricción de Repetición**

- Los quizzes de eventos **no se pueden repetir hasta después de 1 semana**
- Esto evita que los usuarios abusen del sistema para ganar puntos ilimitados
- El sistema rastrea la última vez que se completó cada quiz

## Estructura de Base de Datos

### Tabla: `users`

```sql
ALTER TABLE users ADD COLUMN points INTEGER DEFAULT 0 NOT NULL;
```

### Tabla: `quiz_completions`

```sql
CREATE TABLE quiz_completions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_id VARCHAR(255) NOT NULL,
  score NUMERIC(5, 2) NOT NULL,
  points_earned INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Tabla: `points_history`

```sql
CREATE TABLE points_history (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  points INTEGER NOT NULL,
  source VARCHAR(50) NOT NULL CHECK (source IN ('quiz', 'game')),
  source_id VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Endpoints de API

### POST `/api/points/quiz`

Completa un quiz y otorga puntos al usuario.

**Request Body:**

```json
{
  "event_id": "string",
  "score": 85.5,
  "total_questions": 5,
  "correct_answers": 4
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "completion": {
      "id": 1,
      "user_id": 1,
      "event_id": "event-123",
      "score": 85.5,
      "points_earned": 8,
      "completed_at": "2024-01-01T00:00:00Z"
    },
    "points_earned": 8,
    "can_retry_at": "2024-01-08T00:00:00Z"
  }
}
```

### GET `/api/points/history`

Obtiene el historial de puntos del usuario autenticado.

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "points": 8,
      "source": "quiz",
      "source_id": "event-123",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### GET `/api/points/quiz-completions`

Obtiene el historial de quizzes completados.

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "event_id": "event-123",
      "score": 85.5,
      "points_earned": 8,
      "completed_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### GET `/api/points/quiz/:eventId/status`

Verifica si el usuario puede tomar el quiz de un evento específico.

**Response:**

```json
{
  "success": true,
  "data": {
    "can_take": false,
    "last_completion": {
      "id": 1,
      "user_id": 1,
      "event_id": "event-123",
      "score": 85.5,
      "points_earned": 8,
      "completed_at": "2024-01-01T00:00:00Z"
    },
    "retry_available_at": "2024-01-08T00:00:00Z"
  }
}
```

## Servicios Frontend

### `PointsService`

Ubicación: `src/app/services/points.service.ts`

**Métodos principales:**

- `completeQuiz(data)`: Envía los resultados del quiz al backend
- `getPointsHistory()`: Obtiene el historial de puntos
- `getQuizCompletions()`: Obtiene los quizzes completados
- `getQuizStatus(eventId)`: Verifica si se puede tomar un quiz
- `calculatePoints(percentage)`: Calcula puntos basados en porcentaje
- `calculateStars(points)`: Calcula número de estrellas
- `getPointsToNextStar(points)`: Calcula puntos restantes para la próxima estrella

## Visualización en la UI

### Perfil de Usuario

El perfil del usuario muestra:

- **Total de puntos** acumulados
- **Estrellas** obtenidas (⭐)
- **Barra de progreso** hacia la próxima estrella
- **Puntos restantes** para la próxima estrella

### Resultados del Quiz

Al completar un quiz, se muestra:

- Porcentaje obtenido
- Puntos ganados (si aprobó con más del 50%)
- Mensaje indicando cuándo puede repetir el quiz (si ya lo había completado antes)
- Animación especial para puntos ganados

## Migración de Base de Datos

Para aplicar el sistema de puntos en una base de datos existente:

```bash
cd backend
npm run db:migrate-points
```

Este comando:

1. Agrega la columna `points` a la tabla `users`
2. Crea la tabla `quiz_completions`
3. Crea la tabla `points_history`
4. Crea índices para optimizar las consultas

## Extensibilidad Futura

El sistema está diseñado para ser extensible:

### Juegos

La tabla `points_history` tiene un campo `source` que puede ser:

- `'quiz'`: Puntos de quizzes
- `'game'`: Puntos de juegos (preparado para implementación futura)

Para agregar puntos por juegos, usar el método del servicio backend:

```typescript
PointsService.addPoints(userId, points, 'game', gameId);
```

### Niveles de Usuario

Se pueden implementar niveles basados en estrellas:

- Bronce: 1-5 estrellas
- Plata: 6-10 estrellas
- Oro: 11-20 estrellas
- Platino: 21+ estrellas

### Logros

Se puede crear una tabla de logros que se desbloqueen al alcanzar ciertos hitos:

- Primer quiz completado
- 10 quizzes completados
- 100 puntos acumulados
- 5 estrellas obtenidas
- etc.

## Consideraciones de Seguridad

1. **Autenticación requerida**: Todos los endpoints de puntos requieren autenticación JWT
2. **Validación server-side**: Los puntos se calculan en el servidor, no se confía en el cliente
3. **Restricción de tiempo**: Previene abuso mediante la restricción de 1 semana
4. **Transacciones**: Las operaciones de puntos usan transacciones SQL para consistencia

## Testing

### Probar el sistema manualmente:

1. Registrar/iniciar sesión como usuario
2. Completar un quiz de un evento
3. Verificar que se muestren los puntos ganados
4. Visitar el perfil para ver puntos y estrellas
5. Intentar repetir el mismo quiz (debería mostrar mensaje de espera)

### Probar después de 1 semana:

```sql
-- Modificar la fecha de completado para testing
UPDATE quiz_completions
SET completed_at = completed_at - INTERVAL '8 days'
WHERE user_id = [tu_user_id];
```

## Mantenimiento

### Consultas útiles:

```sql
-- Ver puntos de todos los usuarios
SELECT u.name, u.points,
       FLOOR(u.points / 100) as stars
FROM users u
ORDER BY u.points DESC;

-- Ver quizzes completados recientemente
SELECT qc.*, u.name, u.email
FROM quiz_completions qc
JOIN users u ON qc.user_id = u.id
ORDER BY qc.completed_at DESC
LIMIT 10;

-- Ver historial de puntos de un usuario
SELECT ph.*, u.name
FROM points_history ph
JOIN users u ON ph.user_id = u.id
WHERE ph.user_id = [user_id]
ORDER BY ph.created_at DESC;
```

## Soporte

Para preguntas o problemas relacionados con el sistema de puntos, contactar al equipo de desarrollo.
