/**
 * Script para exportar backup de eventos con imágenes
 * Crea un archivo JSON con todos los eventos para poder hacer rollback
 */

import * as fs from 'fs';
import * as path from 'path';
import { query } from '../config/database';

interface EventRow {
  id: string;
  title: string;
  image_url: string;
  additional_images: string[] | null;
}

/**
 * Exportar eventos a backup JSON
 */
async function exportBackup(outputPath?: string) {
  console.log('📋 Iniciando exportación de backup...\n');

  try {
    // Obtener todos los eventos
    const result = await query(
      'SELECT id, title, image_url, additional_images FROM events ORDER BY title ASC',
    );
    const events: EventRow[] = result.rows;

    console.log(`📚 Se encontraron ${events.length} eventos\n`);

    // Determinar ruta de salida
    const backupPath =
      outputPath ||
      path.join(
        process.cwd(),
        'backups',
        `events-backup-${new Date().toISOString().split('T')[0]}.json`,
      );

    // Crear directorio si no existe
    const backupDir = path.dirname(backupPath);
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    // Escribir backup
    fs.writeFileSync(backupPath, JSON.stringify(events, null, 2), 'utf-8');

    console.log('='.repeat(80));
    console.log('✅ BACKUP CREADO EXITOSAMENTE');
    console.log('='.repeat(80));
    console.log(`📁 Ubicación: ${backupPath}`);
    console.log(`📊 Total de eventos: ${events.length}`);
    console.log(`💾 Tamaño: ${(fs.statSync(backupPath).size / 1024).toFixed(2)} KB`);
    console.log('='.repeat(80) + '\n');

    console.log('📌 Para restaurar desde este backup:');
    console.log(`   npm run db:rollback-images -- ${backupPath}\n`);

    return backupPath;
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  const args = process.argv.slice(2);
  const outputPath = args[0];

  exportBackup(outputPath).then(() => {
    process.exit(0);
  });
}

export default exportBackup;
