/**
 * Convierte un string o array de strings en un array de párrafos
 */
export function getParagraphs(text: string | string[]): string[] {
  if (Array.isArray(text)) {
    return text;
  }

  // Divide por saltos de línea dobles o simples
  return text
    .split(/\n\s*\n|\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
}

/**
 * Convierte un string o array en un solo string
 */
export function getPlainText(text: string | string[]): string {
  if (Array.isArray(text)) {
    return text.join(' ');
  }
  return text;
}
