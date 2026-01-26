import dotenv from 'dotenv';
import pool from '../config/database';

dotenv.config();

async function testPointsSystem() {
  const client = await pool.connect();

  try {
    console.log('🧪 Testing Points System...\n');

    // 1. Verificar tablas creadas
    console.log('📋 Checking tables...');
    const tablesResult = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('quiz_completions', 'points_history')
    `);
    console.log('✅ Tables found:', tablesResult.rows.map((r) => r.table_name).join(', '));

    // 2. Verificar columna points en users
    console.log('\n📊 Checking users table...');
    const columnsResult = await client.query(`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns
      WHERE table_name = 'users' AND column_name = 'points'
    `);
    if (columnsResult.rows.length > 0) {
      console.log('✅ Points column exists:', columnsResult.rows[0]);
    } else {
      console.log('❌ Points column not found!');
    }

    // 3. Verificar usuarios con puntos
    console.log('\n👥 Checking users with points...');
    const usersResult = await client.query(`
      SELECT id, name, email, points
      FROM users
      ORDER BY points DESC
      LIMIT 5
    `);
    console.log('Users:', usersResult.rows);

    // 4. Verificar quiz completions
    console.log('\n📝 Checking quiz completions...');
    const completionsResult = await client.query(`
      SELECT COUNT(*) as total FROM quiz_completions
    `);
    console.log('Total quiz completions:', completionsResult.rows[0].total);

    // 5. Verificar points history
    console.log('\n💰 Checking points history...');
    const historyResult = await client.query(`
      SELECT COUNT(*) as total FROM points_history
    `);
    console.log('Total points history entries:', historyResult.rows[0].total);

    console.log('\n✅ Points System Test Complete!');
  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Ejecutar test
testPointsSystem().catch((error) => {
  console.error('Failed to run test:', error);
  process.exit(1);
});
