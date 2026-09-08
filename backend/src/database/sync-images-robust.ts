import * as fs from 'fs';
import * as path from 'path';
import { query } from '../config/database';

async function syncImagesFromJson() {
  try {
    console.log('🔍 Reading events.json...');
    const eventsPath = path.join(__dirname, '../../../public/data/events.json');
    const events = JSON.parse(fs.readFileSync(eventsPath, 'utf8'));

    console.log(`📝 Found ${events.length} events in JSON`);

    let updated = 0;
    for (const event of events) {
      const imageUrl = event.imageUrl || null;
      const id = event.id;

      if (!imageUrl) {
        console.warn(`⚠️  Event ${id} has no imageUrl`);
        continue;
      }

      try {
        // Normalizar: agregar barra si no la tiene
        const normalizedUrl = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;

        const result = await query('UPDATE events SET image_url = $1 WHERE id = $2 RETURNING id', [
          normalizedUrl,
          id,
        ]);

        if (result.rows.length > 0) {
          console.log(`✅ Updated ${id}: ${normalizedUrl}`);
          updated++;
        } else {
          console.log(`⚠️  Event ${id} not found in DB (will not update)`);
        }
      } catch (err) {
        console.error(`❌ Error updating ${id}:`, err instanceof Error ? err.message : err);
      }
    }

    console.log(`\n✨ Done! Updated ${updated} events.`);
  } catch (err) {
    console.error('Fatal error:', err instanceof Error ? err.message : err);
  }

  process.exit(0);
}

syncImagesFromJson();
