/**
 * Utilidades para generar slugs URL-friendly
 */

/**
 * Genera un slug SEO-friendly desde un texto
 * Convierte texto en formato URL seguro:
 * - Minúsculas
 * - Sin acentos
 * - Espacios y caracteres especiales convertidos a guiones
 * - Sin guiones al inicio o final
 *
 * @param text - Texto a convertir (título del evento)
 * @returns Slug URL-friendly
 *
 * @example
 * generateSlug('Llegada del Hombre a la Luna') // 'llegada-del-hombre-a-la-luna'
 * generateSlug('Caída del Muro de Berlín 1989') // 'caida-del-muro-de-berlin-1989'
 */
export function generateSlug(text: string): string {
  if (!text) return '';

  return text
    .toLowerCase() // Convertir a minúsculas
    .normalize('NFD') // Normalizar caracteres Unicode (separar acentos)
    .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
    .replace(/[^a-z0-9]+/g, '-') // Reemplazar caracteres no alfanuméricos con guiones
    .replace(/^-+|-+$/g, '') // Eliminar guiones al inicio y final
    .substring(0, 100); // Limitar longitud máxima
}

/**
 * Genera un slug único combinando título y fecha
 * Útil para eventos que puedan tener títulos similares
 *
 * @param title - Título del evento
 * @param date - Fecha del evento (opcional)
 * @returns Slug único
 *
 * @example
 * generateEventSlug('Batalla de Waterloo', '1815-06-18') // 'batalla-de-waterloo-1815'
 */
export function generateEventSlug(title: string, date?: string): string {
  const titleSlug = generateSlug(title);

  if (!date) return titleSlug;

  // Extraer año de la fecha
  const year = date.match(/\d{4}/)?.[0];

  if (year && !titleSlug.includes(year)) {
    return `${titleSlug}-${year}`;
  }

  return titleSlug;
}

/**
 * Valida si un slug es válido
 * @param slug - Slug a validar
 * @returns true si es válido
 */
export function isValidSlug(slug: string): boolean {
  // Solo permite letras minúsculas, números y guiones
  // No permite guiones al inicio o final
  return /^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug);
}
