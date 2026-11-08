/**
 * Script de diagnóstico (solo lectura): Comprobar estado actual de las imágenes Voyager
 *
 * Ejecutar: npm run db:check-voyager-paths
 */

import { PoolClient } from 'pg';
import pool from '../config/database';

const VOYAGER1_OLD_URL = '/images/eventos/Voyager/Voyager-1.webp';
const VOYAGER1_NEW_URL = '/images/eventos/Voyager1/Voyager1.webp';
const VOYAGER2_OLD_URL = '/images/eventos/Voyager/Voyager-2.webp';
const VOYAGER2_NEW_URL = '/images/eventos/Voyager2/Voyager2.webp';

export async function checkVoyagerImagePaths(client: PoolClient): Promise<void> {
  console.log('🔍 Diagnóstico de rutas de imágenes Voyager');
  console.log(`   Fecha/hora: ${new Date().toISOString()}`);

  // --- Voyager 1 ---
  console.log('1️⃣  Voyager 1');

  const v1Old = await client.query(
    `SELECT id, slug, title, image_url, additional_images FROM events WHERE image_url = $1`,
    [VOYAGER1_OLD_URL],
  );
  const v1New = await client.query(
    `SELECT id, slug, title, image_url, additional_images FROM events WHERE image_url = $1`,
    [VOYAGER1_NEW_URL],
  );

  if (v1Old.rows.length > 0) {
    console.log('   ❌ MIGRACIÓN NO EJECUTADA — aún tiene la ruta antigua:');
    console.log(`      image_url: ${v1Old.rows[0].image_url}`);
    console.log(`      additional_images: ${JSON.stringify(v1Old.rows[0].additional_images)}`);
  } else if (v1New.rows.length > 0) {
    console.log('   ✅ MIGRACIÓN APLICADA — ruta nueva encontrada:');
    console.log(`      image_url: ${v1New.rows[0].image_url}`);
    console.log(`      additional_images: ${JSON.stringify(v1New.rows[0].additional_images)}`);
  } else {
    console.log('   ⚠️  Evento Voyager 1 NO encontrado con ninguna de las dos rutas.');
    console.log(`      Buscado (antigua): ${VOYAGER1_OLD_URL}`);
    console.log(`      Buscado (nueva):   ${VOYAGER1_NEW_URL}`);
  }

  // --- Voyager 2 ---
  console.log('2️⃣  Voyager 2');

  const v2Old = await client.query(
    `SELECT id, slug, title, image_url, additional_images FROM events WHERE image_url = $1`,
    [VOYAGER2_OLD_URL],
  );
  const v2New = await client.query(
    `SELECT id, slug, title, image_url, additional_images FROM events WHERE image_url = $1`,
    [VOYAGER2_NEW_URL],
  );

  if (v2Old.rows.length > 0) {
    console.log('   ❌ MIGRACIÓN NO EJECUTADA — aún tiene la ruta antigua:');
    console.log(`      image_url: ${v2Old.rows[0].image_url}`);
    console.log(`      additional_images: ${JSON.stringify(v2Old.rows[0].additional_images)}`);
  } else if (v2New.rows.length > 0) {
    console.log('   ✅ MIGRACIÓN APLICADA — ruta nueva encontrada:');
    console.log(`      image_url: ${v2New.rows[0].image_url}`);
    console.log(`      additional_images: ${JSON.stringify(v2New.rows[0].additional_images)}`);
  } else {
    console.log('   ⚠️  Evento Voyager 2 NO encontrado con ninguna de las dos rutas.');
    console.log(`      Buscado (antigua): ${VOYAGER2_OLD_URL}`);
    console.log(`      Buscado (nueva):   ${VOYAGER2_NEW_URL}`);
  }

  console.log('✅ Diagnóstico Voyager completado');
}

// Punto de entrada cuando se ejecuta directamente como CLI
async function main() {
  const client = await pool.connect();
  try {
    await checkVoyagerImagePaths(client);
  } catch (error) {
    console.error('❌ Error durante el diagnóstico:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

main()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
