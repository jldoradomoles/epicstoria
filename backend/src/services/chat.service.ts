import pool from '../config/database';
import { Message } from '../models/message.model';

export class ChatService {
  /**
   * Obtener mensajes entre dos usuarios
   */
  static async getMessages(userId1: number, userId2: number): Promise<Message[]> {
    const result = await pool.query(
      `SELECT * FROM messages
       WHERE (sender_id = $1 AND receiver_id = $2)
          OR (sender_id = $2 AND receiver_id = $1)
       ORDER BY created_at ASC`,
      [userId1, userId2],
    );
    return result.rows;
  }

  /**
   * Enviar un mensaje
   */
  static async sendMessage(
    senderId: number,
    receiverId: number,
    message: string,
  ): Promise<Message> {
    // Insertar el nuevo mensaje
    const result = await pool.query(
      `INSERT INTO messages (sender_id, receiver_id, message, read, created_at)
       VALUES ($1, $2, $3, false, NOW())
       RETURNING *`,
      [senderId, receiverId, message],
    );

    // Verificar si hay más de 100 mensajes en la conversación
    // y eliminar los más antiguos si es necesario
    await pool.query(
      `DELETE FROM messages
       WHERE id IN (
         SELECT id FROM messages
         WHERE (sender_id = $1 AND receiver_id = $2)
            OR (sender_id = $2 AND receiver_id = $1)
         ORDER BY created_at DESC
         OFFSET 100
       )`,
      [senderId, receiverId],
    );

    return result.rows[0];
  }

  /**
   * Marcar mensajes como leídos
   */
  static async markAsRead(senderId: number, receiverId: number): Promise<number> {
    const result = await pool.query(
      `UPDATE messages
       SET read = true
       WHERE sender_id = $1 AND receiver_id = $2 AND read = false`,
      [senderId, receiverId],
    );
    return result.rowCount || 0;
  }

  /**
   * Obtener número de mensajes no leídos para un usuario
   */
  static async getUnreadCount(userId: number): Promise<number> {
    const result = await pool.query(
      `SELECT COUNT(*) as count FROM messages
       WHERE receiver_id = $1 AND read = false`,
      [userId],
    );
    return parseInt(result.rows[0].count);
  }

  /**
   * Eliminar un mensaje
   */
  static async deleteMessage(messageId: number, userId: number): Promise<boolean> {
    const result = await pool.query(
      `DELETE FROM messages
       WHERE id = $1 AND sender_id = $2`,
      [messageId, userId],
    );

    if (result.rowCount === 0) {
      throw new Error('Message not found or you are not the sender');
    }

    return true;
  }
}
