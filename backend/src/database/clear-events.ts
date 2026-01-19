import { query } from '../config/database';
import pool from '../config/database';

const clearEvents = async () => {
  try {
    console.log('🗑️  Vaciando tabla de eventos...');

    // Eliminar todos los registros de la tabla events
    const result = await query('DELETE FROM events');

    console.log(`✅ Se eliminaron ${result.rowCount} eventos de la base de datos`);
    console.log('✨ Tabla de eventos vaciada exitosamente');
  } catch (error) {
    console.error('❌ Error al vaciar la tabla de eventos:', error);
    throw error;
  } finally {
    // Cerrar la conexión
    await pool.end();
    console.log('🔌 Conexión a la base de datos cerrada');
  }
};

// Ejecutar el script
clearEvents()
  .then(() => {
    console.log('👍 Proceso completado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Error en el proceso:', error);
    process.exit(1);
  });
