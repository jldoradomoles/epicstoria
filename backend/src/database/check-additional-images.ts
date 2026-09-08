import pool, { query } from '../config/database';

async function checkAdditionalImages() {
  try {
    const result = await query('SELECT id, title, additional_images FROM events');
    const events = result.rows;

    console.log('\n📋 Verificando additional_images:\n');

    for (const event of events) {
      if (event.additional_images) {
        console.log(`"${event.title}" (ID: ${event.id})`);
        console.log(`  Tipo: ${typeof event.additional_images}`);
        console.log(`  Contenido:`, event.additional_images);
        console.log('');
      }
    }

    console.log(
      `\nTotal de eventos con additional_images: ${events.filter((e) => e.additional_images).length}`,
    );

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

checkAdditionalImages();
