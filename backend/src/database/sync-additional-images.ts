/**
 * Script para sincronizar automáticamente el campo additional_images de todos los eventos
 * Escanea el filesystem buscando imágenes con patrón nombre-2, nombre-3, etc.
 * y actualiza la BD con las que encuentre.
 *
 * Ejecutar: npm run db:sync-images
 */

import * as fs from 'fs';
import * as path from 'path';
import pool, { query } from '../config/database';

function getPublicPath(): string {
  if (process.env.PUBLIC_DIR) return process.env.PUBLIC_DIR;
  return path.join(process.cwd(), '../public');
}

function detectAdditionalImages(imageUrl: string): string[] {
  if (!imageUrl || imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) return [];

  const additionalImages: string[] = [];
  let imagePath = imageUrl.replace(/^\//, '');

  if (!imagePath.includes('eventos/') && !imagePath.startsWith('http')) {
    const fileName = imagePath.split('/').pop() || imagePath;
    imagePath = `images/eventos/${fileName}`;
  }

  const pathMatch = imagePath.match(/^(.+\/)?(.+?)(\.[^.]+)$/);
  if (!pathMatch) return [];

  const directory = pathMatch[1] || '';
  const baseName = pathMatch[2];
  const extension = pathMatch[3];

  for (let i = 2; i <= 20; i++) {
    const additionalImagePath = `${directory}${baseName}-${i}${extension}`;
    const fullPath = path.join(getPublicPath(), additionalImagePath);
    if (fs.existsSync(fullPath)) {
      additionalImages.push(`/${additionalImagePath}`);
    } else {
      break; // Si no existe -N dejamos de buscar
    }
  }

  return additionalImages;
}

async function syncAdditionalImages() {
  console.log('🔍 Sincronizando imágenes adicionales desde filesystem...\n');

  try {
    const result = await query(
      'SELECT id, title, image_url, additional_images FROM events ORDER BY id',
    );
    const events = result.rows;

    console.log(`📋 Procesando ${events.length} eventos...\n`);

    let updated = 0;
    let unchanged = 0;

    for (const event of events) {
      const detected = detectAdditionalImages(event.image_url);
      const current: string[] = event.additional_images || [];

      const detectedStr = JSON.stringify(detected.sort());
      const currentStr = JSON.stringify([...current].sort());

      if (detectedStr !== currentStr) {
        await query(
          'UPDATE events SET additional_images = $1::jsonb, updated_at = NOW() WHERE id = $2',
          [JSON.stringify(detected), event.id],
        );
        console.log(`  ✅ ${event.id}`);
        console.log(`     Antes:  ${current.length > 0 ? current.join(', ') : '(ninguna)'}`);
        console.log(`     Ahora:  ${detected.length > 0 ? detected.join(', ') : '(ninguna)'}\n`);
        updated++;
      } else {
        unchanged++;
      }
    }

    console.log('─'.repeat(60));
    console.log(`✨ Sync completado:`);
    console.log(`   • Actualizados: ${updated}`);
    console.log(`   • Sin cambios:  ${unchanged}`);
    console.log(`   • Total:        ${events.length}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

syncAdditionalImages();
