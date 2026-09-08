/**
 * MASTER RECOVERY WIZARD
 * Script interactivo para recuperar imágenes adicionales perdidas
 */

import { exec } from 'child_process';
import * as fs from 'fs';
import * as readline from 'readline';
import { promisify } from 'util';
import { query } from '../config/database';

const execAsync = promisify(exec);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const prompt = (question: string): Promise<string> => {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
};

/**
 * Menu principal del wizard
 */
async function recoveryWizard() {
  console.clear();
  console.log('╔' + '═'.repeat(78) + '╗');
  console.log('║' + '  🔧 EPICSTORIA - IMAGE RECOVERY WIZARD  '.padEnd(79) + '║');
  console.log('║' + ' Herramienta para recuperar imágenes adicionales perdidas'.padEnd(79) + '║');
  console.log('╚' + '═'.repeat(78) + '╝\n');

  // Paso 1: Diagnosticar
  console.log('📊 PASO 1: DIAGNOSTICANDO ESTADO ACTUAL...\n');

  try {
    const result = await query(
      "SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE additional_images IS NULL OR additional_images = '[]'::jsonb) as empty FROM events",
    );
    const row = result.rows[0];
    const emptyCount = parseInt(row.empty || 0);
    const totalCount = parseInt(row.total || 0);

    console.log(`✅ Total de eventos: ${totalCount}`);
    console.log(`❌ Eventos sin imágenes adicionales: ${emptyCount}`);
    console.log(`📊 Porcentaje afectado: ${((emptyCount / totalCount) * 100).toFixed(2)}%\n`);

    if (emptyCount === 0) {
      console.log('🎉 No se encontraron eventos sin imágenes adicionales!');
      console.log('   La recuperación podría ya estar completa.\n');
      rl.close();
      return;
    }
  } catch (error) {
    console.error('❌ Error al diagnosticar:', error);
    rl.close();
    process.exit(1);
  }

  // Paso 2: Ofrecer opciones
  console.log('\n='.repeat(80));
  console.log('🔧 OPCIONES DE RECUPERACIÓN:');
  console.log('='.repeat(80) + '\n');

  console.log('1️⃣  Recuperar desde FILESYSTEM');
  console.log('   (Si las imágenes aún existen en el servidor)');
  console.log('   → npm run db:recover-images-fs -- /ruta/imagenes\n');

  console.log('2️⃣  Recuperar desde BACKUP POSTGRESQL');
  console.log('   (Si tienes backup .sql)');
  console.log('   → Restaurar backup y ejecutar db:recover-images-fs\n');

  console.log('3️⃣  Verificar BACKUPS DEL SISTEMA');
  console.log('   (Buscar backups automáticos de PostgreSQL)');
  console.log('   → npm run db:backup-diagnostics\n');

  console.log('4️⃣  Ver MANUAL DE RECUPERACIÓN');
  console.log('   (Instrucciones detalladas)\n');

  const choice = await prompt('¿Cuál es tu situación? (1-4): ');

  switch (choice.trim()) {
    case '1':
      await option1FilesystemRecovery();
      break;
    case '2':
      await option2BackupRecovery();
      break;
    case '3':
      await option3CheckBackups();
      break;
    case '4':
      await option4ShowManual();
      break;
    default:
      console.log('❌ Opción no válida');
  }

  rl.close();
}

/**
 * Opción 1: Recuperar desde filesystem
 */
async function option1FilesystemRecovery() {
  console.clear();
  console.log('📸 OPCIÓN 1: RECUPERAR DESDE FILESYSTEM\n');

  console.log('Este proceso:');
  console.log('  1. Buscará carpetas de eventos en tu servidor');
  console.log('  2. Encontrará archivos de imagen');
  console.log('  3. Reconstruirá el array additional_images en la BD\n');

  const imagesPath = await prompt('📁 Ruta a la carpeta de imágenes: ');

  if (!fs.existsSync(imagesPath)) {
    console.log('❌ Ruta no encontrada:', imagesPath);
    return;
  }

  console.log('\n⏳ Ejecutando recuperación...\n');
  console.log('Ejecuta este comando:');
  console.log(`\n  npm run db:recover-images-fs -- "${imagesPath}"\n`);
  console.log('Este script:');
  console.log('  ✅ Analizará el filesystem');
  console.log('  ✅ Encontrará todas las imágenes adicionales');
  console.log('  ✅ Actualizará la BD automáticamente');
  console.log('  ✅ Mostrará un reporte de resultados\n');
}

/**
 * Opción 2: Recuperar desde backup SQL
 */
async function option2BackupRecovery() {
  console.clear();
  console.log('🗄️  OPCIÓN 2: RECUPERAR DESDE BACKUP SQL\n');

  const backupFile = await prompt('📦 Ruta al archivo de backup .sql: ');

  if (!fs.existsSync(backupFile)) {
    console.log('❌ Archivo no encontrado:', backupFile);
    return;
  }

  console.log('\n⚠️  ADVERTENCIA:');
  console.log('  Este proceso restaurará TODA la base de datos');
  console.log('  La versión actual se PERDERÁ completamente\n');

  const confirm = await prompt('¿Estás seguro? (sí/no): ');

  if (confirm.toLowerCase() !== 'sí' && confirm.toLowerCase() !== 'si') {
    console.log('❌ Operación cancelada');
    return;
  }

  console.log('\n📋 Comandos para restaurar:\n');

  console.log('1. Detener la aplicación:');
  console.log('   cd backend && npm stop\n');

  console.log('2. Respaldar BD actual (por seguridad):');
  console.log('   pg_dump -U postgres epicstoria > backup-actual.sql\n');

  console.log('3. Restaurar desde backup anterior:');
  console.log(`   psql -U postgres epicstoria < "${backupFile}"\n`);

  console.log('4. Recuperar imágenes desde filesystem:');
  console.log('   npm run db:recover-images-fs -- /ruta/a/imagenes\n');

  console.log('5. Reiniciar la aplicación:');
  console.log('   npm run dev\n');
}

/**
 * Opción 3: Verificar backups del sistema
 */
async function option3CheckBackups() {
  console.clear();
  console.log('🔍 VERIFICANDO BACKUPS DEL SISTEMA...\n');

  console.log('Ejecuta este comando para buscar backups automáticos:');
  console.log('\n  npm run db:backup-diagnostics\n');

  console.log('Este script:');
  console.log('  ✅ Buscará archivos de backup .sql en rutas comunes');
  console.log('  ✅ Verificará WAL archiving en PostgreSQL');
  console.log('  ✅ Listará archivos WAL disponibles');
  console.log('  ✅ Dará instrucciones de recuperación manual\n');

  console.log('Rutas donde buscará:');
  console.log('  • /var/lib/postgresql/backups');
  console.log('  • /var/backups/postgresql');
  console.log('  • /opt/backups/postgresql');
  console.log('  • /backup/postgresql\n');

  console.log('Si tu hosting está en Hostinger/OVH/AWS, contacta al soporte');
  console.log('pidiendo:');
  console.log('  1. Un backup anterior a ' + new Date().toISOString().split('T')[0]);
  console.log('  2. Acceso a Point-in-Time Recovery (PITR)');
  console.log('  3. Acceso a los archivos de backup\n');
}

/**
 * Opción 4: Mostrar manual completo
 */
async function option4ShowManual() {
  console.clear();
  console.log('📚 MANUAL COMPLETO DE RECUPERACIÓN\n');

  console.log('╔' + '═'.repeat(78) + '╗');
  console.log('║ ESCENARIO 1: Aún tienes el filesystem de imágenes'.padEnd(79) + '║');
  console.log('╚' + '═'.repeat(78) + '╝\n');

  console.log('1. Hacer backup del estado actual:');
  console.log('   npm run db:export-backup\n');

  console.log('2. Ejecutar recuperación:');
  console.log('   npm run db:recover-images-fs -- /ruta/a/imagenes\n');

  console.log('3. Verificar resultados:');
  console.log('   npm run db:diagnostic-images\n');

  console.log('╔' + '═'.repeat(78) + '╗');
  console.log('║ ESCENARIO 2: Tienes backup .sql previo'.padEnd(79) + '║');
  console.log('╚' + '═'.repeat(78) + '╝\n');

  console.log('1. Respaldar BD actual:');
  console.log('   pg_dump -U postgres epicstoria > backup-actual.sql\n');

  console.log('2. Restaurar desde backup:');
  console.log('   psql -U postgres epicstoria < backup-anterior.sql\n');

  console.log('3. Recuperar imágenes desde filesystem:');
  console.log('   npm run db:recover-images-fs -- /ruta/a/imagenes\n');

  console.log('╔' + '═'.repeat(78) + '╗');
  console.log('║ ESCENARIO 3: No tienes nada - Contactar hosting'.padEnd(79) + '║');
  console.log('╚' + '═'.repeat(78) + '╝\n');

  console.log('Pedir al hosting:');
  console.log('  1. Backup de BD anterior a ' + new Date().toISOString().split('T')[0]);
  console.log('  2. Restore desde backup o Point-in-Time Recovery');
  console.log('  3. Verificar que additional_images esté poblado\n');

  console.log('📞 Hosts típicos:');
  console.log('  • Hostinger: Portal > Mi cuenta > Bases de datos');
  console.log('  • AWS RDS: Console > Snapshots');
  console.log('  • Azure: Portal > Backups');
  console.log('  • DigitalOcean: Manage > Backups\n');
}

// Ejecutar wizard
recoveryWizard().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
