/**
 * Script de migración: Actualizar rutas de imágenes Voyager 1 y Voyager 2
 *
 * Contexto: Las carpetas se renombraron para evitar que la función de detección
 * automática de imágenes adicionales confundiera el número del evento (Voyager-1,
 * Voyager-2) con un sufijo de índice de imagen. Ahora cada evento tiene su propia
 * carpeta sin guión (Voyager1/, Voyager2/).
 *
 * Cambios:
 *   - images/eventos/Voyager/Voyager-1.webp  → images/eventos/Voyager1/Voyager1.webp
 *   - images/eventos/Voyager/Voyager-2.webp  → images/eventos/Voyager2/Voyager2.webp
 *   - additional_images de Voyager 1: se asignan explícitamente (antes vacíos)
 *   - additional_images de Voyager 2: se actualizan las rutas en el array JSONB
 *
 * Ejecutar: npm run db:update-voyager-paths
 */

import pool from '../config/database';

const VOYAGER1_SLUG = 'voyager-1-1977';
const VOYAGER1_NEW_URL = '/images/eventos/Voyager1/Voyager1.webp';
const VOYAGER1_ADDITIONAL = JSON.stringify([
  '/images/eventos/Voyager1/Voyager1-1.webp',
  '/images/eventos/Voyager1/Voyager1-2.webp',
  '/images/eventos/Voyager1/Voyager1-3.webp',
  '/images/eventos/Voyager1/Voyager1-4.webp',
]);

const VOYAGER2_SLUG = 'voyager-2-1977';
const VOYAGER2_NEW_URL = '/images/eventos/Voyager2/Voyager2.webp';
const VOYAGER2_ADDITIONAL = JSON.stringify([
  '/images/eventos/Voyager2/Voyager2-1.webp',
  '/images/eventos/Voyager2/Voyager2-2.webp',
  '/images/eventos/Voyager2/Voyager2-3.webp',
  '/images/eventos/Voyager2/Voyager2-4.webp',
  '/images/eventos/Voyager2/Voyager2-5.webp',
]);

async function updateVoyagerImagePaths() {
  const client = await pool.connect();

  try {
    console.log('🚀 Actualizando rutas de imágenes Voyager...\n');

    // --- Voyager 1 ---
    console.log('1️⃣  Voyager 1');

    const v1 = await client.query(
      `SELECT id, slug, title, image_url, additional_images FROM events WHERE slug = $1`,
      [VOYAGER1_SLUG],
    );

    if (v1.rows.length === 0) {
      console.log(`   ❌ Evento no encontrado con slug "${VOYAGER1_SLUG}", omitiendo.\n`);
    } else if (v1.rows[0].image_url === VOYAGER1_NEW_URL) {
      console.log(`   ⚠️  Ya migrado anteriormente (image_url ya es la nueva), omitiendo.\n`);
    } else {
      const row = v1.rows[0];
      console.log(`   Evento: "${row.title}" (slug: ${row.slug})`);
      console.log(`   image_url: ${row.image_url} → ${VOYAGER1_NEW_URL}`);
      console.log(`   additional_images antes: ${JSON.stringify(row.additional_images)}`);

      await client.query(
        `UPDATE events
         SET image_url = $1,
             additional_images = $2::jsonb
         WHERE id = $3`,
        [VOYAGER1_NEW_URL, VOYAGER1_ADDITIONAL, row.id],
      );

      console.log(`   additional_images después: ${VOYAGER1_ADDITIONAL}`);
      console.log('   ✅ Voyager 1 actualizado\n');
    }

    // --- Voyager 2 ---
    console.log('2️⃣  Voyager 2');

    const v2 = await client.query(
      `SELECT id, slug, title, image_url, additional_images FROM events WHERE slug = $1`,
      [VOYAGER2_SLUG],
    );

    if (v2.rows.length === 0) {
      console.log(`   ❌ Evento no encontrado con slug "${VOYAGER2_SLUG}", omitiendo.\n`);
    } else if (v2.rows[0].image_url === VOYAGER2_NEW_URL) {
      console.log(`   ⚠️  Ya migrado anteriormente (image_url ya es la nueva), omitiendo.\n`);
    } else {
      const row = v2.rows[0];
      console.log(`   Evento: "${row.title}" (slug: ${row.slug})`);
      console.log(`   image_url: ${row.image_url} → ${VOYAGER2_NEW_URL}`);
      console.log(`   additional_images antes: ${JSON.stringify(row.additional_images)}`);

      await client.query(
        `UPDATE events
         SET image_url = $1,
             additional_images = $2::jsonb
         WHERE id = $3`,
        [VOYAGER2_NEW_URL, VOYAGER2_ADDITIONAL, row.id],
      );

      const v2After = await client.query(
        `SELECT additional_images FROM events WHERE id = $1`,
        [row.id],
      );
      console.log(`   additional_images después: ${JSON.stringify(v2After.rows[0].additional_images)}`);
      console.log('   ✅ Voyager 2 actualizado\n');
    }

    // --- Verificación final ---
    console.log('3️⃣  Verificación final');
    const verify = await client.query(
      `SELECT title, slug, image_url, additional_images
       FROM events
       WHERE slug IN ($1, $2)
       ORDER BY title`,
      [VOYAGER1_SLUG, VOYAGER2_SLUG],
    );

    if (verify.rows.length === 0) {
      console.log('   ⚠️  Ningún evento Voyager encontrado en BD.');
    } else {
      verify.rows.forEach((row: any) => {
        console.log(`   ✓ ${row.title} (${row.slug})`);
        console.log(`     image_url: ${row.image_url}`);
        console.log(`     additional_images: ${JSON.stringify(row.additional_images)}`);
      });
    }

    console.log('\n✅ Migración completada\n');
  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

updateVoyagerImagePaths()
  .then(() => {
    console.log('✨ Listo');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Falló:', error);
    process.exit(1);
  });
