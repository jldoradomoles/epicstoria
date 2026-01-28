import cron from 'node-cron';
import { MessageCleanupService } from '../services/message-cleanup.service';

/**
 * Tarea programada para limpiar mensajes
 * Se ejecuta todos los días a las 3:00 AM
 */
export function scheduleMessageCleanup() {
  // Ejecutar todos los días a las 3:00 AM
  cron.schedule('0 3 * * *', async () => {
    console.log('🧹 Iniciando limpieza automática de mensajes...');

    try {
      const result = await MessageCleanupService.runCleanup();

      console.log(`✅ Limpieza completada:`);
      console.log(`   - Mensajes antiguos (>7 días) eliminados: ${result.oldDeleted}`);
      console.log(
        `   - Mensajes excedentes (>100 por conversación) eliminados: ${result.excessDeleted}`,
      );
    } catch (error) {
      console.error('❌ Error en limpieza automática de mensajes:', error);
    }
  });

  console.log('⏰ Tarea de limpieza de mensajes programada para las 3:00 AM diariamente');
}
