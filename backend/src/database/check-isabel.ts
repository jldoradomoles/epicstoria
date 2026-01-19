import { query } from '../config/database';

async function checkIsabel() {
  try {
    const result = await query(
      "SELECT id, title, image_url FROM events WHERE title ILIKE '%isabel%baviera%'",
    );

    console.log('Eventos encontrados:', result.rows.length);
    result.rows.forEach((row) => {
      console.log('\n---');
      console.log('ID:', row.id);
      console.log('Title:', row.title);
      console.log('Image URL:', row.image_url);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkIsabel();
