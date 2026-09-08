/**
 * Script para verificar y recuperar desde PostgreSQL backups
 * Intenta encontrar backups automáticos o WAL recovery
 */

import { exec } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * Buscar backups de PostgreSQL en el sistema
 */
async function findPostgresBackups() {
  console.log('🔍 Buscando backups de PostgreSQL...\n');

  const commonBackupPaths = [
    '/var/lib/postgresql/backups',
    '/var/backups/postgresql',
    '/home/*/backups/postgresql',
    '/opt/backups/postgresql',
    '/backup/postgresql',
    '/srv/backups/postgresql',
    process.env.PGBACKUP_PATH || '',
  ].filter((p) => p);

  const foundBackups: string[] = [];

  for (const backupPath of commonBackupPaths) {
    try {
      if (fs.existsSync(backupPath)) {
        console.log(`📁 Encontrado: ${backupPath}`);
        const files = fs.readdirSync(backupPath);
        files.forEach((file) => {
          const fullPath = path.join(backupPath, file);
          if (fs.statSync(fullPath).isFile()) {
            foundBackups.push(fullPath);
            console.log(`   📦 ${file}`);
          }
        });
      }
    } catch (error) {
      // Ignorar errores de permisos
    }
  }

  console.log('\n='.repeat(80));
  if (foundBackups.length > 0) {
    console.log('✅ BACKUPS ENCONTRADOS:');
    console.log('='.repeat(80));
    foundBackups.forEach((backup) => {
      try {
        const stats = fs.statSync(backup);
        const date = new Date(stats.mtimeMs);
        console.log(`📦 ${backup}`);
        console.log(
          `   Tamaño: ${(stats.size / (1024 * 1024)).toFixed(2)} MB | Fecha: ${date.toISOString()}`,
        );
      } catch (error) {
        console.log(`📦 ${backup}`);
      }
    });
  } else {
    console.log('❌ NO SE ENCONTRARON BACKUPS');
  }
  console.log('='.repeat(80) + '\n');

  return foundBackups;
}

/**
 * Verificar si PostgreSQL tiene WAL archiving habilitado
 */
async function checkWalArchiving() {
  console.log('🔧 Verificando configuración de PostgreSQL WAL...\n');

  try {
    // Intentar conectar a PostgreSQL y verificar configuración
    const { stdout } = await execAsync(
      `psql -U postgres -c "SHOW wal_level;" 2>/dev/null || echo "No se pudo conectar"`,
    );

    console.log('WAL Level:', stdout.trim());

    if (stdout.includes('replica') || stdout.includes('logical')) {
      console.log('✅ WAL archiving está HABILITADO - Recuperación posible');
      return true;
    } else {
      console.log('⚠️  WAL archiving puede no estar completamente habilitado');
      return false;
    }
  } catch (error) {
    console.log('ℹ️  No se pudo verificar la configuración WAL');
    return null;
  }
}

/**
 * Listar archivos WAL disponibles
 */
async function listWalFiles() {
  console.log('\n📋 Archivos WAL disponibles:\n');

  const commonWalPaths = [
    '/var/lib/postgresql/*/pg_wal',
    '/var/lib/postgresql/*/pg_wal/archive_status',
  ];

  let foundWals = false;

  for (const walPattern of commonWalPaths) {
    try {
      // Expandir glob pattern manualmente
      const basePath = walPattern.split('*')[0];
      if (fs.existsSync(basePath)) {
        const contents = fs.readdirSync(basePath);
        for (const dir of contents) {
          const fullWalPath = walPattern.replace('*', dir);
          if (fs.existsSync(fullWalPath)) {
            foundWals = true;
            const files = fs.readdirSync(fullWalPath);
            if (files.length > 0) {
              console.log(`📁 ${fullWalPath}`);
              files.slice(0, 5).forEach((file) => {
                console.log(`   📄 ${file}`);
              });
              if (files.length > 5) {
                console.log(`   ... y ${files.length - 5} archivos más`);
              }
            }
          }
        }
      }
    } catch (error) {
      // Ignorar
    }
  }

  if (!foundWals) {
    console.log('ℹ️  No se encontraron archivos WAL accesibles');
  }

  return foundWals;
}

/**
 * Generar instrucciones de recuperación manual
 */
function printRecoveryInstructions(backups: string[]) {
  console.log('\n='.repeat(80));
  console.log('📚 INSTRUCCIONES DE RECUPERACIÓN MANUAL:');
  console.log('='.repeat(80) + '\n');

  console.log('OPCIÓN 1: Restaurar desde Backup SQL');
  console.log('─'.repeat(80));
  if (backups.length > 0) {
    console.log('Ejecutar uno de estos comandos:');
    backups.slice(0, 3).forEach((backup) => {
      console.log(`  psql -U postgres -d epicstoria < ${backup}`);
    });
  } else {
    console.log('  # Encuentra tu archivo de backup .sql');
    console.log('  psql -U postgres -d epicstoria < ./backup.sql');
  }

  console.log('\nOPCIÓN 2: Recuperación Point-in-Time (PITR)');
  console.log('─'.repeat(80));
  console.log(`  # Contactar al administrador de BD para:
  # 1. Encontrar el timestamp anterior a: ${new Date().toISOString()}
  # 2. Ejecutar: pg_basebackup + recuperación WAL hasta ese punto
  # 3. O usar: pg_restore con --set search_path=public`);

  console.log('\nOPCIÓN 3: Recrear additional_images desde Archivos');
  console.log('─'.repeat(80));
  console.log(`  npm run db:recover-images-fs -- /ruta/a/carpeta/imagenes`);

  console.log('\n' + '='.repeat(80) + '\n');
}

// Ejecutar
async function main() {
  console.log('🔧 PostgreSQL Backup & Recovery Diagnostics\n');

  const backups = await findPostgresBackups();
  await checkWalArchiving();
  await listWalFiles();
  printRecoveryInstructions(backups);

  console.log('💡 PRÓXIMOS PASOS:');
  console.log('─'.repeat(80));
  console.log('1. Si tienes un backup .sql:');
  console.log('   psql -U postgres -d epicstoria < /ruta/a/backup.sql\n');

  console.log('2. Si las imágenes aún existen en el servidor:');
  console.log('   npm run db:recover-images-fs -- /ruta/a/imagenes\n');

  console.log('3. Si nada funciona:');
  console.log('   Contacta al proveedor de hosting para recuperación de BD\n');
}

if (require.main === module) {
  main().catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
}
