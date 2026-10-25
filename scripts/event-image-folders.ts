/**
 * Regla compartida para agrupar las imágenes de eventos en una carpeta por evento.
 * NOTA: hay una copia en backend/src/utils/event-image.utils.ts (el backend compila aparte).
 * Si se cambia la regla aquí, cambiarla también allí.
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
