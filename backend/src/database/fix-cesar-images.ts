import { query } from '../config/database';

async function fixCesarImages() {
  try {
    // Actualizar para incluir la imagen -1 en additional_images
    const result = await query(
      `
      UPDATE events
      SET additional_images = $1::jsonb
      WHERE slug = 'el-asesinato-de-julio-cesar'
      RETURNING id, title, image_url, additional_images
    `,
      [
        JSON.stringify([
          '/images/eventos/El-asesinato-de-Julio-Cesar-1.jpg',
          '/images/eventos/El-asesinato-de-Julio-Cesar-2.jpg',
          '/images/eventos/El-asesinato-de-Julio-Cesar-3.jpg',
        ]),
      ],
    );

    if (result.rows.length > 0) {
      const event = result.rows[0];
      console.log('\n✅ Evento actualizado correctamente:\n');
      console.log(`ID: ${event.id}`);
      console.log(`Title: ${event.title}`);
      console.log(`Image URL: ${event.image_url}`);
      console.log(`Additional Images: ${JSON.stringify(event.additional_images, null, 2)}`);
    } else {
      console.log('❌ No se encontró el evento');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
}

fixCesarImages();
