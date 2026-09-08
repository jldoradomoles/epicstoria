import { query } from '../config/database';

async function fixDuplicatePaths() {
  try {
    console.log('🔍 Fixing duplicate "eventos" paths...');

    const result = await query(
      "SELECT id, image_url FROM events WHERE image_url LIKE '%/eventos/eventos/%'",
    );
    console.log(`Found ${result.rows.length} events with duplicate "eventos" folder`);

    let fixed = 0;
    for (const event of result.rows) {
      const newUrl = event.image_url.replace(/\/eventos\/eventos\//, '/eventos/');
      console.log(`  ${event.id}: "${event.image_url}" → "${newUrl}"`);

      const updateResult = await query('UPDATE events SET image_url = $1 WHERE id = $2', [
        newUrl,
        event.id,
      ]);
      if ((updateResult?.rowCount || 0) > 0) fixed++;
    }

    console.log(`✅ Fixed ${fixed} events!`);
  } catch (err) {
    console.error('Error:', err instanceof Error ? err.message : err);
  }
  process.exit(0);
}

fixDuplicatePaths();
