/**
 * Script de migración para producción
 * Convierte todas las URLs de imágenes en la BD a extensión .webp
 *
 * Este script es idempotente - puede ejecutarse múltiples veces sin efecto
 *
 * Uso:
 *   npm run db:migrate-images-to-webp
 *
 * En producción:
 *   npm run db:migrate-images-to-webp
 */

import pool, { query } from '../config/database';

interface EventRow {
  id: string;
  title: string;
  image_url: string;
  additional_images: string[] | null;
}

/**
 * Convierte la extensión de una URL de imagen a .webp
 * Maneja rutas locales (/images/...) y URLs externas (http/https)
 */
function convertToWebp(imageUrl: string | null): string | null {
  if (!imageUrl) return null;

  // Si es una URL externa (http/https), dejarla como está
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }

  // Para rutas locales, cambiar la extensión a .webp (solo si no es ya .webp)
  if (imageUrl.includes('.webp')) {
    return imageUrl; // Ya es .webp, no hacer nada
  }

  return imageUrl.replace(/\.(jpg|jpeg|png|gif)$/i, '.webp');
}

/**
 * Migración de imágenes a .webp (idempotente)
 * Segura para ejecutar múltiples veces
 */
async function migrateImagesToWebp() {
  console.log('🎨 Iniciando migración de imágenes a .webp...\n');
  console.log('📅 Timestamp:', new Date().toISOString());
  console.log('Environment:', process.env.NODE_ENV || 'development');
  console.log('');

  try {
    // Obtener todos los eventos
    const result = await query(
      'SELECT id, title, image_url, additional_images FROM events ORDER BY title ASC',
    );
    const events: EventRow[] = result.rows;

    console.log(`📚 Se encontraron ${events.length} eventos\n`);

    if (events.length === 0) {
      console.log('✅ No hay eventos para procesar');
      process.exit(0);
    }

    const updates: Array<{
      id: string;
      title: string;
      oldImageUrl: string;
      newImageUrl: string;
      oldAdditional: string[];
      newAdditional: string[];
      changed: boolean;
    }> = [];

    // Procesar cada evento
    for (const event of events) {
      const newImageUrl = convertToWebp(event.image_url);
      const newAdditionalImages = (event.additional_images || [])
        .map(convertToWebp)
        .filter((url) => url !== null) as string[];

      const hasChanges =
        (newImageUrl !== null && newImageUrl !== event.image_url) ||
        JSON.stringify(newAdditionalImages) !== JSON.stringify(event.additional_images || []);

      updates.push({
        id: event.id,
        title: event.title,
        oldImageUrl: event.image_url,
        newImageUrl: newImageUrl || '',
        oldAdditional: event.additional_images || [],
        newAdditional: newAdditionalImages,
        changed: hasChanges,
      });
    }

    const changedCount = updates.filter((u) => u.changed).length;

    if (changedCount === 0) {
      console.log('✅ Todas las imágenes ya están en formato .webp');
      console.log('📋 No hay cambios por aplicar\n');
      process.exit(0);
    }

    // Resumen de cambios
    console.log('='.repeat(80));
    console.log('📊 RESUMEN DE CAMBIOS:');
    console.log('='.repeat(80));
    console.log(`Total de eventos: ${events.length}`);
    console.log(`Eventos a actualizar: ${changedCount}`);
    console.log(`Eventos sin cambios: ${events.length - changedCount}`);
    console.log('');

    // Listar cambios
    const changedEvents = updates.filter((u) => u.changed);
    console.log('📋 Eventos con cambios:\n');
    changedEvents.forEach((update, index) => {
      console.log(`${index + 1}. "${update.title}"`);
      if (update.newImageUrl !== update.oldImageUrl) {
        console.log(`   📌 Imagen: ${update.oldImageUrl} → ${update.newImageUrl}`);
      }
      if (update.newAdditional.length > 0) {
        console.log(`   🖼️  ${update.newAdditional.length} imagen(s) adicional(es)`);
      }
    });

    console.log('\n' + '='.repeat(80));
    console.log('💾 Aplicando migración...\n');

    let successCount = 0;
    let errorCount = 0;

    // Aplicar los cambios
    for (const update of changedEvents) {
      try {
        const additionalImagesJson =
          update.newAdditional.length > 0 ? JSON.stringify(update.newAdditional) : null;

        await query(
          'UPDATE events SET image_url = $1, additional_images = $2::jsonb WHERE id = $3',
          [update.newImageUrl, additionalImagesJson, update.id],
        );

        console.log(`✅ "${update.title}"`);
        successCount++;
      } catch (error) {
        console.error(
          `❌ Error al actualizar "${update.title}" (ID: ${update.id}):`,
          (error as any).message,
        );
        errorCount++;
      }
    }

    console.log('\n' + '='.repeat(80));
    console.log('📊 RESULTADO FINAL:');
    console.log('='.repeat(80));
    console.log(`✅ Eventos actualizados exitosamente: ${successCount}`);
    console.log(`❌ Eventos con error: ${errorCount}`);
    console.log(`📋 Total de cambios: ${changedCount}`);
    console.log(`⏰ Completado en: ${new Date().toISOString()}`);
    console.log('='.repeat(80) + '\n');

    if (errorCount === 0) {
      console.log('🎉 Migración completada exitosamente!');
      process.exit(0);
    } else {
      console.log(
        `⚠️  Migración completada con ${errorCount} error(es). Por favor, revisa los logs.`,
      );
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error crítico durante la migración:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Ejecutar la migración
migrateImagesToWebp();
