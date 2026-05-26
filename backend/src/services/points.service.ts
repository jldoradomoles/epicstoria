import { query } from '../config/database';
import { AppError } from '../middleware/error.middleware';
import { PointsHistory, QuizCompletion, QuizCompletionRequest } from '../models/user.model';
import { calculateLevel } from '../utils/levels';

export class PointsService {
  /**
   * Calcula los puntos basados en el porcentaje de aciertos
   * 50% = 5 puntos, 60% = 6 puntos, etc.
   */
  static calculatePoints(percentage: number): number {
    if (percentage < 50) {
      return 0;
    }
    // Redondear el porcentaje al múltiplo de 10 más cercano hacia abajo
    // y dividir por 10 para obtener los puntos
    return Math.floor(percentage / 10);
  }

  /**
   * Verifica si el usuario puede realizar el quiz de un evento
   * Reglas:
   * - Máximo 4 intentos por día mientras la nota sea inferior a 100%
   * - Si agota los 4 intentos, bloqueo de 1 día
   * - Si saca 100%, bloqueo de 1 día
   */
  static async canTakeQuiz(userId: number, eventId: string): Promise<boolean> {
    // Obtener la última completación del quiz
    const lastResult = await query(
      `SELECT score, completed_at
       FROM quiz_completions
       WHERE user_id = $1 AND event_id = $2
       ORDER BY completed_at DESC
       LIMIT 1`,
      [userId, eventId],
    );

    // Si nunca ha completado el quiz, puede tomarlo
    if (lastResult.rows.length === 0) {
      return true;
    }

    const lastCompletion = lastResult.rows[0];
    const lastScore = parseFloat(lastCompletion.score);
    const lastCompletedAt = new Date(lastCompletion.completed_at);
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Si sacó 100%, debe esperar 1 día
    if (lastScore >= 100) {
      return lastCompletedAt < oneDayAgo;
    }

    // Contar intentos en las últimas 24 horas
    const attemptsResult = await query(
      `SELECT COUNT(*) as attempts
       FROM quiz_completions
       WHERE user_id = $1 AND event_id = $2 AND completed_at > $3`,
      [userId, eventId, oneDayAgo],
    );

    const attempts = parseInt(attemptsResult.rows[0].attempts);

    // Si ha hecho 4 o más intentos en las últimas 24 horas, debe esperar
    return attempts < 4;
  }

  /**
   * Obtiene información detallada sobre el estado del quiz para un usuario
   */
  static async getQuizStatus(
    userId: number,
    eventId: string,
  ): Promise<{
    can_take: boolean;
    attempts_today: number;
    last_score: number | null;
    retry_available_at: Date | null;
  }> {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Obtener la última completación
    const lastResult = await query(
      `SELECT score, completed_at
       FROM quiz_completions
       WHERE user_id = $1 AND event_id = $2
       ORDER BY completed_at DESC
       LIMIT 1`,
      [userId, eventId],
    );

    // Contar intentos en las últimas 24 horas y obtener el más antiguo
    const attemptsResult = await query(
      `SELECT COUNT(*) as attempts, MIN(completed_at) as first_attempt
       FROM quiz_completions
       WHERE user_id = $1 AND event_id = $2 AND completed_at > $3`,
      [userId, eventId, oneDayAgo],
    );

    const attemptsToday = parseInt(attemptsResult.rows[0].attempts);
    const firstAttemptToday = attemptsResult.rows[0].first_attempt
      ? new Date(attemptsResult.rows[0].first_attempt)
      : null;
    const lastScore = lastResult.rows.length > 0 ? parseFloat(lastResult.rows[0].score) : null;
    const lastCompletedAt =
      lastResult.rows.length > 0 ? new Date(lastResult.rows[0].completed_at) : null;

    let canTake = true;
    let retryAvailableAt: Date | null = null;

    if (lastCompletedAt) {
      // Si sacó 100%, debe esperar 1 día desde la última completación
      if (lastScore !== null && lastScore >= 100) {
        const nextAvailable = new Date(lastCompletedAt.getTime() + 24 * 60 * 60 * 1000);
        if (now < nextAvailable) {
          canTake = false;
          retryAvailableAt = nextAvailable;
        }
      }
      // Si ha agotado los 4 intentos en las últimas 24 horas
      else if (attemptsToday >= 4 && firstAttemptToday) {
        canTake = false;
        // Puede volver a intentar 24 horas después del primer intento del día
        retryAvailableAt = new Date(firstAttemptToday.getTime() + 24 * 60 * 60 * 1000);
      }
    }

    return {
      can_take: canTake,
      attempts_today: attemptsToday,
      last_score: lastScore,
      retry_available_at: retryAvailableAt,
    };
  }

  /**
   * Registra la finalización de un quiz y otorga puntos
   */
  static async completeQuiz(
    userId: number,
    quizData: QuizCompletionRequest,
  ): Promise<QuizCompletion> {
    const { event_id, score, total_questions, correct_answers } = quizData;

    // Verificar si puede tomar el quiz
    const canTake = await this.canTakeQuiz(userId, event_id);
    if (!canTake) {
      const status = await this.getQuizStatus(userId, event_id);
      if (status.last_score !== null && status.last_score >= 100) {
        throw new AppError('You already achieved a perfect score. Try again after 24 hours.', 400);
      } else {
        throw new AppError(
          'You have reached the maximum attempts for today. Try again after 24 hours.',
          400,
        );
      }
    }

    // Calcular porcentaje y puntos
    const percentage = (correct_answers / total_questions) * 100;
    const pointsEarned = this.calculatePoints(percentage);

    // Iniciar transacción
    const client = await query('BEGIN', []);

    try {
      // Registrar la finalización del quiz
      const completionResult = await query(
        `INSERT INTO quiz_completions (user_id, event_id, score, points_earned)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [userId, event_id, percentage, pointsEarned],
      );

      const completion = completionResult.rows[0] as QuizCompletion;

      // Si se ganaron puntos, actualizar el total del usuario y registrar en historial
      if (pointsEarned > 0) {
        const updatedUser = await query(
          'UPDATE users SET points = points + $1 WHERE id = $2 RETURNING points',
          [pointsEarned, userId],
        );
        const newLevel = calculateLevel(updatedUser.rows[0].points);
        await query('UPDATE users SET level = $1 WHERE id = $2', [newLevel, userId]);

        await query(
          `INSERT INTO points_history (user_id, points, source, source_id)
           VALUES ($1, $2, $3, $4)`,
          [userId, pointsEarned, 'quiz', event_id],
        );
      }

      await query('COMMIT', []);

      return completion;
    } catch (error) {
      await query('ROLLBACK', []);
      throw error;
    }
  }

  /**
   * Obtiene el historial de puntos de un usuario
   */
  static async getPointsHistory(userId: number): Promise<PointsHistory[]> {
    const result = await query(
      `SELECT * FROM points_history
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 50`,
      [userId],
    );

    return result.rows as PointsHistory[];
  }

  /**
   * Obtiene las finalizaciones de quiz de un usuario
   */
  static async getQuizCompletions(userId: number): Promise<QuizCompletion[]> {
    const result = await query(
      `SELECT * FROM quiz_completions
       WHERE user_id = $1
       ORDER BY completed_at DESC
       LIMIT 50`,
      [userId],
    );

    return result.rows as QuizCompletion[];
  }

  /**
   * Obtiene el último quiz completado para un evento específico
   */
  static async getLastQuizCompletion(
    userId: number,
    eventId: string,
  ): Promise<QuizCompletion | null> {
    const result = await query(
      `SELECT * FROM quiz_completions
       WHERE user_id = $1 AND event_id = $2
       ORDER BY completed_at DESC
       LIMIT 1`,
      [userId, eventId],
    );

    return result.rows.length > 0 ? (result.rows[0] as QuizCompletion) : null;
  }

  /**
   * Calcula las estrellas basadas en los puntos (1 estrella cada 100 puntos)
   */
  static calculateStars(points: number): number {
    return Math.floor(points / 100);
  }

  /**
   * Añade puntos manualmente (para futuros juegos u otras fuentes)
   */
  static async addPoints(
    userId: number,
    points: number,
    source: 'quiz' | 'game',
    sourceId: string,
  ): Promise<void> {
    const client = await query('BEGIN', []);

    try {
      const updatedUser = await query(
        'UPDATE users SET points = points + $1 WHERE id = $2 RETURNING points',
        [points, userId],
      );
      const newLevel = calculateLevel(updatedUser.rows[0].points);
      await query('UPDATE users SET level = $1 WHERE id = $2', [newLevel, userId]);

      await query(
        `INSERT INTO points_history (user_id, points, source, source_id)
         VALUES ($1, $2, $3, $4)`,
        [userId, points, source, sourceId],
      );

      await query('COMMIT', []);
    } catch (error) {
      await query('ROLLBACK', []);
      throw error;
    }
  }
}
