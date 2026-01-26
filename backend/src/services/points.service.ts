import { query } from '../config/database';
import { AppError } from '../middleware/error.middleware';
import { PointsHistory, QuizCompletion, QuizCompletionRequest } from '../models/user.model';

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
   * No se permite repetir hasta después de 1 semana
   */
  static async canTakeQuiz(userId: number, eventId: string): Promise<boolean> {
    const result = await query(
      `SELECT completed_at
       FROM quiz_completions
       WHERE user_id = $1 AND event_id = $2
       ORDER BY completed_at DESC
       LIMIT 1`,
      [userId, eventId],
    );

    if (result.rows.length === 0) {
      return true; // No ha completado el quiz antes
    }

    const lastCompletion = new Date(result.rows[0].completed_at);
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    return lastCompletion < oneWeekAgo;
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
      throw new AppError('You must wait 1 week before retaking this quiz', 400);
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
        await query('UPDATE users SET points = points + $1 WHERE id = $2', [pointsEarned, userId]);

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
      await query('UPDATE users SET points = points + $1 WHERE id = $2', [points, userId]);

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
