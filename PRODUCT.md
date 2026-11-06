# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Dos audiencias confirmadas: **estudiantes** (12–18 años) que usan la plataforma como apoyo educativo en casa o en clase, y **adultos curiosos** de cualquier edad que exploran historia por entretenimiento y cultura general. Ambos grupos buscan aprender de forma accesible y sin el ruido enciclopédico de Wikipedia.

## Product Purpose

Epicstoria es una plataforma interactiva de historia que combina contenido histórico riguroso en español con gamificación (puntos, niveles, quizzes, juegos) para hacer que aprender historia sea atractivo y memorable. El éxito es que el usuario termine un evento con más conocimiento del que tenía —y quiera volver.

## Positioning

La combinación de contenido histórico curado en español con una capa de gamificación (quiz por evento, juegos temáticos, sistema de puntos y niveles, perfil con progreso) que convierte el aprendizaje pasivo en activo. Ninguna enciclopedia española ofrece eso; ninguna plataforma de juegos educativos cubre historia con este nivel de detalle narrativo.

## Operating Context

- Eventos con resumen, contexto, datos clave, timeline y consecuencias.
- Quizzes de 20 preguntas por evento con puntuación y retroalimentación inmediata.
- Sistema de puntos y niveles ligado al perfil de usuario.
- Juegos temáticos adicionales: "¿Quién lo dijo?", "Epic Puzzle", "Imprime y Colorea".
- Galería de imágenes por evento.
- Chat entre usuarios registrados y sistema de amistades.
- Categorías de eventos: política, guerras, cultura, ciencia, arte, mitología, tecnología y espacio, entre otras.
- Contenido gestionado desde hojas de cálculo Excel → JSON (pipeline automatizado).
- Deploy en GitHub Pages y en servidor IONOS; también soporte SSR.

## Capabilities and Constraints

- Angular 21 standalone components, Tailwind CSS, SSR habilitado.
- Autenticación propia (JWT); rutas protegidas con guards.
- Los datos de eventos se cargan desde `/public/data/events.json` generado desde Excel.
- Las imágenes se optimizan a WebP como parte del pipeline.
- El contenido y los juegos están en español.

## Brand Commitments

- **Nombre:** Epicstoria (fijo, sin variantes).
- **Logo:** `images/logo_transparent.png` en el header; debe respetarse sin reemplazarse.
- **Colores base comprometidos:**
  - Header/fondo oscuro: `bg-gray-900` (#111827) con acento ámbar (`amber-400`) para hover y destacados.
  - Fondo de página: beige/crema `#e8dcc4` con imagen de textura (`fondo_home.jpg`).
  - Contenedores: `#1f150ca3` (marrón oscuro semitransparente).
  - Botones: `#fcf8d8` (crema claro) con texto `#1f150c`.
  - Primary CSS: azul intenso `#1e40af`; secondary: rojo `#dc2626`.
- **Tipografía:** Poppins (cuerpo principal), Inter y Satisfy como complementarias.
- El tono de voz es accesible, curioso y entusiasta —no académico ni formal.

## Evidence on Hand

- Implementación visual completa en Angular + Tailwind.
- Contenido real de eventos en `public/data/events.json`.
- Página "Acerca de" con misión, oferta y flujo de uso redactados.
- SEO configurado con metaetiquetas por página.
- Pipeline de Excel→JSON y optimización de imágenes operativo.

## Product Principles

1. **Aprender debe sentirse como jugar.** La gamificación no es decoración: cada interacción (quiz, juego, puntos) refuerza la retención del contenido histórico.
2. **El rigor y la accesibilidad no se oponen.** El contenido es históricamente preciso y está redactado para que lo entienda alguien sin formación previa.
3. **El español primero.** La plataforma está diseñada para hispanohablantes; el idioma, los ejemplos y las referencias culturales son centrales.
4. **La historia es visual.** Las imágenes, galerías y el diseño cálido son parte de la experiencia, no un añadido.
5. **El progreso visible motiva.** Puntos, niveles y perfil personal hacen tangible el avance del usuario.

## Accessibility & Inclusion

No se han establecido requisitos de accesibilidad específicos más allá del diseño responsivo confirmado (móvil, tablet, escritorio). Decisión abierta.
