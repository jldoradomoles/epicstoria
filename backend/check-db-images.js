const { Client } = require('pg');

const client = new Client({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'epicstoria',
  password: process.env.DB_PASSWORD || 'postgres123',
  port: process.env.DB_PORT || 5432,
});

async function check() {
  try {
    await client.connect();
    console.log('✅ Connected to PostgreSQL\n');

    // Get some events
    const res = await client.query('SELECT id, title, image_url FROM events LIMIT 5');
    console.log('📋 Events from DB:');
    res.rows.forEach((row, i) => {
      console.log(`${i + 1}. ID: ${row.id}, Title: ${row.title}`);
      console.log(`   image_url: ${row.image_url || '(NULL)'}`);
    });
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await client.end();
    process.exit(0);
  }
}

check();
