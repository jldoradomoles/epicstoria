---
target: src/app/pages/event-detail/event-detail.html
total_score: 19
max_score: 40
na_heuristics: 
p0_count: 1
p1_count: 3
target_identity: "file:C:\\Users\\Usuario\\Documents\\repos\\epicstoria\\src\\app\\pages\\event-detail\\event-detail.html"
target_fingerprint: "sha256:42eeb8cb2d2a1c610403e50b16774a216a246d5066145848dcde8f882de2079d"
target_path: "C:\\Users\\Usuario\\Documents\\repos\\epicstoria\\src\\app\\pages\\event-detail\\event-detail.html"
timestamp: 2026-11-05T11-05-25Z
slug: src-app-pages-event-detail-event-detail-html
closed: true
---
## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 1 | Blank page during data fetch — no skeleton, no spinner, no branded loading |
| 2 | Match System / Real World | 3 | Natural Spanish labels, era-mapped timeline icons, minor date anchoring gap |
| 3 | User Control and Freedom | 1 | No section jump, no forward nav, dead-end bottom nav |
| 4 | Consistency and Standards | 2 | Inconsistent border-title on section headers; quiz missing container-custom wrapper |
| 5 | Error Prevention | 2 | Conditional guards on optional sections; no guard on empty strings; loadAdditionalImages() is a no-op |
| 6 | Recognition Rather Than Recall | 3 | Branded WebP icons + clear labels; alt text collapse reduces image recognition |
| 7 | Flexibility and Efficiency of Use | 1 | No section anchors, no skip-to-quiz, no keyboard shortcuts |
| 8 | Aesthetic and Minimalist Design | 2 | 8+ competing icon accent colors violate amber-only rule; quiz visually orphaned |
| 9 | Error Recovery | 1 | Silent redirect to / on error — no message, no retry |
| 10 | Help and Documentation | 3 | Self-documenting sections; gap at quiz transition — no intro line before app-quiz |
| **Total** | | **19/40** | **Poor** |

## Design Specificity Verdict

**LLM assessment**: Partially authored for Epicstoria, structurally category-interchangeable. The branded WebP section icons (resumen.webp, contexto.webp, etc.) are the single most authoritatively Epicstoria-specific element and correctly anchor each section to the "Archivo Imperial" metaphor. The full-bleed hero with gradient overlay, font-black title, and amber category chip are correct system implementations. However, the getFactIcon() and getTimelineIcon() subsystems inject 8+ competing accent colors (text-blue-500, text-green-500, text-purple-500, text-cyan-500, text-orange-600) that actively dismantle the amber-only interactive voice — the most distinctive design system characteristic. Remove the WebP icons and the page becomes a readable but generic historical-content template. Missed opportunities: no visible gamification entry point before the quiz, no archive-themed completion reward, no "El Archivo te recuerda" moment, no sense of a living collection.

**Deterministic scan**: CLI detector returned exit code 0 — no programmatic rule violations. Source-level observations surface corroborating issues: (1) hardcoded Tailwind palette tokens (bg-gray-800/80, text-blue-500, text-green-500, text-cyan-500) confirm the multi-accent color violation without being detector-catchable; (2) decorative SVG in the back button lacks aria-hidden="true" (parent <a> has visible text, so the risk is low but the pattern is wrong); (3) [src] instead of ngSrc on dynamic images — config.json already suppresses this rule with an accurate note about Angular's runtime resolution. No false positives.

## Overall Impression

A solid structural foundation built correctly on Epicstoria's archive palette and component system — then partially undermined by a rainbow of competing icon colors that break the most distinctive design rule, a blank loading state that reads as broken to a modern audience, and a dead-end bottom nav that abandons users exactly when the gamification promise should deliver. The page starts strong (the hero is exactly right) and degrades. Fix the icon color system and add a completion zone and this page will feel authored.

## What's Working

1. **Branded WebP section icons are correctly and consistently implemented.** resumen.webp, contexto.webp, datos-curiosos.webp, cronologia.webp, consecuencias-legado.webp, quiz-interactivo.webp at h-14 — no other product in the category uses this visual vocabulary. This is the page's strongest Epicstoria-specific signal.
2. **Conditional section rendering guards work correctly.** hasValidKeyFacts() and hasValidTimeline() suppress empty sections cleanly, preventing hollow container-custom cards from rendering on sparse events. This shows maturity in handling data variability.
3. **SEO is production-quality.** JSON-LD structured data with HistoricalArticle schema, canonical URL management, and open-graph tags — unusually thorough for an educational platform at this stage and a genuine competitive advantage.

## Priority Issues

### [P0] Zero loading state — blank page while event data resolves
**Why it matters**: Users on first visit (no cache) or slower connections see a completely empty min-h-screen div for the duration of the fetch call. No feedback. For the 12-18 student audience accustomed to skeleton screens and instant-feel apps, this reads as broken. High bounce risk.  
**Fix**: Add a `loading = signal(true)` toggled in the fetch next/error callbacks. Render an archive-themed skeleton: hero placeholder at the correct aspect ratio with a pulsing leather-dark gradient, followed by 2-3 container-custom skeleton sections with pulsing parchment-text placeholder bars.  
**Suggested command**: `/impeccable harden`

### [P1] La Regla del Oro Único violation — 8+ competing accent colors in fact and timeline icons
**Why it matters**: getFactIcon() returns text-blue-500, text-green-500, text-purple-500, text-cyan-500, text-orange-500, text-gray-500. getTimelineIcon() returns text-amber-800, text-purple-600, text-orange-600, text-blue-600, text-cyan-500, text-green-500, text-blue-400. Datos Curiosos looks like a generic SaaS dashboard, not an imperial archive. The most distinctive characteristic of Epicstoria's design system is destroyed in its own content page.  
**Fix**: Restrict all fact icons to a single warm amber spectrum. Use text-amber-400 as the base icon color. For timeline era encoding, use an amber-to-parchment gradient (text-amber-800 for ancient, text-amber-200 for modern) — this preserves visual differentiation without introducing foreign hues.  
**Suggested command**: `/impeccable colorize`

### [P1] Dead-end bottom navigation — no onward discovery, no completion reward
**Why it matters**: After completing a 5-section read and quiz, users encounter a single "Volver a los Eventos" button. No celebration, no related events, no next adventure. For 12-18 students, the absence of any earned reward after finishing content triggers disengagement. The gamification promise of the product goes unfulfilled at the moment it matters most.  
**Fix**: Replace the bottom nav with a completion zone: (1) a brief archive-voiced acknowledgment ("Has explorado [event.title]"), (2) 2-3 related event cards (same category or era) using the standard event-card component, (3) the existing "Volver" link as a tertiary ghost action below the cards.  
**Suggested command**: `/impeccable onboard`

### [P1] Quiz section is visually orphaned — missing container-custom wrapper
**Why it matters**: Every content section uses container-custom rounded-xl shadow-2xl — the standard archive-glass card. The Quiz section has only a bare div.mb-12 wrapper. It sits as a floating element with no depth treatment, breaking the visual rhythm and making the quiz feel like a third-party embed rather than a native section.  
**Fix**: Wrap the quiz section in `<div class="container-custom rounded-xl p-8 shadow-2xl mb-12">`. Add a brief lead-in line before app-quiz: "Pon a prueba lo que aprendiste sobre este evento."  
**Suggested command**: `/impeccable layout`

### [P2] Inconsistent section header border treatment
**Why it matters**: Resumen, Contexto Histórico, and Consecuencias y Legado have border-title (parchment underline). Datos Curiosos and Cronología do not. No design logic differentiates them — it reads as an implementation gap, not a deliberate hierarchy signal.  
**Fix**: Apply border-title to all section h2 headers consistently, or remove it from all three that have it.  
**Suggested command**: `/impeccable layout`

### [P2] Non-descriptive alt text on all inline content images
**Why it matters**: Every <img> in context paragraphs and facts sections uses [alt]="event.title" — literally the page title repeated for every image. Screen readers announce the same string for every image on the page, providing zero contextual information about image subject matter. Accessibility and SEO defect.  
**Fix**: Until the data model supports per-image alt text, use a contextual fallback: for context images "Imagen del contexto histórico de [event.title]"; for facts images, derive from the fact title.  
**Suggested command**: `/impeccable audit`

### [P2] Silent error redirect with no user-facing message
**Why it matters**: On fetch error, the component calls router.navigate(['/']) with no explanation. Users arriving via shared links to a deleted/non-existent event are silently teleported home. For a 12-18 student who shared a link to a classmate, this damages trust and attribution.  
**Fix**: Show a brief in-page archive-themed message ("No encontramos este evento en el archivo") before redirecting, or route to a styled 404 page.  
**Suggested command**: `/impeccable harden`

### [P3] Dual DOM hero image divs — same image announced twice by screen readers
**Why it matters**: event-image-desktop and event-image-mobile are both in the DOM simultaneously with role="img" and aria-label. Screen readers may announce the hero twice. The mobile div uses a background-image on a div, which is less reliable for accessibility than a semantic <img>.  
**Fix**: Replace with a single div and CSS-only responsive background treatment, or use a single semantic <img> with NgOptimizedImage.  
**Suggested command**: `/impeccable audit`

## Persona Red Flags

**Jordan (Confused First-Timer)**
- Blank page during data load with no feedback — will think the link is broken and leave before content renders
- Quiz appears without any intro or instructions — may not realize the quiz is interactive until accidentally scrolling past it
- Silent redirect on error gives no explanation — has no idea why they ended up on the home page after clicking a shared link
- No confirmation of action success anywhere on the page

**Casey (Distracted Mobile User)**
- Very long page with no section-jump mechanism — will abandon before reaching the quiz, particularly mid-read
- hover:scale on fact cards is hover-only — touch users never receive this feedback on mobile
- No reading time estimate or progress indicator — no way to judge if this is a 2-minute or 10-minute commitment
- Single "Volver" CTA at the bottom means Casey must scroll the entire page to find any further action

**Sam (Accessibility-Dependent User)**
- [alt]="event.title" on every inline image — screen reader announces the page title for each image with zero subject information
- Both mobile and desktop hero divs present in DOM with role="img" — may announce hero image twice
- No skip-to-content link — must tab through the entire header navigation before reaching any content
- Color-only encoding in fact icons (blue = distance, green = time, purple = music) has no text fallback — high-contrast or color-blind modes lose all icon meaning

**Estudiante 12-18 años (Project-Specific)**
- No visible gamification signal anywhere before the quiz — no XP preview, no streak indicator, no "gana 50 puntos" teaser — the product's core engagement hook is invisible on the page that should deliver it
- Rainbow icon colors in Datos Curiosos look like a children's educational toy, not the prestigious "Archivo Imperial" that makes the platform feel serious
- Quiz buried at end of a long scroll with no preamble — a student with notifications pending will not reach it
- No completion reward or "bien hecho" moment — the gamification loop is broken at the exact point it should fire

## Minor Observations

- `.border-cronologia` in the SCSS adds only `border-radius: 0.75rem`, duplicating the `rounded-xl` Tailwind class already applied to the same element in the template — dead code
- `.icon-transparent` class is defined in the SCSS but never used anywhere in the template
- `loadAdditionalImages()` is documented in its own code comment as a no-op — the complex image-interleaving layout logic that depends on it will never activate without backend support
- `hasAdditionalImages()` is defined in the component class but never called in the template
- Commented-out `<h2>Otros Eventos Destacados</h2>` at line 344 reveals incomplete composition intent and signals the bottom nav was meant to be richer

## Questions to Consider

- What is the designed state after a user completes the quiz — does the page know, does it celebrate, and does it suggest a next event? The current implementation has no hook for quiz completion feedback at the page level.
- Is the event-detail page intended to be the gamification entry point (where XP is earned) or a pure reading surface? If XP is awarded for reading time or quiz completion, there needs to be a visible contract with the user before they invest the time.
- Should the Cronología section support collapse/expand for events with long timelines (10+ entries)? A battle spanning a decade could produce a very long unbroken list that breaks reading flow.
- The fact icon color system appears designed to encode semantic meaning (blue = space, green = time). If this encoding is intentional, should it be documented as a legend, or replaced with a purely shape-based differentiator that doesn't require color to convey meaning?
