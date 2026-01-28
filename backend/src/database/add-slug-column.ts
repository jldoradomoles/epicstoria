/**
 * Script de migración: Agregar columna slug a la tabla events
 *
 * Este script:
 * 1. Agrega la columna slug a la tabla events
 * 2. Genera slugs para todos los eventos existentes
 * 3. Marca la columna slug como NOT NULL y UNIQUE
 *
 * Ejecutar: npm run ts-node src/database/add-slug-column.ts
 */

import pool from '../config/database';
import { generateEventSlug } from '../utils/slug.utils';

interface ExistingEvent {
  id: string;
  title: string;
  date: string;
}

async function addSlugColumn() {
  const client = await pool.connect();

  try {
    console.log('🚀 Iniciando migración: Agregar columna slug a events...\n');

    // 1. Agregar columna slug (nullable temporalmente)
    console.log('1️⃣ Agregando columna slug...');
    await client.query(`
      ALTER TABLE events
      ADD COLUMN IF NOT EXISTS slug VARCHAR(150);
    `);
    console.log('✅ Columna slug agregada\n');

    // 2. Obtener todos los eventos existentes
    console.log('2️⃣ Obteniendo eventos existentes...');
    const result = await client.query<ExistingEvent>(`
      SELECT id, title, date
      FROM events
      WHERE slug IS NULL
      ORDER BY date ASC;
    `);

    const events = result.rows;
    console.log(`✅ ${events.length} eventos encontrados\n`);

    // 3. Generar y actualizar slugs
    if (events.length > 0) {
      console.log('3️⃣ Generando slugs para eventos...');

      for (const event of events) {
        const slug = generateEventSlug(event.title, event.date);

        await client.query(
          `
          UPDATE events
          SET slug = $1
          WHERE id = $2;
        `,
          [slug, event.id],
        );

        console.log(`   ✓ ${event.title} → ${slug}`);
      }

      console.log(`\n✅ ${events.length} slugs generados\n`);
    }

    // 4. Verificar slugs duplicados
    console.log('4️⃣ Verificando slugs duplicados...');
    const duplicates = await client.query(`
      SELECT slug, COUNT(*) as count
      FROM events
      WHERE slug IS NOT NULL
      GROUP BY slug
      HAVING COUNT(*) > 1;
    `);

    if (duplicates.rows.length > 0) {
      console.warn('⚠️  Slugs duplicados encontrados:');
      duplicates.rows.forEach((dup: any) => {
        console.warn(`   - ${dup.slug}: ${dup.count} veces`);
      });
      console.warn('\n💡 Se agregarán sufijos numéricos...\n');

      // Resolver duplicados agregando sufijos
      for (const dup of duplicates.rows) {
        const dupeEvents = await client.query<ExistingEvent>(
          `
          SELECT id, title, date
          FROM events
          WHERE slug = $1
          ORDER BY date ASC;
        `,
          [dup.slug],
        );

        // El primero mantiene el slug original, los demás reciben sufijos
        for (let i = 1; i < dupeEvents.rows.length; i++) {
          const event = dupeEvents.rows[i];
          const newSlug = `${dup.slug}-${i + 1}`;

          await client.query(
            `
            UPDATE events
            SET slug = $1
            WHERE id = $2;
          `,
            [newSlug, event.id],
          );

          console.log(`   ✓ ${event.title} → ${newSlug}`);
        }
      }
    } else {
      console.log('✅ No hay slugs duplicados\n');
    }

    // 5. Agregar restricciones a la columna
    console.log('5️⃣ Agregando restricciones...');

    // Hacer la columna NOT NULL
    await client.query(`
      ALTER TABLE events
      ALTER COLUMN slug SET NOT NULL;
    `);
    console.log('   ✓ Columna slug marcada como NOT NULL');

    // Agregar índice único
    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS events_slug_idx
      ON events(slug);
    `);
    console.log('   ✓ Índice único creado para slug');

    console.log('\n✅ Migración completada exitosamente!\n');
    console.log('📊 Resumen:');
    console.log(`   - Eventos procesados: ${events.length}`);
    console.log('   - Columna slug: NOT NULL + UNIQUE');
    console.log('   - Índice único creado\n');
  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Ejecutar migración
addSlugColumn()
  .then(() => {
    console.log('✨ Migración finalizada');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Migración falló:', error);
    process.exit(1);
  });
