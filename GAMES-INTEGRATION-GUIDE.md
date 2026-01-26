# Guía de Integración de Juegos con Sistema de Puntos

## ✅ Infraestructura Existente

La infraestructura del sistema de puntos ya está **completamente preparada** para soportar juegos. No necesitas modificar la base de datos ni crear nuevas tablas.

### Base de Datos

- ✅ Tabla `points_history` con campo `source` que acepta: `'quiz'` o `'game'`
- ✅ Campo `points` en tabla `users` para acumular puntos totales
- ✅ Sistema de transacciones para garantizar consistencia

### Backend

- ✅ Método `PointsService.addPoints()` listo para usar
- ✅ Historial de puntos por fuente (quiz o game)
- ✅ Cálculo automático de estrellas

### Frontend

- ✅ Visualización de puntos totales en perfil
- ✅ Sistema de estrellas (1 estrella cada 100 puntos)
- ✅ Barra de progreso hacia siguiente estrella

## 🎮 Cómo Integrar un Nuevo Juego

### Paso 1: Crear el Modelo del Juego (Frontend)

```typescript
// src/app/models/game.model.ts
export interface GameResult {
  gameId: string;
  gameName: string;
  score: number;
  maxScore: number;
  timeElapsed?: number; // opcional, en segundos
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface GameCompletionRequest {
  game_id: string;
  score: number;
  max_score: number;
  time_elapsed?: number;
  difficulty?: string;
}
```

### Paso 2: Crear Tabla de Game Completions (Opcional)

Si quieres rastrear los juegos completados (similar a quiz_completions):

```sql
-- backend/src/database/migrate-games.ts
CREATE TABLE IF NOT EXISTS game_completions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  game_id VARCHAR(255) NOT NULL,
  score INTEGER NOT NULL,
  max_score INTEGER NOT NULL,
  points_earned INTEGER NOT NULL DEFAULT 0,
  difficulty VARCHAR(50),
  time_elapsed INTEGER,
  completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_game_completions_user_id ON game_completions(user_id);
CREATE INDEX idx_game_completions_game_id ON game_completions(game_id);
```

### Paso 3: Crear el Endpoint del Backend

```typescript
// backend/src/routes/game.routes.ts
import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';
import { PointsService } from '../services/points.service';

const router = Router();

/**
 * POST /api/games/complete
 * Registra la finalización de un juego y otorga puntos
 */
router.post('/complete', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.userId;
    const { game_id, score, max_score, time_elapsed, difficulty } = req.body;

    // Validar datos
    if (!game_id || score === undefined || !max_score) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: game_id, score, max_score',
      });
    }

    // Calcular puntos basados en el puntaje del juego
    const percentage = (score / max_score) * 100;
    let pointsEarned = 0;

    // Lógica de puntos - personalizable según el juego
    if (percentage >= 90) pointsEarned = 10;
    else if (percentage >= 80) pointsEarned = 8;
    else if (percentage >= 70) pointsEarned = 7;
    else if (percentage >= 60) pointsEarned = 6;
    else if (percentage >= 50) pointsEarned = 5;

    // Bonus por dificultad (opcional)
    if (difficulty === 'hard') pointsEarned += 2;
    else if (difficulty === 'medium') pointsEarned += 1;

    // Guardar en game_completions (si existe la tabla)
    // ... código para insertar en game_completions ...

    // Otorgar puntos usando el método existente
    if (pointsEarned > 0) {
      await PointsService.addPoints(userId, pointsEarned, 'game', game_id);
    }

    res.json({
      success: true,
      data: {
        points_earned: pointsEarned,
        percentage,
        score,
        max_score,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/games/completions
 * Obtiene el historial de juegos completados
 */
router.get('/completions', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.userId;
    // ... lógica para obtener game_completions ...
  } catch (error) {
    next(error);
  }
});

export default router;
```

### Paso 4: Registrar las Rutas en el Backend

```typescript
// backend/src/index.ts
import gameRoutes from './routes/game.routes';

// ...
app.use('/api/games', gameRoutes);
```

### Paso 5: Crear el Servicio del Frontend

```typescript
// src/app/services/game.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

export interface GameCompletionRequest {
  game_id: string;
  score: number;
  max_score: number;
  time_elapsed?: number;
  difficulty?: string;
}

export interface GameCompletionResponse {
  success: boolean;
  data: {
    points_earned: number;
    percentage: number;
    score: number;
    max_score: number;
  };
}

@Injectable({
  providedIn: 'root',
})
export class GameService {
  private apiUrl = `${environment.apiUrl}/games`;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
  ) {}

  /**
   * Envía el resultado del juego al backend
   */
  completeGame(data: GameCompletionRequest): Observable<GameCompletionResponse> {
    return this.http.post<GameCompletionResponse>(`${this.apiUrl}/complete`, data, {
      headers: this.authService.getAuthHeaders(),
    });
  }

  /**
   * Obtiene el historial de juegos completados
   */
  getGameCompletions(): Observable<any> {
    return this.http.get(`${this.apiUrl}/completions`, {
      headers: this.authService.getAuthHeaders(),
    });
  }
}
```

### Paso 6: Usar en el Componente del Juego

```typescript
// src/app/components/mi-juego/mi-juego.component.ts
import { Component } from '@angular/core';
import { GameService } from '../../services/game.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-mi-juego',
  templateUrl: './mi-juego.component.html',
})
export class MiJuegoComponent {
  gameScore = 0;
  maxScore = 100;
  gameId = 'memory-game'; // ID único del juego

  constructor(
    private gameService: GameService,
    private authService: AuthService,
  ) {}

  finishGame() {
    // Solo guardar si está autenticado
    if (!this.authService.isAuthenticated()) {
      this.showResults();
      return;
    }

    const gameData = {
      game_id: this.gameId,
      score: this.gameScore,
      max_score: this.maxScore,
      time_elapsed: this.getTimeElapsed(),
      difficulty: 'medium',
    };

    this.gameService.completeGame(gameData).subscribe({
      next: (response) => {
        console.log('Puntos ganados:', response.data.points_earned);
        // Actualizar perfil del usuario
        this.authService.refreshProfile();
        // Mostrar resultados con puntos
        this.showResultsWithPoints(response.data.points_earned);
      },
      error: (error) => {
        console.error('Error al guardar el juego:', error);
        this.showResults();
      },
    });
  }

  showResultsWithPoints(points: number) {
    // Mostrar UI con puntos ganados
    alert(`¡Felicitaciones! Ganaste ${points} puntos`);
  }

  showResults() {
    // Mostrar resultados sin puntos (usuario no autenticado)
    alert(`Tu puntaje: ${this.gameScore}/${this.maxScore}`);
  }

  getTimeElapsed(): number {
    // Implementar lógica para calcular tiempo
    return 0;
  }
}
```

## 📊 Ejemplos de Lógicas de Puntos

### Ejemplo 1: Puntos por Porcentaje (Similar a Quiz)

```typescript
const percentage = (score / maxScore) * 100;
const pointsEarned = percentage >= 50 ? Math.floor(percentage / 10) : 0;
```

### Ejemplo 2: Puntos Fijos por Nivel

```typescript
if (score >= maxScore * 0.9)
  pointsEarned = 10; // Excelente
else if (score >= maxScore * 0.7)
  pointsEarned = 7; // Bueno
else if (score >= maxScore * 0.5) pointsEarned = 5; // Aceptable
```

### Ejemplo 3: Puntos con Bonus por Velocidad

```typescript
let pointsEarned = Math.floor((score / maxScore) * 10);
if (timeElapsed < 30)
  pointsEarned += 3; // Bonus velocidad
else if (timeElapsed < 60) pointsEarned += 1;
```

### Ejemplo 4: Puntos Acumulativos

```typescript
// 1 punto por cada 10 puntos del juego
const pointsEarned = Math.floor(score / 10);
```

## 🔍 Consultas Útiles

### Ver puntos por fuente

```sql
SELECT
  u.name,
  SUM(CASE WHEN ph.source = 'quiz' THEN ph.points ELSE 0 END) as quiz_points,
  SUM(CASE WHEN ph.source = 'game' THEN ph.points ELSE 0 END) as game_points,
  u.points as total_points
FROM users u
LEFT JOIN points_history ph ON u.id = ph.user_id
GROUP BY u.id, u.name, u.points
ORDER BY u.points DESC;
```

### Ver historial mixto

```sql
SELECT
  ph.*,
  u.name,
  CASE
    WHEN ph.source = 'quiz' THEN 'Quiz'
    WHEN ph.source = 'game' THEN 'Juego'
  END as source_type
FROM points_history ph
JOIN users u ON ph.user_id = u.id
WHERE ph.user_id = [user_id]
ORDER BY ph.created_at DESC;
```

## 🎯 IDs Sugeridos para Juegos

Usa IDs descriptivos para identificar cada juego:

- `'memory-game'` - Juego de memoria
- `'trivia-general'` - Trivia general
- `'word-puzzle'` - Rompecabezas de palabras
- `'timeline-challenge'` - Desafío de cronología
- `'matching-pairs'` - Emparejar parejas
- `'quick-quiz'` - Quiz rápido

## ✅ Resumen

**Lo que YA está listo:**

- ✅ Base de datos preparada para múltiples fuentes de puntos
- ✅ Método `PointsService.addPoints()` funcionando
- ✅ Sistema de puntos y estrellas universal
- ✅ Visualización en perfil de usuario
- ✅ Historial de puntos por fuente

**Lo que necesitas hacer para cada juego:**

1. Crear el componente del juego
2. Definir la lógica de puntos del juego
3. Llamar a `gameService.completeGame()` cuando termine
4. (Opcional) Crear tabla de completions específica del juego
5. (Opcional) Implementar restricciones (ej: 1 vez por día)

**El sistema es flexible y soporta:**

- Diferentes lógicas de puntos para cada juego
- Bonus por dificultad, velocidad, precisión, etc.
- Historial separado por tipo de juego
- Restricciones personalizadas por juego
