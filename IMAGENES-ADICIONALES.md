# Sistema de Imágenes Adicionales

## Descripción

Este sistema permite agregar imágenes adicionales a los eventos que se mostrarán automáticamente en las secciones de **Contexto Histórico** y **Datos Curiosos** de la página de detalle del evento.

## Funcionamiento

### 1. Nomenclatura de Archivos

Las imágenes adicionales deben seguir el patrón: `{nombre-del-evento}-{numero}.{extension}`

**Ejemplos:**

- `El-Cristo-del-abismo-2.jpg`
- `El-Cristo-del-abismo-3.jpg`
- `Jane-Goodall-2.jpg`
- `Jane-Goodall-3.jpg`

### 2. Ubicación

Las imágenes deben ubicarse en: `public/images/eventos/`

### 3. Detección Automática

El sistema detecta automáticamente las imágenes con sufijos numéricos (-1, -2, -3, etc.) y las almacena en la base de datos en el campo `additional_images`.

### 4. Distribución de Imágenes

Las imágenes adicionales se distribuyen en el orden de detección:

**Contexto Histórico:**

- Índice 0 (`-2.jpg`): Se muestra en el primer párrafo (lado izquierdo)
- Índice 1 (`-3.jpg`): Se muestra en el tercer párrafo (lado derecho)

**Datos Curiosos:**

- Índice 2 (`-4.jpg`): Se muestra con el primer dato curioso (lado izquierdo)
- Índice 3 (`-5.jpg`): Se muestra con el quinto dato curioso (lado derecho)
- Índice 4 (`-6.jpg`): Se muestra con el último dato curioso si el total es impar (lado izquierdo)

### 5. Comportamiento

- Si no existen imágenes con sufijos, **no se muestra ninguna imagen** en esas posiciones
- La imagen principal del evento (`{nombre-del-evento}.jpg`) se usa solo en el hero y no se repite
- Solo se muestran imágenes si existen físicamente

## Cómo Agregar Imágenes Adicionales

### Opción 1: Manualmente

1. Sube las imágenes con el patrón de nombre correcto a `public/images/eventos/`
2. Ejecuta el script de detección:
   ```bash
   cd backend
   npx tsx src/database/add-additional-images.ts
   ```

### Opción 2: Subida desde Administración

Las imágenes subidas desde la interfaz de administración se detectan automáticamente si siguen el patrón de nombres.

## Ejemplo Completo

Para el evento "El Cristo del abismo" (`El-Cristo-del-abismo`):

```
public/images/eventos/
├── El-Cristo-del-abismo.jpg      # Imagen principal (hero)
├── El-Cristo-del-abismo-2.jpg    # Contexto (párrafo 1, izquierda)
├── El-Cristo-del-abismo-3.jpg    # Contexto (párrafo 3, derecha)
├── El-Cristo-del-abismo-4.jpg    # Datos curiosos (dato 1, izquierda)
├── El-Cristo-del-abismo-5.jpg    # Datos curiosos (dato 5, derecha)
└── El-Cristo-del-abismo-6.jpg    # Datos curiosos (último dato, izquierda)
```

## Migración de Base de Datos

Si ya tienes imágenes con el patrón correcto, ejecuta:

```bash
cd backend
npx tsx src/database/add-additional-images.ts
```

Este script:

1. Agrega la columna `additional_images` a la tabla `events` si no existe
2. Detecta automáticamente todas las imágenes con sufijos numéricos
3. Actualiza la base de datos con las rutas encontradas

## Notas Técnicas

- **Modelo Frontend**: `Event.additionalImages?: string[]`
- **Modelo Backend**: `Event.additional_images?: string[]`
- **Formato de almacenamiento**: JSONB array en PostgreSQL
- **Límite de detección**: Hasta 10 imágenes por evento (-1 a -10)
- **Extensiones soportadas**: .jpg, .jpeg, .png, .gif, .webp

## Verificación

Para verificar que las imágenes se han detectado correctamente:

1. Consulta la base de datos:

   ```sql
   SELECT id, title, additional_images FROM events WHERE additional_images != '[]';
   ```

2. O revisa la consola del navegador al cargar un evento (aparecerá `additionalImages` en el objeto event)
