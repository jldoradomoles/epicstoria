import pool, { query } from '../config/database';

async function checkImageUrls() {
  try {
    const result = await query('SELECT id, title, image_url FROM events ORDER BY title ASC');
    const events = result.rows;

    console.log('\n📋 URLs de Imágenes en la Base de Datos:\n');
    console.log('=' + '='.repeat(120));

    events.forEach((event: any, index: number) => {
      console.log(`\n${index + 1}. "${event.title}"`);
      console.log(`   ID:  ${event.id}`);
      console.log(`   URL: ${event.image_url}`);
    });

    console.log('\n' + '=' + '='.repeat(120));
    console.log(`\nTotal: ${events.length} eventos\n`);

    // Estadísticas
    const placeholders = events.filter((e: any) => e.image_url?.includes('placehold.co')).length;
    const externalUrls = events.filter((e: any) => e.image_url?.startsWith('http')).length;
    const localUrls = events.filter((e: any) => e.image_url?.startsWith('/')).length;
    const nullUrls = events.filter((e: any) => !e.image_url).length;

    console.log('📊 Estadísticas:');
    console.log(`   URLs de placeholder (placehold.co): ${placeholders}`);
    console.log(`   URLs externas (http/https): ${externalUrls}`);
    console.log(`   URLs locales (/): ${localUrls}`);
    console.log(`   URLs nulas/vacías: ${nullUrls}\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

checkImageUrls();
