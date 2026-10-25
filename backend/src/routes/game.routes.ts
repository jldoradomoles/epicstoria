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
    const { game_id, score, max_score, difficulty } = req.body;

    // Validar datos requeridos
    if (!game_id || score === undefined || !max_score) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: game_id, score, max_score',
      });
    }

    // Calcular porcentaje de acierto
    const percentage = (score / max_score) * 100;
    let pointsEarned = 0;

    // Lógica de puntos basada en el porcentaje
    if (percentage >= 90) pointsEarned = 10;
    else if (percentage >= 80) pointsEarned = 8;
    else if (percentage >= 70) pointsEarned = 7;
    else if (percentage >= 60) pointsEarned = 6;
    else if (percentage >= 50) pointsEarned = 5;
    else if (percentage >= 40) pointsEarned = 3;
    else if (percentage >= 30) pointsEarned = 2;
    else if (percentage >= 20) pointsEarned = 1;
    else pointsEarned = 0;

    // Bonus por dificultad
    if (difficulty === 'hard') pointsEarned += 2;
    else if (difficulty === 'medium') pointsEarned += 1;

    // Otorgar puntos
    if (pointsEarned > 0) {
      await PointsService.addPoints(userId, pointsEarned, 'game', game_id);
    }

    res.json({
      success: true,
      data: {
        game_id,
        score,
        max_score,
        percentage: Math.round(percentage),
        points_earned: pointsEarned,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
