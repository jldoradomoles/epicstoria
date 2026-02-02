/**
 * Script para detectar y actualizar automáticamente las imágenes adicionales
 * de todos los eventos existentes en la base de datos
 */

import * as fs from 'fs';
import * as path from 'path';
import { query } from '../config/database';

interface Event {
  id: string;
  title: string;
  image_url: string;
  additional_images: string[] | null;
}

/**
 * Detecta automáticamente imágenes adicionales con el patrón nombre-2, nombre-3, etc.
 */
function detectAdditionalImages(imageUrl: string): string[] {
  if (!imageUrl || imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return [];
  }

  const additionalImages: string[] = [];
  let imagePath = imageUrl.replace(/^\//, '');

  // Si la ruta no incluye 'eventos', agregarla
  if (!imagePath.includes('eventos/') && !imagePath.startsWith('http')) {
    // Extraer solo el nombre del archivo
    const fileName = imagePath.split('/').pop() || imagePath;
    imagePath = `images/eventos/${fileName}`;
  }

  // Extraer directorio, nombre base y extensión
  const pathMatch = imagePath.match(/^(.+\/)?(.+?)(\.[^.]+)$/);
  if (!pathMatch) {
    return [];
  }

  const directory = pathMatch[1] || '';
  const baseName = pathMatch[2];
  const extension = pathMatch[3];

  // Buscar imágenes con sufijo -2, -3, -4, etc. hasta -10
  for (let i = 2; i <= 10; i++) {
    const additionalImagePath = `${directory}${baseName}-${i}${extension}`;
    const fullPath = path.join(__dirname, '../../../public', additionalImagePath);

    if (fs.existsSync(fullPath)) {
      additionalImages.push(`/${additionalImagePath}`);
    } else {
      // Si no encontramos una imagen, dejar de buscar
      break;
    }
  }

  return additionalImages;
}

async function detectAndUpdateAdditionalImages() {
  console.log('🔍 Detectando imágenes adicionales para todos los eventos...\n');

  try {
    // Obtener todos los eventos
    const result = await query('SELECT id, title, image_url, additional_images FROM events');
    const events = result.rows as Event[];

    console.log(`📊 Total de eventos: ${events.length}\n`);

    let updatedCount = 0;
    let skippedCount = 0;
    let noImagesCount = 0;

    for (const event of events) {
      // Si ya tiene imágenes adicionales configuradas manualmente, no sobrescribir
      if (event.additional_images && event.additional_images.length > 0) {
        console.log(`⏭️  Omitido: "${event.title}" (ya tiene imágenes adicionales configuradas)`);
        skippedCount++;
        continue;
      }

      // Detectar imágenes adicionales
      const additionalImages = detectAdditionalImages(event.image_url);

      if (additionalImages.length === 0) {
        noImagesCount++;
        continue;
      }

      // Actualizar el evento
      await query('UPDATE events SET additional_images = $1::jsonb WHERE id = $2', [
        JSON.stringify(additionalImages),
        event.id,
      ]);

      console.log(`✅ "${event.title}"`);
      console.log(`   Imágenes detectadas: ${additionalImages.length}`);
      additionalImages.forEach((img, idx) => {
        console.log(`     ${idx + 1}. ${img}`);
      });
      console.log('');

      updatedCount++;
    }

    console.log('\n📊 Resumen:');
    console.log(`   - Total de eventos: ${events.length}`);
    console.log(`   - Actualizados: ${updatedCount}`);
    console.log(`   - Omitidos (ya configurados): ${skippedCount}`);
    console.log(`   - Sin imágenes adicionales: ${noImagesCount}`);
    console.log('\n✨ Proceso completado!\n');
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    process.exit(0);
  }
}

// Ejecutar
detectAndUpdateAdditionalImages();
