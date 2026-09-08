import * as fs from 'fs';
import * as path from 'path';
import pool, { query } from '../config/database';

/**
 * Script para verificar que las imágenes en la BD existan físicamente
 * y corregir las extensiones si es necesario
 */
async function verifyAndFixImageUrls() {
  console.log('🔍 Iniciando verificación de URLs de imágenes...\n');

  try {
    // Directorio de imágenes
    const publicPath = path.join(__dirname, '../../..', 'public');
    const eventosDir = path.join(publicPath, 'images/eventos');

    console.log(`📁 Directorio de imágenes: ${eventosDir}\n`);

    if (!fs.existsSync(eventosDir)) {
      console.error(`❌ Directorio no encontrado: ${eventosDir}`);
      process.exit(1);
    }

    // Obtener todos los archivos de imágenes disponibles
    const availableFiles = fs.readdirSync(eventosDir);
    const availableImages = new Map<string, string>();

    for (const file of availableFiles) {
      if (!/\.(jpg|jpeg|png|gif|webp)$/i.test(file)) {
        continue;
      }

      // Crear una clave basada en el nombre sin extensión
      const nameWithoutExt = file.replace(/\.(jpg|jpeg|png|gif|webp)$/i, '');
      availableImages.set(nameWithoutExt.toLowerCase(), file);
    }

    console.log(`✅ Se encontraron ${availableImages.size} archivos de imagen\n`);

    // Obtener todos los eventos de la BD
    const result = await query('SELECT id, title, image_url FROM events ORDER BY title ASC');
    const events = result.rows;

    let brokenUrls: Array<{ id: string; title: string; url: string; exists: boolean }> = [];
    let toFix: Array<{ id: string; title: string; oldUrl: string; newUrl: string }> = [];

    // Verificar cada evento
    for (const event of events) {
      const fullPath = path.join(publicPath, event.image_url.replace(/^\//, ''));
      const exists = fs.existsSync(fullPath);

      if (!exists) {
        brokenUrls.push({
          id: event.id,
          title: event.title,
          url: event.image_url,
          exists: false,
        });

        // Intentar encontrar la imagen con otra extensión
        const urlWithoutExt = event.image_url
          .replace(/\.(jpg|jpeg|png|gif|webp)$/i, '')
          .split('/')
          .pop();

        if (urlWithoutExt) {
          const correctFile = availableImages.get(urlWithoutExt.toLowerCase());
          if (correctFile) {
            const newUrl = event.image_url.replace(
              /\/[^/]+\.(jpg|jpeg|png|gif|webp)$/i,
              `/${correctFile}`,
            );
            toFix.push({
              id: event.id,
              title: event.title,
              oldUrl: event.image_url,
              newUrl,
            });
          }
        }
      }
    }

    if (brokenUrls.length === 0) {
      console.log('✅ ¡Todas las imágenes existen en el sistema de archivos!\n');
      process.exit(0);
    }

    console.log(`⚠️  Se encontraron ${brokenUrls.length} URLs rotas o incorrectas:\n`);

    brokenUrls.forEach((broken, index) => {
      console.log(`${index + 1}. "${broken.title}"`);
      console.log(`   URL: ${broken.url}`);
      console.log(`   Estado: ${broken.exists ? '✅ Existe' : '❌ No existe'}`);
      console.log('');
    });

    if (toFix.length > 0) {
      console.log(`\n💾 Se pueden corregir ${toFix.length} URLs:\n`);

      toFix.forEach((fix, index) => {
        console.log(`${index + 1}. "${fix.title}"`);
        console.log(`   Antes: ${fix.oldUrl}`);
        console.log(`   Después: ${fix.newUrl}`);
        console.log('');
      });

      // Preguntar si desea aplicar los cambios
      console.log('Aplicando cambios...\n');

      for (const fix of toFix) {
        await query('UPDATE events SET image_url = $1 WHERE id = $2', [fix.newUrl, fix.id]);
        console.log(`✅ "${fix.title}"`);
      }

      console.log(`\n✅ Se actualizaron ${toFix.length} URLs exitosamente!`);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

verifyAndFixImageUrls();
