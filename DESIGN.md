---
name: Epicstoria
description: Plataforma interactiva de historia con gamificación para hispanohablantes
colors:
  ink-dark: "#111827"
  leather: "#1f150c"
  leather-muted: "#1f2937"
  imperial-blue: "#1e40af"
  history-red: "#dc2626"
  warm-parchment: "#e8dcc4"
  cream-ivory: "#fcf8d8"
  cream-hover: "#f0e6b8"
  gold-amber: "#fbbf24"
  bronze-deep: "#78350f"
  parchment-text: "#e1c7b1"
  stone-dark: "#292524"
typography:
  display:
    fontFamily: "'Poppins', sans-serif"
    fontSize: "clamp(2.5rem, 6vw, 4rem)"
    fontWeight: 900
    lineHeight: 1.05
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "'Poppins', sans-serif"
    fontSize: "clamp(1.75rem, 4vw, 3rem)"
    fontWeight: 800
    lineHeight: 1.1
  title:
    fontFamily: "'Poppins', sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.25
  body:
    fontFamily: "'Poppins', sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.75
  label:
    fontFamily: "'Poppins', sans-serif"
    fontSize: "0.75rem"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "0.1em"
rounded:
  pill: "9999px"
  lg: "8px"
  xl: "12px"
spacing:
  sm: "16px"
  md: "32px"
  lg: "48px"
  xl: "80px"
components:
  button-primary:
    backgroundColor: "{colors.cream-ivory}"
    textColor: "{colors.leather}"
    rounded: "{rounded.pill}"
    padding: "12px 32px"
  button-primary-hover:
    backgroundColor: "{colors.cream-hover}"
  button-ghost:
    backgroundColor: "rgba(31,39,55,0.8)"
    textColor: "#ffffff"
    rounded: "{rounded.pill}"
    padding: "8px 16px"
  event-card:
    backgroundColor: "rgba(31,21,12,0.64)"
    rounded: "{rounded.xl}"
  input-default:
    backgroundColor: "rgba(41,37,36,0.5)"
    textColor: "{colors.parchment-text}"
    rounded: "{rounded.lg}"
    padding: "12px 16px"
---

# Design System: Epicstoria

## Overview

**Creative North Star: "El Archivo Imperial"**

Epicstoria's visual world is built on the metaphor of a great imperial archive — a solemn hall lit by amber lanterns, its walls lined with dark stone, its cases holding parchment scrolls sealed in gold. The visitor doesn't feel like they're browsing a website; they feel like they've been granted access to a repository of civilization's most consequential moments. The darkness is not menacing: it's the reverent quiet of a space where important things are kept.

The palette speaks this architecture directly. Deep leather and ink dark form the structural shell: the header, containers, and overlays. Warm parchment and cream ivory surface the content layers, creating the tactile sense of old paper under light. Gold amber burns as the single interactive voice — a flame in the archive — marking every hover state, focus ring, and interactive icon. Imperial blue serves as a structural accent, appearing in category chips and the barely-visible glow that surfaces on card hover.

The character is **adventurous and warm**, not academic or intimidating. History is presented as treasure, not curriculum. The scale transforms that animate buttons and cards — the slight growth on hover — reinforce this: the archive responds to the curious visitor who leans in.

**Key Characteristics:**
- Warm-dark layering: leather containers float over a beige-textured background, never on pure white or black
- Amber as the single interactive voice; no competing accent color
- Full-bleed hero images as the primary storytelling surface at every event entry point
- Scale transforms (not opacity) as the tactile hover response
- Parchment cream for all primary CTAs — never blue, never generic

## Colors

A warm-dark palette anchored in leather and parchment, with gold amber as the sole interactive accent.

### Primary
- **Oro Imperial** (`#fbbf24` / amber-400): The single interactive accent. Used exclusively for navigation hover states, input focus icons, focus rings, and any interactive element that requires a color signal. Its rarity is its authority — appears on ≤15% of any given screen.

### Secondary
- **Azul Imperial** (`#1e40af`): Structural blue, surfaced in category chips (Espacio, Tecnología) and as the ambient hover glow on event cards (`rgba(59,130,246,0.2)`). Never used for text or primary actions.
- **Rojo Historia** (`#dc2626`): Semantic red used for the Historia category chip, error states (`bg-red-900/50`, `border-red-500/50`), and the semantic CSS `--color-secondary` token. Never decorative.

### Neutral
- **Noche Imperial** (`#111827` / gray-900): Header background, deepest surface. The structural ceiling.
- **Cuero Antiguo** (`#1f150c`): Container background base. The dominant dark surface for cards, sections, and modals. Its warmth (brown, not blue-gray) distinguishes Epicstoria from generic dark UIs.
- **Pizarra Oscura** (`#1f2937` / gray-800): Mid-dark card background fallback, image gradients.
- **Piedra Oscura** (`#292524` / stone-800): Input field backgrounds.
- **Pergamino Cálido** (`#e8dcc4`): Page background (also textured with `fondo_home.jpg`). The ground tone everything sits on.
- **Crema Imperial** (`#fcf8d8`): Primary button background. Elevated parchment.
- **Crema Hover** (`#f0e6b8`): Primary button hover state.
- **Texto Pergamino** (`#e1c7b1`): Default text color in dark containers. Cream, not white — softer on the eye.
- **Bronce Profundo** (`#78350f` / amber-900): Input borders, profile header gradient.

### Named Rules
**La Regla del Pergamino.** Primary CTAs use cream-ivory (`#fcf8d8`) with leather text (`#1f150c`). Never blue, never white, never transparent. The parchment button is Epicstoria's signature action surface.

**La Regla del Oro Único.** Amber is the one interactive accent. Do not introduce a second color for hover, focus, or link states. Blue and red are structural/semantic tokens, not available as general-purpose accents.

## Typography

**Display Font:** Poppins, sans-serif
**Decorative Font:** Satisfy, cursive (brand name only — `title-font` class, restricted to auth screens)
**Body Font:** Poppins, sans-serif

**Character:** Poppins carries the full weight range from 400 to 900, allowing a single-family system to span body copy and heroic display type. Its rounded geometric cuts are approachable without being playful, legible at small sizes without being cold. Satisfy appears only once — as the decorative rendering of "Epicstoria" on login/register screens — where its fluid script contrasts the structural Poppins with handcrafted warmth.

### Hierarchy
- **Display** (900 weight, `clamp(2.5rem, 6vw, 4rem)`, lh 1.05, ls -0.02em): Event hero titles on detail pages at large breakpoints. Full-bleed image overlays. Used once per page.
- **Headline** (800 weight, `clamp(1.75rem, 4vw, 3rem)`, lh 1.1): Page titles (About, Galería), section headers on the home page. The editorial anchor of each screen.
- **Title** (700 weight, `1.5rem`, lh 1.25): Card titles, section sub-headers, event names in listing grids.
- **Body** (400 weight, `1.125rem`, lh 1.75): All narrative copy — event summaries, context paragraphs, about-page prose. Max line length ~72ch on desktop.
- **Label** (700 weight, `0.75rem`, lh 1, ls 0.1em, uppercase): Category chips, metadata dates, navigation links. Uppercase with generous tracking.

### Named Rules
**La Regla de Poppins.** One typeface, one family. Inter is loaded but not promoted to body usage. Satisfy is restricted to brand-name display on auth screens. Any surface that needs an expressive headline reaches for Poppins 800–900 before introducing new type.

## Layout

The layout follows a **centered content column with a full-bleed canvas** model. The page background (`#e8dcc4` + `fondo_home.jpg`) stretches to all edges; content lives within a `max-w-7xl` (1280px) container with responsive horizontal padding (`px-4 sm:px-6 lg:px-8`). Event detail pages narrow to `max-w-5xl` (1024px) for readability. Auth flows use `max-w-md` (448px) centered columns.

**Grid:** Event listings use a 1→2→3 column responsive grid (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3`) with `gap-10` (40px). The gallery uses a similar pattern. Spacing is generous: Epicstoria breathes.

**Vertical rhythm:** Sections use `py-20` (80px) or `py-12` (48px) between them. Inside containers: `p-8` (32px) on section panels, `p-6` (24px) on card bodies.

**Responsive breakpoints (Tailwind defaults):**
- sm: 640px — navigation appears; layout widens
- md: 768px — grids shift from 1 to 2 columns
- lg: 1024px — grids shift to 3 columns
- xl: 1280px — max container reached

The header is `sticky top-0 z-10` with `backdrop-blur-sm`, creating a glass anchor at the top. The nav collapses off-screen on mobile.

## Elevation & Depth

Epicstoria uses a **component-specific shadow strategy**. Each component type has its own elevation contract; the system is neither flat nor uniformly lifted.

**Event cards and showcase surfaces** carry `shadow-2xl` at rest and reveal a blue-tinted glow (`shadow-blue-500/20`) on hover — the archive's display cases glowing as you approach. **Buttons** carry `shadow-lg` at rest, promoted to `shadow-xl` on hover alongside scale. **The header** uses `shadow-xl` as a persistent separation, reinforced by `backdrop-blur-sm`.

**Auth forms and content containers** are flatter — `shadow-2xl` on the outer panel, with no interactive shadow on interior elements.

Depth is also achieved tonally through the transparent layering of `container-custom` (`rgba(31,21,12,0.64)`) over the textured parchment background. The semi-transparency makes the system feel like a real material world rather than opaque rectangles.

### Shadow Vocabulary
- **card-resting** (`0 25px 50px -12px rgba(0,0,0,0.25)`): Event cards and section containers at rest.
- **card-hover** (`0 25px 50px -12px rgba(59,130,246,0.2)`): Event card hover. The only colored shadow in the system.
- **header** (`0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)`): Header persistent lift.
- **button-resting** (`0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)`): Button at rest.
- **button-hover** (`0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)`): Elevated button on hover.

### Named Rules
**La Regla de la Sombra Azul.** The only colored shadow is the blue glow on event card hover. This specificity makes it meaningful — it signals "this is a navigable content item." Do not apply it to any other component type.

## Shapes

Epicstoria's form language is defined by two shapes: the **pill** and the **rounded rectangle**.

**Pill (`border-radius: 9999px`):** Every interactive affordance in the action layer — primary buttons, category chips, back buttons, avatar containers. The pill communicates "press me" at a glance. Its consistent use means no other shape should appear in action UI.

**Rounded rectangle (`border-radius: 12px` / `rounded-xl`):** Every content container — event cards, section panels, gallery thumbnails, carousel cards. The 12px radius is soft without being bubbly; it carries the material warmth of the archive's display cases.

**Input (`border-radius: 8px` / `rounded-lg`):** A slightly tighter radius for text fields. The distinction between 8px inputs and 12px containers is subtle but intentional: inputs are tools, containers are spaces.

The glass-morphism header (`bg-gray-900/90 backdrop-blur-sm`) adds a soft-edge quality to the topmost layer, reinforcing the architectural metaphor.

## Components

### Buttons
Tactile and confident. The primary CTA scales and glows on interaction; the ghost variant retreats into background glass without competing.

- **Shape:** Pill (`border-radius: 9999px`)
- **Primary:** Cream ivory (`#fcf8d8`), leather text (`#1f150c`). Padding `12px 32px`. `shadow-lg` at rest.
- **Hover / Focus:** `background-color: #f0e6b8`, scale 1.05, promoted shadow. Focus ring: `outline: 2px solid #fbbf24, outline-offset: 2px`.
- **Active:** Scale 0.95.
- **Ghost / Back:** Dark glass `rgba(31,39,55,0.8)` with `backdrop-blur-sm`, white text. For navigation regression (back buttons, overlaid secondary actions). Hover: `rgba(55,65,81,0.9)`.

### Chips / Category Badges
- **Style:** Pill with per-category background color; white text. `0.75rem`, uppercase, letter-spacing `0.1em`.
- **Category palette:** Ciencia `#16a34a`, Política `#ca8a04`, Espacio `#2563eb`, Tecnología `#4f46e5`, Historia `#dc2626`, Arte `#e11d48`, Cultura `#db2777`, Economía `#ea580c`, Descubrimientos `#0d9488`, Monumentos `#4b5563`.
- **State:** Presentational only in the current system; no hover or selected state.

### Cards / Containers
- **Corner Style:** `12px` (`rounded-xl`)
- **Background:** `rgba(31,21,12,0.64)` — leather brown at 64% opacity, allowing background texture to bleed through.
- **Shadow Strategy:** `shadow-2xl` at rest; blue-tinted glow on hover. See Elevation.
- **Border:** None at rest.
- **Internal Padding:** `p-8` (32px) on section panels; `p-6` (24px) on card bodies.
- **Hover:** Scale `1.02`, shadow shift to card-hover.

### Inputs / Fields
- **Style:** `8px` radius, `bg-stone-800/50` (`rgba(41,37,36,0.5)`), `border: 1px solid rgba(120,53,15,0.3)`. With left-side icon in `rgba(251,191,36,0.6)`.
- **Focus:** `border-color: rgba(245,158,11,0.5)`, `box-shadow: 0 0 0 1px rgba(245,158,11,0.3)`.
- **Error:** Full-width alert row `bg-red-900/50 border-red-500/50 rounded-lg text-red-200`; not an individual field highlight.

### Navigation
- **Style:** Horizontal flex, `gap: 24px`, `font-size: 0.875rem`, `font-weight: 500`. White text at rest.
- **Hover / Active:** `color: #fbbf24`. Color alone carries the state; no underline or background.
- **Mobile:** Nav hidden below `640px`. Mobile navigation not yet fully implemented.

### Category Carousel
Epicstoria's signature browsing component — a horizontally scrollable row of image tiles.

- **Tile:** `192px × 128px`, `rounded-xl`. Full-bleed cover image, no text overlay.
- **Hover:** Scale `1.05`, shadow promoted to `shadow-2xl`.
- **Navigation arrows:** Appear on group hover. Gradient fade-out edges mask overflow.
- **Scroll:** Native horizontal, `scrollbar-width: none`.

### Event Section Icons
On event detail pages, each section (Resumen, Contexto, Hechos Clave, Cronología, Consecuencias) is headed by a branded WebP icon (`images/logos/resumen.webp`, etc.) rendered at `h-14`. These icons are the system's most distinctive typographic ornament — visual identity marks that replace numbered section headers with branded imagery.

## Do's and Don'ts

### Do:
- **Do** use `#fcf8d8` (cream-ivory) as the background for every primary CTA. The parchment button is Epicstoria's signature action surface.
- **Do** use amber (`#fbbf24`) as the sole interactive accent — hover, focus rings, icon tints. Nowhere else.
- **Do** use `rgba(31,21,12,0.64)` with `border-radius: 12px` and `shadow-2xl` as the standard content container treatment.
- **Do** use full-bleed cover images for event entries — the image is the first content, not a thumbnail decoration.
- **Do** animate with scale transforms (`scale(1.02)` for cards, `scale(1.05)` for buttons). Scale communicates depth in the archive metaphor.
- **Do** use Poppins 900 (`font-black`) for display-level titles; the weight contrast is part of the editorial voice.

### Don't:
- **Don't** use pure white (`#ffffff`) as a surface background. Use cream-ivory on light surfaces, leather-dark on dark ones.
- **Don't** introduce new accent colors. Blue and red are secondary/semantic tokens; they are not available as general-purpose accents.
- **Don't** use the Satisfy font (`title-font`) for anything other than the "Epicstoria" brand name on auth screens.
- **Don't** apply the blue hover glow (`shadow-blue-500/20`) to anything other than event cards. Its specificity is its signal strength.
- **Don't** mix the pill shape (action layer) with `rounded-xl` (container layer). Buttons and chips are pills; panels and cards are rounded rectangles.
- **Don't** reduce container opacity below 60%. The leather-texture bleed is part of the depth strategy, but content readability requires sufficient contrast.
