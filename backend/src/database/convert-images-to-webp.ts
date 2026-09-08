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

  // Para rutas locales, cambiar la extensión a .webp
  return imageUrl.replace(/\.(jpg|jpeg|png|gif)$/i, '.webp');
}

/**
 * Script para convertir todas las URLs de imágenes en la BD a extensión .webp
 * Actualiza tanto image_url como additional_images
 */
async function convertImagesToWebp() {
  console.log('🎨 Iniciando conversión de imágenes a .webp...\n');

  try {
    // Obtener todos los eventos
    const result = await query(
      'SELECT id, title, image_url, additional_images FROM events ORDER BY title ASC',
    );
    const events: EventRow[] = result.rows;

    console.log(`📚 Se encontraron ${events.length} eventos en la base de datos\n`);

    if (events.length === 0) {
      console.log('✅ No hay eventos para actualizar');
      process.exit(0);
    }

    const updates: Array<{
      id: string;
      title: string;
      oldImageUrl: string;
      newImageUrl: string;
      oldAdditional: string[];
      newAdditional: string[];
    }> = [];

    // Procesar cada evento
    for (const event of events) {
      const newImageUrl = convertToWebp(event.image_url);
      const newAdditionalImages = (event.additional_images || [])
        .map(convertToWebp)
        .filter((url) => url !== null) as string[];

      const hasChanges =
        newImageUrl !== event.image_url ||
        JSON.stringify(newAdditionalImages) !== JSON.stringify(event.additional_images || []);

      if (hasChanges) {
        updates.push({
          id: event.id,
          title: event.title,
          oldImageUrl: event.image_url,
          newImageUrl: newImageUrl || '',
          oldAdditional: event.additional_images || [],
          newAdditional: newAdditionalImages,
        });
      }
    }

    if (updates.length === 0) {
      console.log('✅ Todas las imágenes ya están en formato .webp');
      process.exit(0);
    }

    // Mostrar resumen de cambios
    console.log('='.repeat(80));
    console.log('📊 RESUMEN DE CAMBIOS:');
    console.log('='.repeat(80));
    console.log(`Total de eventos: ${events.length}`);
    console.log(`Eventos a actualizar: ${updates.length}`);
    console.log(`Eventos sin cambios: ${events.length - updates.length}`);

    console.log('\n📋 Cambios a realizar:\n');

    updates.forEach((update, index) => {
      console.log(`${index + 1}. "${update.title}" (ID: ${update.id})`);
      if (update.newImageUrl !== update.oldImageUrl) {
        console.log(`   📌 Imagen principal:`);
        console.log(`      Antes:  ${update.oldImageUrl}`);
        console.log(`      Después: ${update.newImageUrl}`);
      }
      if (update.newAdditional.length > 0) {
        console.log(`   🖼️  Imágenes adicionales: ${update.newAdditional.length}`);
        update.newAdditional.forEach((img, i) => {
          console.log(`      ${i + 1}. ${img}`);
        });
      }
      console.log('');
    });

    console.log('='.repeat(80));
    console.log('💾 Aplicando cambios a la base de datos...\n');

    let successCount = 0;
    let errorCount = 0;

    // Aplicar los cambios
    for (const update of updates) {
      try {
        // Preparar additional_images: stringify si hay contenido, null si está vacío
        const additionalImagesValue =
          update.newAdditional.length > 0 ? JSON.stringify(update.newAdditional) : null;

        // Usar ::jsonb cast para PostgreSQL
        await query(
          'UPDATE events SET image_url = $1, additional_images = $2::jsonb WHERE id = $3',
          [update.newImageUrl, additionalImagesValue, update.id],
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
    console.log(`📋 Total de cambios: ${updates.length}`);
    console.log('='.repeat(80) + '\n');

    if (errorCount === 0) {
      console.log('🎉 Conversión completada exitosamente!');
    } else {
      console.log(
        `⚠️  Conversión completada con ${errorCount} error(es). Por favor, revisa los logs.`,
      );
    }

    process.exit(errorCount === 0 ? 0 : 1);
  } catch (error) {
    console.error('❌ Error durante la conversión:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

convertImagesToWebp();
