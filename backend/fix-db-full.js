const { Client } = require('pg');

const client = new Client({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'epicstoria',
  password: process.env.DB_PASSWORD || 'postgres123',
  port: process.env.DB_PORT || 5432,
});

async function fullFix() {
  try {
    await client.connect();
    console.log('✅ Connected to PostgreSQL\n');

    // Step 1: Remove /images-optimized/ prefix and replace with /images/
    console.log('Step 1: Replacing /images-optimized/ with /images/...');
    const updateRes = await client.query(
      "UPDATE events SET image_url = REPLACE(image_url, '/images-optimized/', '/images/') WHERE image_url LIKE '%/images-optimized/%'",
    );
    console.log(`✅ Updated ${updateRes.rowCount} events\n`);

    // Step 2: Remove remaining duplicate /eventos/eventos/
    console.log('Step 2: Removing duplicate /eventos/eventos/...');
    const updateRes2 = await client.query(
      "UPDATE events SET image_url = REPLACE(image_url, '/eventos/eventos/', '/eventos/') WHERE image_url LIKE '%/eventos/eventos/%'",
    );
    console.log(`✅ Updated ${updateRes2.rowCount} events\n`);

    // Verify
    console.log('Verifying results...');
    const verifyRes = await client.query('SELECT id, title, image_url FROM events LIMIT 3');
    verifyRes.rows.forEach((row) => {
      console.log(`- ${row.title}: ${row.image_url}`);
    });
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await client.end();
    process.exit(0);
  }
}

fullFix();
