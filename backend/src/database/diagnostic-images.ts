/**
 * Script de diagnóstico para verificar estado de imágenes en la BD
 * Genera un informe de qué eventos tienen imágenes adicionales vacías
 */

import * as fs from 'fs';
import { query } from '../config/database';

interface EventRow {
  id: string;
  title: string;
  image_url: string;
  additional_images: string[] | null;
}

/**
 * Diagnosticar estado de imágenes
 */
async function diagnosticImages() {
  console.log('🔍 Iniciando diagnóstico de imágenes...\n');

  try {
    const result = await query(
      'SELECT id, title, image_url, additional_images FROM events ORDER BY title ASC',
    );
    const events: EventRow[] = result.rows;

    console.log(`📚 Total de eventos: ${events.length}\n`);

    // Estadísticas
    const stats = {
      totalEvents: events.length,
      withImageUrl: 0,
      withoutImageUrl: 0,
      withAdditional: 0,
      withoutAdditional: 0,
      withAdditionalEmpty: 0,
      webpFormats: 0,
      oldFormats: 0,
    };

    const emptyAdditionalEvents: EventRow[] = [];

    for (const event of events) {
      if (event.image_url) stats.withImageUrl++;
      else stats.withoutImageUrl++;

      if (event.additional_images && event.additional_images.length > 0) {
        stats.withAdditional++;
      } else {
        stats.withoutAdditional++;
        emptyAdditionalEvents.push(event);
        if (!event.additional_images) {
          stats.withAdditionalEmpty++;
        }
      }

      if (event.image_url?.includes('.webp')) stats.webpFormats++;
      else if (event.image_url?.match(/\.(jpg|jpeg|png|gif)$/i)) stats.oldFormats++;
    }

    console.log('='.repeat(80));
    console.log('📊 ESTADÍSTICAS GENERALES:');
    console.log('='.repeat(80));
    console.log(`Total de eventos: ${stats.totalEvents}`);
    console.log(`Con imagen principal: ${stats.withImageUrl}`);
    console.log(`Sin imagen principal: ${stats.withoutImageUrl}`);
    console.log(`Con imágenes adicionales: ${stats.withAdditional}`);
    console.log(`Sin imágenes adicionales: ${stats.withoutAdditional}`);
    console.log(`  - NULL/vacías: ${stats.withAdditionalEmpty}`);
    console.log(`Formatos .webp: ${stats.webpFormats}`);
    console.log(`Formatos antiguos (.jpg/.png/.gif): ${stats.oldFormats}`);
    console.log('='.repeat(80) + '\n');

    // Mostrar eventos con additional_images vacías
    if (emptyAdditionalEvents.length > 0) {
      console.log('⚠️  EVENTOS SIN IMÁGENES ADICIONALES:');
      console.log('='.repeat(80));
      emptyAdditionalEvents.forEach((event, index) => {
        console.log(`${index + 1}. "${event.title}" (ID: ${event.id})`);
        console.log(`   Imagen principal: ${event.image_url}`);
        console.log(
          `   Imágenes adicionales: ${event.additional_images === null ? 'NULL' : 'array vacío'}`,
        );
      });
      console.log('='.repeat(80) + '\n');
    }

    // Generar reporte JSON
    const report = {
      timestamp: new Date().toISOString(),
      stats,
      eventsWithoutAdditional: emptyAdditionalEvents.map((e) => ({
        id: e.id,
        title: e.title,
        image_url: e.image_url,
        additional_images_status: e.additional_images === null ? 'NULL' : 'EMPTY_ARRAY',
      })),
    };

    const reportPath = `diagnostic-report-${new Date().toISOString().split('T')[0]}.json`;
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf-8');

    console.log(`💾 Reporte guardado en: ${reportPath}\n`);

    console.log('🔧 ACCIONES RECOMENDADAS:');
    console.log('='.repeat(80));
    if (stats.oldFormats > 0) {
      console.log(`❌ Aún hay ${stats.oldFormats} imágenes en formatos antiguos`);
      console.log('   → Ejecuta: npm run db:convert-images-to-webp (nuevamente)');
    }
    if (stats.withAdditionalEmpty > 0) {
      console.log(`⚠️  Hay ${stats.withAdditionalEmpty} eventos sin imágenes adicionales`);
      console.log('   → Si había un backup, ejecuta: npm run db:rollback-images -- <backup-file>');
    }
    console.log('='.repeat(80) + '\n');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  diagnosticImages().then(() => {
    process.exit(0);
  });
}

export default diagnosticImages;
