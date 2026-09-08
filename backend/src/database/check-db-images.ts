import { query } from '../config/database';

async function checkEventImages() {
  try {
    const result = await query('SELECT id, slug, title, image_url FROM events LIMIT 5');
    console.log('📌 Events in DB (first 5):');
    result.rows.forEach((e: any) => {
      console.log(`  - ${e.slug}: image_url="${e.image_url}"`);
    });
  } catch (e) {
    console.error('DB Error:', e);
  }
  process.exit(0);
}

checkEventImages();
