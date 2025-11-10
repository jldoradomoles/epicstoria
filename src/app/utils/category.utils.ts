/**
 * Utilidades para manejar categorías de eventos
 */

/**
 * Mapa de colores por categoría
 */
export const CATEGORY_COLORS: { [key: string]: string } = {
  Hazaña: 'bg-red-600',
  Ciencia: 'bg-green-600',
  Política: 'bg-yellow-600',
  Libertad: 'bg-purple-600',
  Tecnología: 'bg-indigo-600',
  Historia: 'bg-blue-600',
  Cultura: 'bg-pink-600',
  Economía: 'bg-orange-600',
  Deporte: 'bg-teal-600',
  Arte: 'bg-rose-600',
};

/**
 * Obtiene el color de la categoría basado en el nombre
 * @param category - Nombre de la categoría
 * @returns Clase CSS de Tailwind para el color de fondo
 */
export function getCategoryColor(category: string): string {
  return CATEGORY_COLORS[category] || 'bg-gray-600';
}

/**
 * Obtiene todas las categorías disponibles
 * @returns Array con los nombres de las categorías
 */
export function getCategories(): string[] {
  return Object.keys(CATEGORY_COLORS);
}
