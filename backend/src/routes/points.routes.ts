import { Router } from 'express';
import { query } from '../config/database';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';
import { PointsService } from '../services/points.service';

const router = Router();

/**
 * POST /api/points/quiz
 * Completa un quiz y otorga puntos
 */
router.post('/quiz', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.userId;
    const quizData = req.body;

    // Validar datos requeridos
    if (
      !quizData.event_id ||
      quizData.score === undefined ||
      !quizData.total_questions ||
      !quizData.correct_answers
    ) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: event_id, score, total_questions, correct_answers',
      });
    }

    const completion = await PointsService.completeQuiz(userId, quizData);

    res.json({
      success: true,
      data: {
        completion,
        points_earned: completion.points_earned,
        can_retry_at: new Date(
          new Date(completion.completed_at).getTime() + 7 * 24 * 60 * 60 * 1000,
        ),
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/points/history
 * Obtiene el historial de puntos del usuario
 */
router.get('/history', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.userId;
    const history = await PointsService.getPointsHistory(userId);

    res.json({
      success: true,
      data: history,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/points/quiz-completions
 * Obtiene el historial de quizzes completados
 */
router.get('/quiz-completions', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.userId;
    const completions = await PointsService.getQuizCompletions(userId);

    res.json({
      success: true,
      data: completions,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/points/quiz/:eventId/status
 * Verifica si el usuario puede tomar el quiz de un evento
 */
router.get('/quiz/:eventId/status', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.userId;
    const eventId = req.params.eventId;

    const canTake = await PointsService.canTakeQuiz(userId, eventId);
    const lastCompletion = await PointsService.getLastQuizCompletion(userId, eventId);

    res.json({
      success: true,
      data: {
        can_take: canTake,
        last_completion: lastCompletion,
        retry_available_at: lastCompletion
          ? new Date(new Date(lastCompletion.completed_at).getTime() + 7 * 24 * 60 * 60 * 1000)
          : null,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/points/leaderboard
 * Obtiene la tabla de líderes con los usuarios con más puntos
 */
router.get('/leaderboard', async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = parseInt(req.query.offset as string) || 0;

    const result = await query(
      `SELECT
        u.id,
        u.name,
        u.lastname,
        u.nickname,
        u.avatar_url,
        u.points,
        u.created_at,
        FLOOR(u.points / 100) as stars,
        COUNT(DISTINCT qc.id) as quizzes_completed
      FROM users u
      LEFT JOIN quiz_completions qc ON u.id = qc.user_id
      WHERE u.points > 0 AND u.role != 'admin'
      GROUP BY u.id, u.name, u.lastname, u.nickname, u.avatar_url, u.points, u.created_at
      ORDER BY u.points DESC, u.created_at ASC
      LIMIT $1 OFFSET $2`,
      [limit, offset],
    );

    // Obtener el total de usuarios con puntos (excluyendo admins)
    const countResult = await query(
      "SELECT COUNT(*) as total FROM users WHERE points > 0 AND role != 'admin'",
      [],
    );

    res.json({
      success: true,
      data: {
        leaderboard: result.rows,
        total: parseInt(countResult.rows[0].total),
        limit,
        offset,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
