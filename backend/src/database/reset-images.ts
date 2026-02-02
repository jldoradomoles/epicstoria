import { query } from '../config/database';

async function reset() {
  // Actualizar las rutas de imágenes principales para que apunten a images/eventos
  await query(`
    UPDATE events
    SET image_url = REPLACE(image_url, '/images/', '/images/eventos/')
    WHERE image_url LIKE '/images/%'
    AND image_url NOT LIKE '/images/eventos/%'
  `);
  console.log('Updated image URLs to images/eventos/');
  process.exit(0);
}

reset();
