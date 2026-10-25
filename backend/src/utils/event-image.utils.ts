/**
 * Regla compartida para agrupar las imágenes de eventos en una carpeta por evento.
 * NOTA: copia de scripts/event-image-folders.ts. Si se cambia la regla, cambiarla en ambos.
 */

export const UNCLASSIFIED_FOLDER = '_sin-clasificar';

/** Nombres base que no pertenecen a ningún evento */
const UNCLASSIFIED_NAMES = new Set(
  [
    'alejandria',
    'cesar',
    'contexto',
    'dumy',
    'logo',
    'epico-fondo-azul',
    'IMG-20251106-WA0008',
    'Picsart_25-11-07_01-51-53',
    'Picsart_25-11-07_02-19-40',
    'Picsart_25-11-07_02-21-34',
    'event-1768843064025',
  ].map((name) => name.toLowerCase()),
);

/**
 * Devuelve la carpeta de evento para un nombre de archivo.
 * Ej: "Abbas-Ibn-Firnas-2-640.webp" → "Abbas-Ibn-Firnas"
 */
export function getEventImageFolder(fileName: string): string {
  let base = fileName.replace(/\.[^.]+$/, '');

  // Sufijo de tamaño/optimización
  base = base.replace(/-(640|1024|opt)$/i, '');
  if (UNCLASSIFIED_NAMES.has(base.toLowerCase())) {
    return UNCLASSIFIED_FOLDER;
  }

  // Variante móvil y numeración de imágenes adicionales
  base = base.replace(/-movil$/i, '');
  base = base.replace(/-\d+$/, '');
  if (!base || UNCLASSIFIED_NAMES.has(base.toLowerCase())) {
    return UNCLASSIFIED_FOLDER;
  }

  return base;
}

/**
 * Si la URL es "[/]images/eventos/<archivo>" (sin subcarpeta) devuelve
 * "[/]images/eventos/<carpeta>/<archivo>". Cualquier otra URL se deja igual.
 */
export function resolveEventImageUrl(url: string): string {
  if (!url) return url;

  const match = url.match(/^(\/?images\/eventos\/)([^/]+)$/);
  if (!match) return url;

  const [, prefix, fileName] = match;
  return `${prefix}${getEventImageFolder(fileName)}/${fileName}`;
}

/**
 * Resuelve una ruta relativa dentro de `baseDir` ignorando mayúsculas/minúsculas
 * y la forma de normalización Unicode (NFC/NFD) de cada segmento.
 * El servidor es Linux (sensible a mayúsculas) pero muchas imágenes se subieron
 * desde Windows con un casing distinto al guardado en BD.
 * Devuelve la ruta relativa con el casing real, o null si no existe.
 */
export function findImagePathIgnoreCase(baseDir: string, relativePath: string): string | null {
  const fs = require('fs') as typeof import('fs');
  const path = require('path') as typeof import('path');
  const normalize = (s: string) => s.normalize('NFC').toLowerCase();

  let current = baseDir;
  const resolved: string[] = [];

  for (const segment of relativePath.split('/').filter(Boolean)) {
    const exact = path.join(current, segment);
    let actual: string | undefined;

    if (fs.existsSync(exact)) {
      actual = segment;
    } else {
      let entries: string[];
      try {
        entries = fs.readdirSync(current);
      } catch {
        return null;
      }
      actual = entries.find((entry) => normalize(entry) === normalize(segment));
    }

    if (!actual) return null;
    resolved.push(actual);
    current = path.join(current, actual);
  }

  return resolved.join('/');
}
