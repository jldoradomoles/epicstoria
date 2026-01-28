/**
 * Utilidades para manejar imágenes de eventos
 */

/**
 * Intenta cargar una imagen con diferentes extensiones (png, jpg, jpeg, gif, webp)
 * @param basePath - Ruta base sin extensión (ej: "/images/evento-id")
 * @returns Promise con la URL de la imagen que se cargó exitosamente
 */
export async function tryLoadImageFormats(basePath: string): Promise<string> {
  // Reordenado para probar PNG primero, que es más común en este proyecto
  const extensions = ['png', 'jpg', 'jpeg', 'gif', 'webp'];

  for (const ext of extensions) {
    const imageUrl = `${basePath}.${ext}`;
    try {
      await checkImageExists(imageUrl);
      return imageUrl;
    } catch {
      // Continúa con la siguiente extensión
    }
  }

  // Si ninguna funciona, lanzar error
  throw new Error(`No valid image format found for: ${basePath}`);
}

/**
 * Verifica si una imagen existe y se puede cargar
 * @param imageUrl - URL de la imagen a verificar
 * @returns Promise que se resuelve si la imagen existe
 */
function checkImageExists(imageUrl: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    // Lazy loading por defecto para mejor performance
    img.setAttribute('loading', 'lazy');

    img.onload = () => resolve();
    img.onerror = () => reject();
    img.src = imageUrl;
  });
}

/**
 * Obtiene la URL de imagen con formato automático
 * Si el evento tiene imageUrl completa, la usa. Si no, intenta generar automáticamente
 * @param event - Evento con id e imageUrl opcional
 * @returns URL de imagen procesada
 */
export function getEventImageUrl(event: { id: string; imageUrl?: string }): string {
  if (event.imageUrl) {
    return event.imageUrl;
  }

  // Generar automáticamente basado en el ID
  return `/images/eventos/${event.id}`;
}

/**
 * Maneja el error de carga de imagen intentando formatos alternativos
 * @param event - Evento del DOM del error
 * @param originalUrl - URL original que falló
 * @param defaultImage - Imagen por defecto si todo falla
 */
export async function handleImageError(
  event: Event,
  originalUrl: string,
  defaultImage: string,
): Promise<void> {
  const imgElement = event.target as HTMLImageElement;

  // Si ya estamos mostrando la imagen por defecto, no hacer nada más
  if (originalUrl === defaultImage || imgElement.src === defaultImage) {
    return;
  }

  // Extraer la ruta base sin extensión
  const pathWithoutExt = originalUrl.replace(/\.(jpg|jpeg|png|gif|webp)$/i, '');

  try {
    // Intentar con diferentes formatos
    const workingUrl = await tryLoadImageFormats(pathWithoutExt);
    if (workingUrl !== originalUrl) {
      imgElement.src = workingUrl;
      return;
    }
  } catch {
    // Si todo falla, usar imagen por defecto sin mostrar error
    // El placeholder ya está manejando la visualización
  }

  // Usar imagen por defecto silenciosamente
  imgElement.src = defaultImage;
}
