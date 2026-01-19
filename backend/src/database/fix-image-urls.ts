import { query } from '../config/database';

/**
 * Script para actualizar las URLs de las imágenes en la base de datos
 * Migra las imágenes de /images/* a /images/eventos/*
 */

const fixImageUrls = async () => {
  console.log('🔧 Iniciando actualización de URLs de imágenes...');

  try {
    // Obtener todos los eventos de la base de datos
    const result = await query('SELECT id, title, image_url FROM events');
    const events = result.rows;

    console.log(`📚 Se encontraron ${events.length} eventos en la base de datos`);

    let updatedCount = 0;

    for (const event of events) {
      const oldUrl = event.image_url;
      let newUrl = oldUrl;

      // Si la URL comienza con /images/ pero NO con /images/eventos/
      if (oldUrl && oldUrl.startsWith('/images/') && !oldUrl.startsWith('/images/eventos/')) {
        // Extraer el nombre del archivo
        const filename = oldUrl.replace('/images/', '');
        newUrl = `/images/eventos/${filename}`;
      }
      // Si la URL comienza con images/ (sin barra inicial) pero NO con images/eventos/
      else if (oldUrl && oldUrl.startsWith('images/') && !oldUrl.startsWith('images/eventos/')) {
        const filename = oldUrl.replace('images/', '');
        newUrl = `/images/eventos/${filename}`;
      }

      // Si la URL cambió, actualizarla en la base de datos
      if (newUrl !== oldUrl) {
        await query('UPDATE events SET image_url = $1 WHERE id = $2', [newUrl, event.id]);
        console.log(`  ✅ Actualizado: "${event.title}"`);
        console.log(`     Antes: ${oldUrl}`);
        console.log(`     Ahora: ${newUrl}`);
        updatedCount++;
      }
    }

    console.log('');
    console.log('📊 Resumen:');
    console.log(`   Total de eventos: ${events.length}`);
    console.log(`   URLs actualizadas: ${updatedCount}`);
    console.log(`   URLs sin cambios: ${events.length - updatedCount}`);
    console.log('');
    console.log('🎉 Actualización de URLs completada!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error al actualizar URLs:', error);
    process.exit(1);
  }
};

fixImageUrls();
