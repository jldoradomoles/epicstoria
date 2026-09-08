#!/usr/bin/env node

/**
 * Quick Deploy Script for Production
 *
 * Este script automatiza el despliegue completo incluyendo la migración de imágenes
 *
 * Uso:
 *   npx ts-node backend/scripts/quick-deploy.ts
 *
 * O desde bash:
 *   npm run deploy:prod
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface DeployStep {
  name: string;
  command: string;
  critical: boolean; // Si falla, ¿detener el despliegue?
}

const steps: DeployStep[] = [
  {
    name: '📥 Pull latest code',
    command: 'git pull origin main',
    critical: true,
  },
  {
    name: '📦 Install backend dependencies',
    command: 'cd backend && npm install --production=false',
    critical: true,
  },
  {
    name: '🔨 Build backend',
    command: 'cd backend && npm run build',
    critical: true,
  },
  {
    name: '🎨 Migrate images to WebP',
    command: 'cd backend && npm run db:migrate-images-to-webp',
    critical: false, // No detener si falla
  },
  {
    name: '✅ Verify image URLs',
    command: 'cd backend && npm run db:check-image-urls',
    critical: false,
  },
];

async function runStep(step: DeployStep, index: number): Promise<boolean> {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`[${index}/${steps.length}] ${step.name}`);
  console.log(`${'='.repeat(80)}`);
  console.log(`Command: ${step.command}\n`);

  try {
    const { stdout, stderr } = await execAsync(step.command);
    if (stdout) console.log(stdout);
    if (stderr) console.error(stderr);
    console.log(`✅ Paso completado\n`);
    return true;
  } catch (error: any) {
    console.error(`❌ Error: ${error.message}\n`);

    if (step.critical) {
      console.error(`⚠️  Este paso es crítico. Despliegue abortado.`);
      return false;
    } else {
      console.warn(`⚠️  Paso no crítico falló. Continuando...\n`);
      return true;
    }
  }
}

async function deploy() {
  console.log(`
╔${'-'.repeat(78)}╗
║                                                                              ║
║  🚀 EPICSTORIA PRODUCTION DEPLOYMENT - IMAGES TO WEBP MIGRATION             ║
║                                                                              ║
╚${'-'.repeat(78)}╝
`);

  console.log(`⏰ Start time: ${new Date().toISOString()}`);
  console.log(`📁 Directory: ${process.cwd()}`);
  console.log(`👤 User: ${process.env.USER || 'unknown'}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    const result = await runStep(step, i + 1);

    if (result) {
      successCount++;
    } else {
      failCount++;
      break; // Detener si falla un paso crítico
    }
  }

  // Resumen final
  console.log(`\n${'='.repeat(80)}`);
  console.log('📊 DEPLOYMENT SUMMARY');
  console.log('='.repeat(80));
  console.log(`✅ Completed steps: ${successCount}/${steps.length}`);
  console.log(`❌ Failed steps: ${failCount}/${steps.length}`);
  console.log(`⏰ End time: ${new Date().toISOString()}`);
  console.log('='.repeat(80));

  if (failCount === 0) {
    console.log(`
╔${'-'.repeat(78)}╗
║                                                                              ║
║  🎉 DEPLOYMENT COMPLETED SUCCESSFULLY!                                      ║
║                                                                              ║
║  Next steps:                                                                 ║
║  1. Restart the application: pm2 reload ecosystem.config.js                 ║
║  2. Verify images load: curl http://localhost:3000/api/events              ║
║  3. Check browser console for errors                                        ║
║  4. Monitor logs: tail -f logs/backend-out.log                              ║
║                                                                              ║
╚${'-'.repeat(78)}╝
    `);
    process.exit(0);
  } else {
    console.log(`
╔${'-'.repeat(78)}╗
║                                                                              ║
║  ⚠️  DEPLOYMENT FAILED                                                       ║
║                                                                              ║
║  Review the errors above and:                                               ║
║  1. Fix the issues                                                           ║
║  2. Run this script again                                                    ║
║  3. If critical error, consider rollback                                     ║
║                                                                              ║
╚${'-'.repeat(78)}╝
    `);
    process.exit(1);
  }
}

// Ejecutar despliegue
deploy().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
