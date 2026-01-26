import dotenv from 'dotenv';
import pool from '../config/database';

dotenv.config();

async function migratePointsSystem() {
  const client = await pool.connect();

  try {
    console.log('🔄 Starting points system migration...');

    await client.query('BEGIN');

    // 1. Agregar columna de puntos a la tabla users
    console.log('📊 Adding points column to users table...');
    await client.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 0 NOT NULL;
    `);

    // 2. Crear tabla de quiz_completions
    console.log('📝 Creating quiz_completions table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS quiz_completions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        event_id VARCHAR(255) NOT NULL,
        score NUMERIC(5, 2) NOT NULL,
        points_earned INTEGER NOT NULL DEFAULT 0,
        completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT quiz_completions_user_event_completed UNIQUE (user_id, event_id, completed_at)
      );
    `);

    // 3. Crear índices para quiz_completions
    console.log('🔍 Creating indexes for quiz_completions...');
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_quiz_completions_user_id
      ON quiz_completions(user_id);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_quiz_completions_event_id
      ON quiz_completions(event_id);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_quiz_completions_completed_at
      ON quiz_completions(completed_at);
    `);

    // 4. Crear tabla de points_history
    console.log('💰 Creating points_history table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS points_history (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        points INTEGER NOT NULL,
        source VARCHAR(50) NOT NULL CHECK (source IN ('quiz', 'game')),
        source_id VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 5. Crear índices para points_history
    console.log('🔍 Creating indexes for points_history...');
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_points_history_user_id
      ON points_history(user_id);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_points_history_created_at
      ON points_history(created_at);
    `);

    await client.query('COMMIT');

    console.log('✅ Points system migration completed successfully!');
    console.log('');
    console.log('📋 Summary:');
    console.log('  - Added points column to users table');
    console.log('  - Created quiz_completions table with indexes');
    console.log('  - Created points_history table with indexes');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Ejecutar la migración
migratePointsSystem().catch((error) => {
  console.error('Failed to run migration:', error);
  process.exit(1);
});
