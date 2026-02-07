import pool from '../config/database';

export interface FriendData {
  id: number;
  name: string;
  lastname?: string;
  email: string;
  points: number;
  created_at: Date;
}

export class FriendshipService {
  /**
   * Añade un amigo (relación unidireccional)
   */
  static async addFriend(userId: number, friendId: number): Promise<void> {
    const client = await pool.connect();

    try {
      // Verificar que el friend existe
      const friendCheck = await client.query('SELECT id FROM users WHERE id = $1', [friendId]);

      if (friendCheck.rows.length === 0) {
        throw new Error('User not found');
      }

      // Verificar que no sea el mismo usuario
      if (userId === friendId) {
        throw new Error('Cannot add yourself as friend');
      }

      // Insertar amistad (ignorar si ya existe)
      await client.query(
        `INSERT INTO friendships (user_id, friend_id)
         VALUES ($1, $2)
         ON CONFLICT (user_id, friend_id) DO NOTHING`,
        [userId, friendId],
      );
    } finally {
      client.release();
    }
  }

  /**
   * Elimina un amigo
   */
  static async removeFriend(userId: number, friendId: number): Promise<void> {
    const client = await pool.connect();

    try {
      await client.query('DELETE FROM friendships WHERE user_id = $1 AND friend_id = $2', [
        userId,
        friendId,
      ]);
    } finally {
      client.release();
    }
  }

  /**
   * Obtiene la lista de amigos de un usuario
   */
  static async getFriends(userId: number): Promise<FriendData[]> {
    const client = await pool.connect();

    try {
      const result = await client.query(
        `SELECT u.id, u.name, u.lastname, u.email, u.points, u.created_at
         FROM friendships f
         INNER JOIN users u ON f.friend_id = u.id
         WHERE f.user_id = $1
         ORDER BY u.name ASC`,
        [userId],
      );

      return result.rows;
    } finally {
      client.release();
    }
  }

  /**
   * Verifica si dos usuarios son amigos
   */
  static async areFriends(userId: number, friendId: number): Promise<boolean> {
    const client = await pool.connect();

    try {
      const result = await client.query(
        'SELECT 1 FROM friendships WHERE user_id = $1 AND friend_id = $2',
        [userId, friendId],
      );

      return result.rows.length > 0;
    } finally {
      client.release();
    }
  }

  /**
   * Buscar usuarios por nombre o email (para añadir amigos)
   */
  static async searchUsers(
    currentUserId: number,
    searchTerm: string,
  ): Promise<Array<FriendData & { isFriend: boolean }>> {
    const client = await pool.connect();

    try {
      const searchPattern = `%${searchTerm.toLowerCase()}%`;
      const result = await client.query(
        `SELECT
          u.id,
          u.name,
          u.lastname,
          u.email,
          u.points,
          u.created_at,
          CASE WHEN f.friend_id IS NOT NULL THEN true ELSE false END as is_friend
         FROM users u
         LEFT JOIN friendships f ON f.user_id = $1 AND f.friend_id = u.id
         WHERE u.id != $1
           AND (
             LOWER(u.name) LIKE $2
             OR LOWER(COALESCE(u.lastname, '')) LIKE $2
             OR LOWER(u.email) LIKE $2
             OR LOWER(CONCAT(u.name, ' ', COALESCE(u.lastname, ''))) LIKE $2
           )
         ORDER BY u.name ASC
         LIMIT 20`,
        [currentUserId, searchPattern],
      );

      return result.rows.map((row) => ({
        id: row.id,
        name: row.name,
        lastname: row.lastname,
        email: row.email,
        points: row.points,
        created_at: row.created_at,
        isFriend: row.is_friend,
      }));
    } finally {
      client.release();
    }
  }

  /**
   * Obtiene todos los usuarios (para mostrar fichas y poder añadir amigos)
   */
  static async getAllUsers(
    currentUserId: number,
  ): Promise<Array<FriendData & { isFriend: boolean }>> {
    const client = await pool.connect();

    try {
      console.log('Getting all users except userId:', currentUserId);
      const result = await client.query(
        `SELECT
          u.id,
          u.name,
          u.lastname,
          u.email,
          u.points,
          u.created_at,
          CASE WHEN f.friend_id IS NOT NULL THEN true ELSE false END as is_friend
         FROM users u
         LEFT JOIN friendships f ON f.user_id = $1 AND f.friend_id = u.id
         WHERE u.id != $1
         ORDER BY u.name ASC`,
        [currentUserId],
      );

      console.log(`Found ${result.rows.length} users (excluding current user)`);
      return result.rows.map((row) => ({
        id: row.id,
        name: row.name,
        lastname: row.lastname,
        email: row.email,
        points: row.points,
        created_at: row.created_at,
        isFriend: row.is_friend,
      }));
    } finally {
      client.release();
    }
  }
}
