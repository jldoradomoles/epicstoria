import { query } from '../config/database';

async function checkCesar() {
  try {
    const result = await query(`
      SELECT id, slug, title, image_url, additional_images
      FROM events
      WHERE id LIKE '%cesar%' OR slug LIKE '%cesar%' OR title LIKE '%Cesar%' OR title LIKE '%César%'
    `);

    console.log('\n=== Eventos relacionados con César ===\n');

    if (result.rows.length === 0) {
      console.log('❌ No se encontró ningún evento relacionado con César');
      return;
    }

    for (const event of result.rows) {
      console.log(`\nID: ${event.id}`);
      console.log(`Slug: ${event.slug}`);
      console.log(`Title: ${event.title}`);
      console.log(`Image URL: ${event.image_url}`);
      console.log(`Additional Images: ${JSON.stringify(event.additional_images, null, 2)}`);
      console.log('-'.repeat(60));
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
}

checkCesar();
