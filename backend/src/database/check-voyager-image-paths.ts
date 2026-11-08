/**
 * Script de diagnóstico (solo lectura): Comprobar estado actual de las imágenes Voyager
 *
 * Ejecutar: npm run db:check-voyager-paths
 */

import { PoolClient } from 'pg';
import pool from '../config/database';

const VOYAGER1_SLUG = 'voyager-1-1977';
const VOYAGER1_NEW_URL = '/images/eventos/Voyager1/Voyager1.webp';
const VOYAGER2_SLUG = 'voyager-2-1977';
const VOYAGER2_NEW_URL = '/images/eventos/Voyager2/Voyager2.webp';

export async function checkVoyagerImagePaths(client: PoolClient): Promise<void> {
  console.log('🔍 Diagnóstico de rutas de imágenes Voyager');
  console.log(`   Fecha/hora: ${new Date().toISOString()}`);

  // --- Voyager 1 ---
  console.log('1️⃣  Voyager 1');

  const v1 = await client.query(
    `SELECT id, slug, title, image_url, additional_images FROM events WHERE slug = $1`,
    [VOYAGER1_SLUG],
  );

  if (v1.rows.length === 0) {
    console.log(`   ⚠️  Evento no encontrado con slug "${VOYAGER1_SLUG}".`);
  } else if (v1.rows[0].image_url === VOYAGER1_NEW_URL) {
    console.log('   ✅ MIGRACIÓN APLICADA:');
    console.log(`      image_url: ${v1.rows[0].image_url}`);
    console.log(`      additional_images: ${JSON.stringify(v1.rows[0].additional_images)}`);
  } else {
    console.log('   ❌ MIGRACIÓN PENDIENTE — image_url actual:');
    console.log(`      image_url: ${v1.rows[0].image_url}`);
    console.log(`      additional_images: ${JSON.stringify(v1.rows[0].additional_images)}`);
  }

  // --- Voyager 2 ---
  console.log('2️⃣  Voyager 2');

  const v2 = await client.query(
    `SELECT id, slug, title, image_url, additional_images FROM events WHERE slug = $1`,
    [VOYAGER2_SLUG],
  );

  if (v2.rows.length === 0) {
    console.log(`   ⚠️  Evento no encontrado con slug "${VOYAGER2_SLUG}".`);
  } else if (v2.rows[0].image_url === VOYAGER2_NEW_URL) {
    console.log('   ✅ MIGRACIÓN APLICADA:');
    console.log(`      image_url: ${v2.rows[0].image_url}`);
    console.log(`      additional_images: ${JSON.stringify(v2.rows[0].additional_images)}`);
  } else {
    console.log('   ❌ MIGRACIÓN PENDIENTE — image_url actual:');
    console.log(`      image_url: ${v2.rows[0].image_url}`);
    console.log(`      additional_images: ${JSON.stringify(v2.rows[0].additional_images)}`);
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

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
