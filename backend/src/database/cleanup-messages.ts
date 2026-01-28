import pool from '../config/database';
import { MessageCleanupService } from '../services/message-cleanup.service';

/**
 * Script manual para ejecutar limpieza de mensajes
 */
async function runCleanup() {
  let exitCode = 0;

  try {
    console.log('🧹 Ejecutando limpieza de mensajes...');
    console.log('');

    // Limpieza de mensajes antiguos
    console.log('📅 Eliminando mensajes con más de 7 días...');
    const oldDeleted = await MessageCleanupService.deleteOldMessages();
    console.log(`   ✓ ${oldDeleted} mensajes antiguos eliminados`);

    // Limpieza de mensajes excedentes
    console.log('');
    console.log('📊 Limitando conversaciones a 100 mensajes máximo...');
    const excessDeleted = await MessageCleanupService.limitMessagesPerConversation();
    console.log(`   ✓ ${excessDeleted} mensajes excedentes eliminados`);

    console.log('');
    console.log('✅ Limpieza completada exitosamente');
    console.log(`   Total eliminado: ${oldDeleted + excessDeleted} mensajes`);
  } catch (error) {
    console.error('❌ Error al ejecutar limpieza:', error);
    exitCode = 1;
  } finally {
    try {
      await pool.end();
    } catch (e) {
      // Ignorar errores al cerrar el pool
    }
  }

  process.exit(exitCode);
}

runCleanup();
