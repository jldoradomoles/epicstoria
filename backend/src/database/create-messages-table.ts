import pool from '../config/database';

async function createMessagesTable() {
  try {
    console.log('🔄 Creando tabla de mensajes...');

    // Crear la tabla de mensajes
    await pool.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        receiver_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        message TEXT NOT NULL,
        read BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Crear índices para mejorar el rendimiento
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_messages_sender_receiver
      ON messages(sender_id, receiver_id);
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_messages_receiver
      ON messages(receiver_id);
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_messages_created_at
      ON messages(created_at);
    `);

    console.log('✅ Tabla de mensajes creada correctamente');

    // Verificar que la tabla existe
    const result = await pool.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'messages'
      ORDER BY ordinal_position;
    `);

    console.log('📋 Estructura de la tabla messages:');
    result.rows.forEach((row: any) => {
      console.log(`  - ${row.column_name}: ${row.data_type}`);
    });

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al crear tabla de mensajes:', error);
    await pool.end();
    process.exit(1);
  }
}

createMessagesTable();
