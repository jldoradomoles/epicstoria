/**
 * Utilidades para generar slugs URL-friendly
 */

/**
 * Genera un slug SEO-friendly desde un texto
 * @param text - Texto a convertir
 * @returns Slug URL-friendly
 */
export function generateSlug(text: string): string {
  if (!text) return '';

  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100);
}

/**
 * Genera un slug único combinando título y fecha
 * @param title - Título del evento
 * @param date - Fecha del evento
 * @returns Slug único
 */
export function generateEventSlug(title: string, date?: string): string {
  const titleSlug = generateSlug(title);

  if (!date) return titleSlug;

  const year = date.match(/\d{4}/)?.[0];

  if (year && !titleSlug.includes(year)) {
    return `${titleSlug}-${year}`;
  }

  return titleSlug;
}
