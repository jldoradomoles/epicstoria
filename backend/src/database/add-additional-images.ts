import * as fs from 'fs';
import * as path from 'path';
import { query } from '../config/database';

/**
 * Script de migración para agregar la columna additional_images a la tabla events
 * y detectar automáticamente imágenes con sufijos -1, -2, -3, etc.
 */

const IMAGES_DIR = path.join(__dirname, '../../../public/images/eventos');

async function addAdditionalImagesColumn() {
  console.log('🔧 Agregando columna additional_images...\n');

  try {
    // Agregar la columna si no existe
    await query(`
      ALTER TABLE events
      ADD COLUMN IF NOT EXISTS additional_images JSONB DEFAULT '[]'::jsonb
    `);
    console.log('✅ Columna additional_images agregada\n');

    // Detectar y cargar imágenes adicionales para cada evento
    console.log('🔍 Detectando imágenes adicionales...\n');

    const result = await query('SELECT id, image_url FROM events');
    const events = result.rows;

    let detected = 0;
    let notFound = 0;

    for (const event of events) {
      const imageUrl = event.image_url;

      if (!imageUrl || imageUrl.startsWith('http')) {
        console.log(`⏭️  Saltando ${event.id}: URL absoluta o vacía`);
        continue;
      }

      // Extraer el nombre base de la imagen
      const urlWithoutLeadingSlash = imageUrl.replace(/^\//, '');
      const pathMatch = urlWithoutLeadingSlash.match(/^(.+\/)?(.+?)(\.[^.]+)$/);

      if (!pathMatch) {
        console.log(`⚠️  ${event.id}: No coincide con el patrón esperado: ${imageUrl}`);
        continue;
      }

      const directory = pathMatch[1] || '';
      const baseName = pathMatch[2];
      const extension = pathMatch[3];

      // Buscar imágenes con sufijos -1, -2, -3, etc.
      const additionalImages: string[] = [];

      for (let i = 1; i <= 10; i++) {
        const imageFileName = `${baseName}-${i}${extension}`;
        const filePath = path.join(IMAGES_DIR, imageFileName);

        if (fs.existsSync(filePath)) {
          const imageRelativePath = `/${directory}${imageFileName}`;
          additionalImages.push(imageRelativePath);
        }
      }

      if (additionalImages.length > 0) {
        console.log(`📸 ${event.id}: Encontradas ${additionalImages.length} imágenes adicionales`);
        additionalImages.forEach((img, idx) => {
          console.log(`   ${idx + 1}. ${img}`);
        });

        // Actualizar en la base de datos
        await query('UPDATE events SET additional_images = $1 WHERE id = $2', [
          JSON.stringify(additionalImages),
          event.id,
        ]);
        detected++;
      } else {
        console.log(`ℹ️  ${event.id}: No se encontraron imágenes adicionales`);
        notFound++;
      }
    }

    console.log('\n📈 Resumen:');
    console.log(`   ✅ Eventos con imágenes detectadas: ${detected}`);
    console.log(`   ℹ️  Eventos sin imágenes adicionales: ${notFound}`);
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

// Ejecutar el script
addAdditionalImagesColumn()
  .then(() => {
    console.log('\n✅ Migración completada');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error en la migración:', error);
    process.exit(1);
  });
