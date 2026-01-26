import pool from '../config/database';

async function migrateFriendships() {
  const client = await pool.connect();

  try {
    console.log('Starting friendships migration...');

    // Crear tabla de amistades
    await client.query(`
      CREATE TABLE IF NOT EXISTS friendships (
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        friend_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, friend_id),
        CHECK (user_id != friend_id)
      );
    `);
    console.log('✓ Friendships table created');

    // Crear índices para mejorar el rendimiento
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_friendships_user_id ON friendships(user_id);
    `);
    console.log('✓ Index on user_id created');

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_friendships_friend_id ON friendships(friend_id);
    `);
    console.log('✓ Index on friend_id created');

    console.log('Friendships migration completed successfully!');
  } catch (error) {
    console.error('Error during friendships migration:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Ejecutar migración
migrateFriendships()
  .then(() => {
    console.log('Migration finished');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
