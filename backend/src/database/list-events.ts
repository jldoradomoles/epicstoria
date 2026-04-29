import pool, { query } from '../config/database';

async function listEvents() {
  try {
    const result = await query(
      'SELECT id, slug, title, date, category, updated_at FROM events ORDER BY date ASC',
    );

    if (result.rows.length === 0) {
      console.log('⚠️  No hay eventos en la base de datos.');
      process.exit(0);
    }

    console.log(`\n📋 Eventos en la base de datos (${result.rows.length} total):\n`);
    console.log(
      'Nº  '.padEnd(5) +
        'ID'.padEnd(35) +
        'SLUG'.padEnd(40) +
        'TÍTULO'.padEnd(45) +
        'FECHA'.padEnd(14) +
        'CATEGORÍA'.padEnd(20) +
        'ACTUALIZADO',
    );
    console.log('-'.repeat(170));

    result.rows.forEach((row, index) => {
      const num = String(index + 1).padEnd(5);
      const id = row.id.substring(0, 33).padEnd(35);
      const slug = (row.slug ?? '').substring(0, 38).padEnd(40);
      const title = row.title.substring(0, 43).padEnd(45);
      const date = String(row.date ?? '')
        .substring(0, 10)
        .padEnd(14);
      const category = (row.category ?? '').substring(0, 18).padEnd(20);
      const updated = row.updated_at ? new Date(row.updated_at).toISOString().substring(0, 19) : '';
      console.log(`${num}${id}${slug}${title}${date}${category}${updated}`);
    });

    console.log('-'.repeat(170));
    console.log(`\nTotal: ${result.rows.length} eventos\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error al consultar eventos:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

listEvents();
