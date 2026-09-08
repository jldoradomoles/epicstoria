import * as fs from 'fs';

/**
 * Convierte la extensión de una URL de imagen a .webp
 * Maneja rutas locales y URLs externas
 */
function convertToWebp(imageUrl: string | null): string | null {
  if (!imageUrl) return null;

  // Si es una URL externa, dejarla como está
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }

  // Para rutas locales, cambiar la extensión a .webp
  return imageUrl.replace(/\.(jpg|jpeg|png|gif)$/i, '.webp');
}

/**
 * Convierte todas las imágenes en un archivo JSON a formato .webp
 */
function convertJsonImagesToWebp(jsonFilePath: string) {
  try {
    console.log(`📖 Leyendo archivo: ${jsonFilePath}`);

    // Leer el archivo JSON
    const fileContent = fs.readFileSync(jsonFilePath, 'utf-8');
    let events = JSON.parse(fileContent);

    // Asegurarse de que es un array
    if (!Array.isArray(events)) {
      console.error('❌ El archivo no contiene un array de eventos');
      process.exit(1);
    }

    console.log(`📚 Se encontraron ${events.length} eventos\n`);

    let updatedCount = 0;

    // Procesar cada evento
    events = events.map((event: any) => {
      let eventUpdated = false;

      // Convertir imageUrl
      const newImageUrl = convertToWebp(event.imageUrl);
      if (newImageUrl !== event.imageUrl) {
        console.log(`✅ "${event.title}"`);
        console.log(`   Imagen: ${event.imageUrl} → ${newImageUrl}`);
        event.imageUrl = newImageUrl;
        eventUpdated = true;
      }

      // Convertir additionalImages si existen
      if (event.additionalImages && Array.isArray(event.additionalImages)) {
        const newAdditionalImages = event.additionalImages
          .map(convertToWebp)
          .filter((url: string | null) => url !== null);

        if (JSON.stringify(newAdditionalImages) !== JSON.stringify(event.additionalImages)) {
          if (!eventUpdated) {
            console.log(`✅ "${event.title}"`);
          }
          console.log(`   Imágenes adicionales: ${event.additionalImages.length} actualizadas`);
          event.additionalImages = newAdditionalImages;
          eventUpdated = true;
        }
      }

      if (eventUpdated) {
        updatedCount++;
      }

      return event;
    });

    // Guardar el archivo actualizado
    fs.writeFileSync(jsonFilePath, JSON.stringify(events, null, 2), 'utf-8');

    console.log('\n' + '='.repeat(80));
    console.log('📊 RESULTADO:');
    console.log('='.repeat(80));
    console.log(`✅ Eventos procesados: ${updatedCount}`);
    console.log(`📋 Total: ${events.length}`);
    console.log(`💾 Archivo actualizado: ${jsonFilePath}`);
    console.log('='.repeat(80) + '\n');
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
📖 Uso: npx tsx convert-json-images-to-webp.ts <archivo-json>

Ejemplo:
  npx tsx convert-json-images-to-webp.ts public/data/events.json

Este script convierte todas las URLs de imágenes en un archivo JSON a formato .webp
    `);
    process.exit(1);
  }

  const jsonFile = args[0];

  if (!fs.existsSync(jsonFile)) {
    console.error(`❌ Archivo no encontrado: ${jsonFile}`);
    process.exit(1);
  }

  convertJsonImagesToWebp(jsonFile);
}

export { convertJsonImagesToWebp, convertToWebp };
