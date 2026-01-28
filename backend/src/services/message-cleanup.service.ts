import pool from '../config/database';

export class MessageCleanupService {
  /**
   * Eliminar mensajes más antiguos de 7 días
   */
  static async deleteOldMessages(): Promise<number> {
    const result = await pool.query(
      `DELETE FROM messages
       WHERE created_at < NOW() - INTERVAL '7 days'`,
    );
    return result.rowCount || 0;
  }

  /**
   * Mantener solo los últimos 100 mensajes por conversación
   * Elimina los mensajes más antiguos cuando hay más de 100
   */
  static async limitMessagesPerConversation(): Promise<number> {
    // Obtener todas las conversaciones únicas (pares de usuarios)
    const conversations = await pool.query(`
      SELECT DISTINCT
        LEAST(sender_id, receiver_id) as user1,
        GREATEST(sender_id, receiver_id) as user2
      FROM messages
    `);

    let totalDeleted = 0;

    // Para cada conversación, mantener solo los últimos 100 mensajes
    for (const conv of conversations.rows) {
      const result = await pool.query(
        `DELETE FROM messages
         WHERE id IN (
           SELECT id FROM messages
           WHERE (sender_id = $1 AND receiver_id = $2)
              OR (sender_id = $2 AND receiver_id = $1)
           ORDER BY created_at DESC
           OFFSET 100
         )`,
        [conv.user1, conv.user2],
      );
      totalDeleted += result.rowCount || 0;
    }

    return totalDeleted;
  }

  /**
   * Ejecutar limpieza completa
   */
  static async runCleanup(): Promise<{ oldDeleted: number; excessDeleted: number }> {
    const oldDeleted = await this.deleteOldMessages();
    const excessDeleted = await this.limitMessagesPerConversation();

    return { oldDeleted, excessDeleted };
  }
}
