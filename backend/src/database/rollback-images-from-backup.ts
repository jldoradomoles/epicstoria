/**
 * Script de rollback para restaurar imágenes de backup
 * Restaura las URLs de imágenes desde un backup JSON
 */

import * as fs from 'fs';
import { query } from '../config/database';

interface EventBackup {
  id: string;
  title: string;
  image_url: string;
  additional_images: string[] | null;
}

/**
 * Restaurar desde backup JSON
 */
async function rollbackFromBackup(backupFilePath: string) {
  console.log('📋 Iniciando rollback desde backup...\n');

  try {
    // Leer el archivo de backup
    if (!fs.existsSync(backupFilePath)) {
      console.error(`❌ No se encontró el archivo de backup: ${backupFilePath}`);
      process.exit(1);
    }

    const backupContent = fs.readFileSync(backupFilePath, 'utf-8');
    const backupData: EventBackup[] = JSON.parse(backupContent);

    console.log(`📚 Se encontraron ${backupData.length} eventos en el backup\n`);

    let successCount = 0;
    let errorCount = 0;

    console.log('💾 Restaurando imágenes desde backup...\n');

    // Restaurar cada evento
    for (const event of backupData) {
      try {
        const additionalImagesValue =
          event.additional_images && event.additional_images.length > 0
            ? JSON.stringify(event.additional_images)
            : null;

        await query(
          'UPDATE events SET image_url = $1, additional_images = $2::jsonb WHERE id = $3',
          [event.image_url, additionalImagesValue, event.id],
        );

        console.log(`✅ "${event.title}"`);
        if (event.additional_images && event.additional_images.length > 0) {
          console.log(`   📸 ${event.additional_images.length} imágenes adicionales restauradas`);
        }
        successCount++;
      } catch (error) {
        console.error(
          `❌ Error al restaurar "${event.title}" (ID: ${event.id}):`,
          (error as any).message,
        );
        errorCount++;
      }
    }

    console.log('\n' + '='.repeat(80));
    console.log('📊 RESULTADO DEL ROLLBACK:');
    console.log('='.repeat(80));
    console.log(`✅ Eventos restaurados: ${successCount}`);
    console.log(`❌ Errores: ${errorCount}`);
    console.log('='.repeat(80) + '\n');

    if (errorCount === 0) {
      console.log('🎉 Rollback completado exitosamente!');
    } else {
      console.log('⚠️  Se completó con errores. Revisa los eventos fallidos.');
    }

    process.exit(errorCount > 0 ? 1 : 0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length < 1) {
    console.log(`
📋 Script de Rollback de Imágenes

Uso: npm run db:rollback-images -- <backup-file.json>

Ejemplo:
  npm run db:rollback-images -- ./backup-events.json

⚠️  Este script restaurará las imágenes desde un archivo de backup.
    Asegúrate de tener un backup válido antes de ejecutar.
    `);
    process.exit(1);
  }

  const backupFile = args[0];
  rollbackFromBackup(backupFile);
}

export default rollbackFromBackup;
