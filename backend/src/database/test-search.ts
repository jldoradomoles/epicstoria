import pool from '../config/database';

async function testSearch() {
  const client = await pool.connect();

  try {
    console.log('Testing search query...');

    // Primero, ver todos los usuarios
    const allUsers = await client.query('SELECT id, name, lastname, email FROM users LIMIT 5');
    console.log('\nPrimeros 5 usuarios:', allUsers.rows);

    // Probar búsqueda simple
    const searchTerm = 'Pa';
    const searchPattern = `%${searchTerm.toLowerCase()}%`;
    const currentUserId = 1; // Asume que existe un usuario con id 1

    console.log('\nBuscando con término:', searchTerm);
    console.log('Patrón:', searchPattern);

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

    console.log('\nResultados encontrados:', result.rows.length);
    console.log('Usuarios:', result.rows);
  } catch (error) {
    console.error('Error en búsqueda:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

testSearch();
