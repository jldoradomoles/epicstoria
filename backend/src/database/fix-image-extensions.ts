import * as fs from 'fs';
import * as path from 'path';
import { query } from '../config/database';

/**
 * Script para corregir las extensiones de las imágenes en la base de datos
 * Verifica qué archivos existen realmente y actualiza la BD con la extensión correcta
 */

const IMAGES_DIR = path.join(__dirname, '../../../public/images/eventos');

async function fixImageExtensions() {
  console.log('🔍 Verificando y corrigiendo extensiones de imágenes...\n');

  try {
    // Obtener todos los eventos de la base de datos
    const result = await query('SELECT id, title, image_url FROM events ORDER BY id');
    const events = result.rows;

    console.log(`📊 Encontrados ${events.length} eventos\n`);

    let corrected = 0;
    let notFound = 0;

    for (const event of events) {
      const imageUrl = event.image_url;

      if (!imageUrl || imageUrl.startsWith('http')) {
        console.log(`⏭️  Saltando ${event.id}: URL absoluta o vacía`);
        continue;
      }

      // Extraer el nombre del archivo sin extensión
      const urlWithoutLeadingSlash = imageUrl.replace(/^\//, '');
      const pathMatch = urlWithoutLeadingSlash.match(/^images\/eventos\/(.+?)(\.[^.]+)?$/);

      if (!pathMatch) {
        console.log(`⚠️  ${event.id}: No coincide con el patrón esperado: ${imageUrl}`);
        continue;
      }

      const baseNameWithoutExt = pathMatch[1].replace(/\.(jpg|jpeg|png|gif|webp)$/i, '');
      const currentExt = pathMatch[2];

      // Buscar qué extensión existe realmente
      const possibleExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp'];
      let foundExt = null;

      for (const ext of possibleExtensions) {
        const filePath = path.join(IMAGES_DIR, `${baseNameWithoutExt}${ext}`);
        if (fs.existsSync(filePath)) {
          foundExt = ext;
          break;
        }
      }

      if (!foundExt) {
        console.log(
          `❌ ${event.id}: No se encontró imagen para "${baseNameWithoutExt}" - URL actual: ${imageUrl}`,
        );
        notFound++;
        continue;
      }

      const correctUrl = `/images/eventos/${baseNameWithoutExt}${foundExt}`;

      // Si la URL es diferente, actualizar
      if (imageUrl !== correctUrl) {
        console.log(`🔧 ${event.id}: "${event.title}"`);
        console.log(`   Actual:  ${imageUrl}`);
        console.log(`   Correcto: ${correctUrl}`);

        await query('UPDATE events SET image_url = $1 WHERE id = $2', [correctUrl, event.id]);
        corrected++;
      } else {
        console.log(`✅ ${event.id}: Ya correcto - ${correctUrl}`);
      }
    }

    console.log('\n📈 Resumen:');
    console.log(`   ✅ URLs corregidas: ${corrected}`);
    console.log(`   ❌ Imágenes no encontradas: ${notFound}`);
    console.log(`   ✓  URLs ya correctas: ${events.length - corrected - notFound}`);
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

// Ejecutar el script
fixImageExtensions()
  .then(() => {
    console.log('\n✅ Proceso completado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error en el proceso:', error);
    process.exit(1);
  });
