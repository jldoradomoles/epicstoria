import { query } from '../config/database';

async function checkEvent() {
  try {
    const result = await query(
      "SELECT id, title, additional_images FROM events WHERE id = 'El-ordenador-del-mundo-antiguo'",
    );

    if (result.rows.length > 0) {
      console.log('\n✅ Evento encontrado:');
      console.log(JSON.stringify(result.rows[0], null, 2));
    } else {
      console.log('❌ Evento no encontrado');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkEvent();
