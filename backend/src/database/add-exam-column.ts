/**
 * Script de migración: Agregar columna exam a la tabla events
 *
 * Este script:
 * 1. Agrega la columna exam (JSONB) a la tabla events
 * 2. La columna es opcional y almacena hasta 20 preguntas de examen del Excel
 *
 * Ejecutar: npx ts-node src/database/add-exam-column.ts
 */

import pool from '../config/database';

async function addExamColumn() {
  const client = await pool.connect();

  try {
    console.log('🚀 Iniciando migración: Agregar columna exam a events...\n');

    // 1. Agregar columna exam como JSONB (nullable)
    console.log('1️⃣ Agregando columna exam...');
    await client.query(`
      ALTER TABLE events
      ADD COLUMN IF NOT EXISTS exam JSONB;
    `);
    console.log('✅ Columna exam agregada\n');

    // 2. Verificar la estructura de la tabla
    console.log('2️⃣ Verificando estructura de la tabla...');
    const result = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'events'
      ORDER BY ordinal_position;
    `);

    console.log('📋 Estructura de la tabla events:');
    console.table(result.rows);

    console.log('\n✅ Migración completada exitosamente!');
    console.log('\n📝 Notas:');
    console.log('   - La columna exam es opcional (nullable)');
    console.log('   - Almacena un array JSON de preguntas de examen');
    console.log('   - Formato esperado: [{ question, options, correctAnswer, explanation }]');
    console.log(
      '   - Los eventos sin exam usarán el sistema de generación automática de preguntas',
    );
  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Ejecutar la migración
addExamColumn()
  .then(() => {
    console.log('\n🎉 Script de migración finalizado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Error fatal:', error);
    process.exit(1);
  });
