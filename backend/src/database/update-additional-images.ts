import { query } from '../config/database';

/**
 * Script para actualizar el campo additional_images en los eventos
 * que tienen imágenes adicionales con el patrón nombre-2, nombre-3, etc.
 */

interface EventUpdate {
  id: string;
  additionalImages: string[];
}

const eventsToUpdate: EventUpdate[] = [
  {
    id: 'El-ordenador-del-mundo-antiguo',
    additionalImages: ['images/eventos/Anticitera-2.jpg', 'images/eventos/Anticitera-3.jpg'],
  },
  {
    id: 'La-inauguración',
    additionalImages: ['images/eventos/La-Estatua-de-la-Libertad-2.jpg'],
  },
  {
    id: 'Sisi',
    additionalImages: [
      'images/eventos/Isabel-de-Baviera-2.jpg',
      'images/eventos/Isabel-de-Baviera-3.jpg',
    ],
  },
  {
    id: 'Entre-primates-y-ciencia',
    additionalImages: ['images/eventos/Jane-Goodall-2.jpg', 'images/eventos/Jane-Goodall-3.jpg'],
  },
  {
    id: 'El-Cristo-del-abismo',
    additionalImages: [
      'images/eventos/El-Cristo-del-abismo-2.jpg',
      'images/eventos/El-Cristo-del-abismo-3.jpg',
    ],
  },
  {
    id: 'La-apache',
    additionalImages: [
      'images/eventos/Lozen-2.jpg',
      'images/eventos/Lozen-3.jpg',
      'images/eventos/Lozen-4.jpg',
    ],
  },
  {
    id: 'Los-últimos-días',
    additionalImages: [
      'images/eventos/Federico-García-Lorca-2.jpg',
      'images/eventos/Federico-García-Lorca-3.jpg',
    ],
  },
  {
    id: 'Del-desprecio-al-orgullo',
    additionalImages: [
      'images/eventos/La-opera-de-Viena-2.jpg',
      'images/eventos/La-opera-de-Viena-3.jpg',
      'images/eventos/La-opera-de-Viena-4.jpg',
    ],
  },
  {
    id: 'El-hombre-que-quiso-volar',
    additionalImages: ['images/eventos/Abbas-Ibn-Firnas-2.jpg'],
  },
];

async function updateAdditionalImages() {
  console.log('🔧 Iniciando actualización de imágenes adicionales...\n');

  try {
    let updatedCount = 0;
    let notFoundCount = 0;

    for (const eventData of eventsToUpdate) {
      // Verificar si el evento existe
      const checkResult = await query('SELECT id, title FROM events WHERE id = $1', [eventData.id]);

      if (checkResult.rows.length === 0) {
        console.log(`❌ Evento no encontrado: ${eventData.id}`);
        notFoundCount++;
        continue;
      }

      const event = checkResult.rows[0];

      // Actualizar el campo additional_images (convertir a JSON)
      await query('UPDATE events SET additional_images = $1::jsonb WHERE id = $2', [
        JSON.stringify(eventData.additionalImages),
        eventData.id,
      ]);

      console.log(`✅ Actualizado: "${event.title}" (${eventData.id})`);
      console.log(`   Imágenes agregadas: ${eventData.additionalImages.length}`);
      eventData.additionalImages.forEach((img, idx) => {
        console.log(`     ${idx + 1}. ${img}`);
      });
      console.log('');

      updatedCount++;
    }

    console.log('📊 Resumen:');
    console.log(`   Eventos actualizados: ${updatedCount}`);
    console.log(`   Eventos no encontrados: ${notFoundCount}`);
    console.log('   Total procesados: ' + eventsToUpdate.length);
    console.log('');
    console.log('✨ Proceso completado exitosamente\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error durante la actualización:', error);
    process.exit(1);
  }
}

// Ejecutar el script
updateAdditionalImages();
