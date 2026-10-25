import * as fs from 'fs';
import * as path from 'path';
import { getEventImageFolder, resolveEventImageUrl } from './event-image-folders';

const EVENTS_DIR = path.join(process.cwd(), 'public', 'images', 'eventos');
const EVENTS_JSON = path.join(process.cwd(), 'public', 'data', 'events.json');

/**
 * Mueve las imágenes sueltas de public/images/eventos a una carpeta por evento
 * y actualiza las rutas de public/data/events.json.
 *
 * Uso: npm run images:organize [-- --dry-run]
 */
function organizeImages(dryRun: boolean): void {
  if (!fs.existsSync(EVENTS_DIR)) {
    console.error(`❌ No existe el directorio: ${EVENTS_DIR}`);
    process.exit(1);
  }

  const files = fs
    .readdirSync(EVENTS_DIR, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name);

  const plan = new Map<string, string[]>();
  for (const file of files) {
    const folder = getEventImageFolder(file);
    plan.set(folder, [...(plan.get(folder) ?? []), file]);
  }

  console.log(`${dryRun ? '🔍 [dry-run] ' : ''}📁 ${files.length} archivos → ${plan.size} carpetas\n`);

  let moved = 0;
  let skipped = 0;

  for (const [folder, folderFiles] of [...plan.entries()].sort()) {
    console.log(`  ${folder}/  (${folderFiles.length})`);
    if (dryRun) continue;

    const folderPath = path.join(EVENTS_DIR, folder);
    fs.mkdirSync(folderPath, { recursive: true });

    for (const file of folderFiles) {
      const target = path.join(folderPath, file);
      if (fs.existsSync(target)) {
        console.warn(`    ⚠️  Ya existe, se omite: ${folder}/${file}`);
        skipped++;
        continue;
      }
      fs.renameSync(path.join(EVENTS_DIR, file), target);
      moved++;
    }
  }

  if (!dryRun) {
    console.log(`\n✅ Movidos: ${moved} | Omitidos: ${skipped}`);
  }

  updateEventsJson(dryRun);
}

function updateEventsJson(dryRun: boolean): void {
  if (!fs.existsSync(EVENTS_JSON)) {
    console.warn(`⚠️  No se encontró ${EVENTS_JSON}, se omite la actualización del JSON`);
    return;
  }

  const events = JSON.parse(fs.readFileSync(EVENTS_JSON, 'utf-8')) as Array<{
    imageUrl?: string;
    additionalImages?: string[];
  }>;

  let changed = 0;
  for (const event of events) {
    if (event.imageUrl) {
      const resolved = resolveEventImageUrl(event.imageUrl);
      if (resolved !== event.imageUrl) {
        event.imageUrl = resolved;
        changed++;
      }
    }
    if (event.additionalImages) {
      event.additionalImages = event.additionalImages.map(resolveEventImageUrl);
    }
  }

  console.log(`\n📝 events.json: ${changed} imageUrl actualizadas`);
  if (!dryRun) {
    fs.writeFileSync(EVENTS_JSON, JSON.stringify(events, null, 2) + '\n', 'utf-8');
  }
}

organizeImages(process.argv.includes('--dry-run'));
