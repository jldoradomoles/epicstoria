import * as fs from 'fs';
import * as path from 'path';
import pool, { query } from '../config/database';

interface EventRow {
  id: string;
  title: string;
  image_url: string;
  slug: string;
}

/**
 * Normaliza un nombre para búsqueda (elimina caracteres especiales, acentos, espacios, etc.)
 */
function normalizeForSearch(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
    .replace(/[^a-z0-9]+/g, '') // Eliminar caracteres especiales
    .trim();
}

/**
 * Obtiene la lista de imágenes disponibles en el directorio eventos
 */
async function getAvailableImages(): Promise<Map<string, string>> {
  const imageMap = new Map<string, string>();
  const eventosDir = path.join(__dirname, '../../..', 'public/images/eventos');

  if (!fs.existsSync(eventosDir)) {
    console.error(`❌ Directorio no encontrado: ${eventosDir}`);
    return imageMap;
  }

  const files = fs.readdirSync(eventosDir);

  for (const file of files) {
    // Solo considerar imágenes de base (sin sufijo -2, -3, etc.)
    if (!/\.(jpg|jpeg|png|gif|webp)$/i.test(file)) {
      continue;
    }

    // Obtener el nombre base (sin extensión y sin sufijos tipo -2, -3, etc.)
    const baseName = file
      .replace(/\.(jpg|jpeg|png|gif|webp)$/i, '')
      .replace(/-movil$/, '')
      .replace(/-\d+$/, '');

    const normalizedName = normalizeForSearch(baseName);
    const imagePath = `/images/eventos/${file}`;

    // Si ya existe una entrada para este nombre, preferir archivos sin sufijo
    if (!imageMap.has(normalizedName) || file.match(/^\w+\.\w+$/) || !file.match(/-\d/)) {
      imageMap.set(normalizedName, imagePath);
    }
  }

  console.log(`✅ Se encontraron ${imageMap.size} imágenes disponibles`);
  return imageMap;
}

/**
 * Intenta encontrar una imagen que corresponda a un evento
 */
function findMatchingImage(eventTitle: string, imageMap: Map<string, string>): string | null {
  const normalizedTitle = normalizeForSearch(eventTitle);

  // Búsqueda exacta
  if (imageMap.has(normalizedTitle)) {
    return imageMap.get(normalizedTitle) || null;
  }

  // Búsqueda parcial: si la imagen contiene palabras claves del título
  const titleWords = normalizedTitle.split(/\W+/).filter((w) => w.length > 2);

  for (const [imageName] of imageMap) {
    const matchCount = titleWords.filter((word) => imageName.includes(word)).length;
    if (matchCount >= Math.min(2, titleWords.length)) {
      return imageMap.get(imageName) || null;
    }
  }

  return null;
}

/**
 * Normaliza las imágenes de placeholder en la base de datos
 */
async function normalizePlaceholderImages() {
  console.log('🔍 Iniciando normalización de imágenes de placeholder...\n');

  try {
    // Obtener todas las imágenes disponibles
    const imageMap = await getAvailableImages();

    if (imageMap.size === 0) {
      console.error('❌ No se encontraron imágenes disponibles');
      process.exit(1);
    }

    // Obtener todos los eventos de la BD
    const result = await query('SELECT id, title, image_url, slug FROM events ORDER BY title ASC');
    const events: EventRow[] = result.rows;

    console.log(`📚 Se encontraron ${events.length} eventos en la base de datos\n`);

    let placeholderCount = 0;
    let updatedCount = 0;
    let notFoundCount = 0;
    const updates: Array<{ event: EventRow; oldUrl: string; newUrl: string }> = [];

    // Procesar cada evento
    for (const event of events) {
      const isPlaceholder =
        event.image_url &&
        (event.image_url.includes('placehold.co') ||
          event.image_url.includes('https://') ||
          event.image_url.includes('http://'));

      if (isPlaceholder && event.image_url.includes('placehold.co')) {
        placeholderCount++;
        console.log(`\n📌 Evento con placeholder: "${event.title}"`);
        console.log(`   URL actual: ${event.image_url}`);

        // Intentar encontrar una imagen coincidente
        const matchedImage = findMatchingImage(event.title, imageMap);

        if (matchedImage) {
          updates.push({
            event,
            oldUrl: event.image_url,
            newUrl: matchedImage,
          });
          console.log(`   ✅ Imagen encontrada: ${matchedImage}`);
          updatedCount++;
        } else {
          console.log(`   ⚠️  No se encontró imagen coincidente`);
          notFoundCount++;
        }
      }
    }

    if (updates.length === 0) {
      console.log('\n✅ No hay eventos con URLs de placeholder para actualizar');
      process.exit(0);
    }

    // Mostrar resumen antes de aplicar cambios
    console.log('\n' + '='.repeat(80));
    console.log('📊 RESUMEN DE CAMBIOS:');
    console.log('='.repeat(80));
    console.log(`Total de eventos: ${events.length}`);
    console.log(`Eventos con placeholder: ${placeholderCount}`);
    console.log(`Imágenes encontradas: ${updatedCount}`);
    console.log(`Imágenes no encontradas: ${notFoundCount}`);

    if (updates.length > 0) {
      console.log('\n📋 Cambios a realizar:');
      updates.forEach((update, index) => {
        console.log(`  ${index + 1}. "${update.event.title}" → ${update.newUrl.split('/').pop()}`);
      });
    }

    console.log('\n' + '='.repeat(80));
    console.log('💾 Aplicando cambios a la base de datos...\n');

    // Aplicar los cambios a la base de datos
    for (const update of updates) {
      try {
        await query('UPDATE events SET image_url = $1 WHERE id = $2', [
          update.newUrl,
          update.event.id,
        ]);
        console.log(`✅ "${update.event.title}"`);
      } catch (error) {
        console.error(`❌ Error al actualizar "${update.event.title}":`, error);
      }
    }

    console.log('\n✅ Normalización completada!');
    console.log(`   Eventos actualizados: ${updates.length}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error durante la normalización:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

normalizePlaceholderImages();
