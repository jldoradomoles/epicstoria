/**
 * Script para recuperar imágenes adicionales desde el filesystem
 * Reconstruye el array additional_images basándose en archivos encontrados
 */

import * as fs from 'fs';
import * as path from 'path';
import { query } from '../config/database';

interface EventRow {
  id: string;
  title: string;
  slug: string;
  additional_images: string[] | null;
}

/**
 * Encuentra imágenes adicionales en el filesystem basándose en la estructura de carpetas
 */
async function recoverImagesFromFilesystem(imagesBaseDir: string) {
  console.log('🔍 Iniciando recuperación de imágenes desde filesystem...\n');

  try {
    if (!fs.existsSync(imagesBaseDir)) {
      console.error(`❌ Directorio no encontrado: ${imagesBaseDir}`);
      console.log(`📁 Asegúrate de que la ruta es correcta.`);
      process.exit(1);
    }

    // Obtener todos los eventos
    const result = await query(
      'SELECT id, title, slug, additional_images FROM events ORDER BY title ASC',
    );
    const events: EventRow[] = result.rows;

    console.log(`📚 Se encontraron ${events.length} eventos\n`);

    let successCount = 0;
    let errorCount = 0;
    let noImagesCount = 0;

    console.log('📸 Buscando imágenes adicionales en filesystem...\n');

    // Procesar cada evento
    for (const event of events) {
      try {
        // Buscar carpeta del evento por ID o slug
        const possiblePaths = [
          path.join(imagesBaseDir, 'eventos', event.id),
          path.join(imagesBaseDir, 'eventos', event.slug),
          path.join(imagesBaseDir, event.id),
          path.join(imagesBaseDir, event.slug),
        ];

        let eventImagesPath = '';
        for (const possiblePath of possiblePaths) {
          if (fs.existsSync(possiblePath)) {
            eventImagesPath = possiblePath;
            break;
          }
        }

        if (!eventImagesPath) {
          noImagesCount++;
          continue;
        }

        // Leer archivos de imágenes adicionales
        const files = fs.readdirSync(eventImagesPath);
        const imageFiles = files.filter((file) => /\.(jpg|jpeg|png|gif|webp)$/i.test(file));

        // Filtrar imagen principal si existe (puede llamarse "main", "principal", "cover")
        const additionalImages = imageFiles
          .filter((file) => {
            const nameLower = file.toLowerCase();
            return !(
              nameLower.includes('main') ||
              nameLower.includes('principal') ||
              nameLower.includes('cover') ||
              nameLower.includes('hero')
            );
          })
          .map((file) => path.join(eventImagesPath, file).replace(/\\/g, '/'))
          .sort();

        if (additionalImages.length > 0) {
          const additionalImagesValue = JSON.stringify(additionalImages);

          await query('UPDATE events SET additional_images = $1::jsonb WHERE id = $2', [
            additionalImagesValue,
            event.id,
          ]);

          console.log(`✅ "${event.title}"`);
          console.log(`   📸 ${additionalImages.length} imágenes adicionales recuperadas`);
          additionalImages.forEach((img) => {
            console.log(`      • ${path.basename(img)}`);
          });
          successCount++;
        } else {
          noImagesCount++;
        }
      } catch (error) {
        console.error(
          `❌ Error al procesar "${event.title}" (ID: ${event.id}):`,
          (error as any).message,
        );
        errorCount++;
      }
    }

    console.log('\n' + '='.repeat(80));
    console.log('📊 RESULTADO DE RECUPERACIÓN:');
    console.log('='.repeat(80));
    console.log(`✅ Eventos con imágenes recuperadas: ${successCount}`);
    console.log(`❌ Errores: ${errorCount}`);
    console.log(`ℹ️  Eventos sin carpeta de imágenes: ${noImagesCount}`);
    console.log('='.repeat(80) + '\n');

    if (successCount > 0) {
      console.log('🎉 Recuperación completada!');
    } else if (noImagesCount === events.length) {
      console.log('⚠️  No se encontraron carpetas de imágenes en el filesystem.');
      console.log('   Intenta con una ruta diferente.');
    }

    process.exit(errorCount > 0 ? 1 : 0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length < 1) {
    console.log(`
📸 Script de Recuperación de Imágenes desde Filesystem

Uso: npm run db:recover-images-fs -- <ruta-a-carpeta-imagenes>

Ejemplos:
  npm run db:recover-images-fs -- /home/usuario/public/images
  npm run db:recover-images-fs -- ./public/images
  npm run db:recover-images-fs -- /var/www/html/images

📂 Estructura esperada:
  images/
    ├── eventos/
    │   ├── evento-1/
    │   │   ├── main.webp
    │   │   ├── adicional-1.webp
    │   │   └── adicional-2.webp
    │   └── evento-2/
    │       └── ...
    └── categorias/
        └── ...

⚠️  Este script buscará archivos de imagen en el filesystem
    y reconstruirá el array additional_images en la BD.
    `);
    process.exit(1);
  }

  const imagesDir = args[0];
  recoverImagesFromFilesystem(imagesDir);
}

export default recoverImagesFromFilesystem;
