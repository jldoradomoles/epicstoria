import { pool } from '../config/database';

async function addPasswordResetColumns() {
  const client = await pool.connect();

  try {
    console.log('🔄 Agregando columnas para reset de contraseña...');

    // Verificar si las columnas ya existen
    const checkQuery = `
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'users'
        AND column_name IN ('reset_token', 'reset_token_expiry');
    `;

    const existingColumns = await client.query(checkQuery);

    if (existingColumns.rows.length > 0) {
      console.log(
        '⚠️  Las columnas ya existen:',
        existingColumns.rows.map((r) => r.column_name),
      );

      // Preguntar si queremos recrearlas
      console.log('🔄 Recreando columnas...');
      await client.query('ALTER TABLE users DROP COLUMN IF EXISTS reset_token;');
      await client.query('ALTER TABLE users DROP COLUMN IF EXISTS reset_token_expiry;');
    }

    // Agregar columnas
    await client.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255),
      ADD COLUMN IF NOT EXISTS reset_token_expiry TIMESTAMP;
    `);

    console.log('✅ Columnas agregadas exitosamente');

    // Verificar la estructura final
    const finalStructure = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'users'
      ORDER BY ordinal_position;
    `);

    console.log('\n📋 Estructura final de la tabla users:');
    finalStructure.rows.forEach((col) => {
      console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
  } catch (error) {
    console.error('❌ Error agregando columnas:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Ejecutar la migración
addPasswordResetColumns()
  .then(() => {
    console.log('\n✅ Migración completada');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error en la migración:', error);
    process.exit(1);
  });
