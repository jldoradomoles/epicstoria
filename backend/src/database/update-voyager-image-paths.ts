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

const VOYAGER1_OLD_URL = '/images/eventos/Voyager/Voyager-1.webp';
const VOYAGER1_NEW_URL = '/images/eventos/Voyager1/Voyager1.webp';
const VOYAGER1_ADDITIONAL = JSON.stringify([
  '/images/eventos/Voyager1/Voyager1-1.webp',
  '/images/eventos/Voyager1/Voyager1-2.webp',
  '/images/eventos/Voyager1/Voyager1-3.webp',
  '/images/eventos/Voyager1/Voyager1-4.webp',
]);

const VOYAGER2_OLD_URL = '/images/eventos/Voyager/Voyager-2.webp';
const VOYAGER2_NEW_URL = '/images/eventos/Voyager2/Voyager2.webp';
const VOYAGER2_ADDITIONAL = JSON.stringify([
  '/images/eventos/Voyager2/Voyager2-1.webp',
  '/images/eventos/Voyager2/Voyager2-2.webp',
  '/images/eventos/Voyager2/Voyager2-3.webp',
  '/images/eventos/Voyager2/Voyager2-4.webp',
  '/images/eventos/Voyager2/Voyager2-5.webp',
]);
const VOYAGER2_OLD_PATH_FRAGMENT = 'eventos/Voyager/Voyager-2';
const VOYAGER2_NEW_PATH_FRAGMENT = 'eventos/Voyager2/Voyager2';

async function updateVoyagerImagePaths() {
  const client = await pool.connect();

  try {
    console.log('🚀 Actualizando rutas de imágenes Voyager...\n');

    // --- Voyager 1 ---
    console.log('1️⃣  Voyager 1');

    const v1Check = await client.query(
      `SELECT id, slug, title, image_url, additional_images FROM events WHERE image_url = $1`,
      [VOYAGER1_OLD_URL],
    );

    if (v1Check.rows.length === 0) {
      const alreadyMigrated = await client.query(
        `SELECT id FROM events WHERE image_url = $1`,
        [VOYAGER1_NEW_URL],
      );
      if (alreadyMigrated.rows.length > 0) {
        console.log('   ⚠️  Ya migrado anteriormente, omitiendo.\n');
      } else {
        console.log('   ⚠️  Evento no encontrado con la ruta antigua, omitiendo.\n');
      }
    } else {
      const v1 = v1Check.rows[0];
      console.log(`   Evento: "${v1.title}" (slug: ${v1.slug})`);
      console.log(`   image_url: ${v1.image_url} → ${VOYAGER1_NEW_URL}`);
      console.log(`   additional_images antes: ${JSON.stringify(v1.additional_images)}`);

      await client.query(
        `UPDATE events
         SET image_url = $1,
             additional_images = $2::jsonb
         WHERE id = $3`,
        [VOYAGER1_NEW_URL, VOYAGER1_ADDITIONAL, v1.id],
      );

      console.log(`   additional_images después: ${VOYAGER1_ADDITIONAL}`);
      console.log('   ✅ Voyager 1 actualizado\n');
    }

    // --- Voyager 2 ---
    console.log('2️⃣  Voyager 2');

    const v2Check = await client.query(
      `SELECT id, slug, title, image_url, additional_images FROM events WHERE image_url = $1`,
      [VOYAGER2_OLD_URL],
    );

    if (v2Check.rows.length === 0) {
      const alreadyMigrated = await client.query(
        `SELECT id FROM events WHERE image_url = $1`,
        [VOYAGER2_NEW_URL],
      );
      if (alreadyMigrated.rows.length > 0) {
        console.log('   ⚠️  Ya migrado anteriormente, omitiendo.\n');
      } else {
        console.log('   ⚠️  Evento no encontrado con la ruta antigua, omitiendo.\n');
      }
    } else {
      const v2 = v2Check.rows[0];
      console.log(`   Evento: "${v2.title}" (slug: ${v2.slug})`);
      console.log(`   image_url: ${v2.image_url} → ${VOYAGER2_NEW_URL}`);
      console.log(`   additional_images antes: ${JSON.stringify(v2.additional_images)}`);

      // Si ya tiene additional_images, reemplaza las rutas; si está vacío, asigna directamente
      const hasAdditional =
        Array.isArray(v2.additional_images) && v2.additional_images.length > 0;

      if (hasAdditional) {
        await client.query(
          `UPDATE events
           SET image_url = $1,
               additional_images = REPLACE(additional_images::text, $2, $3)::jsonb
           WHERE id = $4`,
          [VOYAGER2_NEW_URL, VOYAGER2_OLD_PATH_FRAGMENT, VOYAGER2_NEW_PATH_FRAGMENT, v2.id],
        );
      } else {
        await client.query(
          `UPDATE events
           SET image_url = $1,
               additional_images = $2::jsonb
           WHERE id = $3`,
          [VOYAGER2_NEW_URL, VOYAGER2_ADDITIONAL, v2.id],
        );
      }

      const v2After = await client.query(
        `SELECT additional_images FROM events WHERE id = $1`,
        [v2.id],
      );
      console.log(`   additional_images después: ${JSON.stringify(v2After.rows[0].additional_images)}`);
      console.log('   ✅ Voyager 2 actualizado\n');
    }

    // --- Verificación final ---
    console.log('3️⃣  Verificación final');
    const verify = await client.query(
      `SELECT title, image_url, additional_images
       FROM events
       WHERE image_url IN ($1, $2)
       ORDER BY title`,
      [VOYAGER1_NEW_URL, VOYAGER2_NEW_URL],
    );

    if (verify.rows.length === 0) {
      console.log('   ⚠️  Ningún evento con las nuevas rutas encontrado en BD.');
    } else {
      verify.rows.forEach((row: any) => {
        console.log(`   ✓ ${row.title}`);
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
