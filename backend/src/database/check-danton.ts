import { query } from '../config/database';

async function checkDanton() {
  const result = await query(
    "SELECT id, image_url, additional_images FROM events WHERE title LIKE '%Danton%'",
  );
  console.log(JSON.stringify(result.rows, null, 2));
  process.exit(0);
}

checkDanton();
