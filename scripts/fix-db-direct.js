const { Client } = require('pg');

const client = new Client({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'epicstoria',
  password: process.env.DB_PASSWORD || 'postgres123',
  port: process.env.DB_PORT || 5432,
});

async function fix() {
  try {
    await client.connect();
    console.log('✅ Connected to PostgreSQL');

    // Fix duplicate eventos paths
    const updateRes = await client.query(
      "UPDATE events SET image_url = REPLACE(image_url, '/eventos/eventos/', '/eventos/') WHERE image_url LIKE '%/eventos/eventos/%'",
    );
    console.log(`✅ Updated ${updateRes.rowCount} events`);

    // Verify
    const verifyRes = await client.query(
      "SELECT COUNT(*) as count FROM events WHERE image_url LIKE '%/eventos/eventos/%'",
    );
    console.log(`✅ Remaining duplicates: ${verifyRes.rows[0].count}`);
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await client.end();
    process.exit(0);
  }
}

fix();
