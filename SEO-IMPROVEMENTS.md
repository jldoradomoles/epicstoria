# 🚀 Guía de Mejoras SEO para Epicstoria

## 📊 Análisis Actual

**Estado:** La aplicación es una SPA (Single Page Application) en Angular, lo que presenta desafíos específicos para SEO.

**Problemas Detectados:**

- ❌ Sin meta tags descriptivos
- ❌ Sin Server-Side Rendering (SSR)
- ❌ Sin sitemap.xml
- ❌ Sin robots.txt
- ❌ Sin Open Graph tags
- ❌ Títulos no dinámicos por página
- ❌ Sin structured data (Schema.org)
- ❌ Sin canonical URLs

---

## 🎯 Mejoras Prioritarias (Orden de Impacto)

### 1. 🔥 CRÍTICO: Implementar Server-Side Rendering (SSR)

**Impacto:** ⭐⭐⭐⭐⭐ (MÁXIMA PRIORIDAD)

Angular es una SPA que renderiza en el navegador. Los bots de Google tienen dificultad para indexar contenido JavaScript.

**Solución: Angular Universal (SSR)**

```bash
# Agregar Angular Universal
ng add @angular/ssr
```

**Beneficios:**

- ✅ Los bots ven el HTML completo inmediatamente
- ✅ Mejora el tiempo de carga inicial
- ✅ Mejor indexación de contenido dinámico
- ✅ Mejora Core Web Vitals

**Archivos a modificar:**

- Crea `server.ts` automáticamente
- Configura el rendering del lado del servidor
- Permite pre-renderizar rutas estáticas

---

### 2. 📝 Meta Tags Dinámicos por Página

**Impacto:** ⭐⭐⭐⭐⭐

Crear un servicio SEO para gestionar meta tags dinámicamente.

**Crear: `src/app/services/seo.service.ts`**

```typescript
import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root',
})
export class SeoService {
  private title = inject(Title);
  private meta = inject(Meta);

  updateTitle(title: string) {
    this.title.setTitle(`${title} | Epicstoria - Historia del Mundo`);
  }

  updateMetaTags(config: {
    title: string;
    description: string;
    keywords?: string;
    image?: string;
    url?: string;
    type?: string;
  }) {
    // Title
    this.updateTitle(config.title);

    // Description
    this.meta.updateTag({
      name: 'description',
      content: config.description,
    });

    // Keywords
    if (config.keywords) {
      this.meta.updateTag({
        name: 'keywords',
        content: config.keywords,
      });
    }

    // Open Graph
    this.meta.updateTag({ property: 'og:title', content: config.title });
    this.meta.updateTag({ property: 'og:description', content: config.description });
    this.meta.updateTag({ property: 'og:type', content: config.type || 'website' });

    if (config.image) {
      this.meta.updateTag({ property: 'og:image', content: config.image });
    }

    if (config.url) {
      this.meta.updateTag({ property: 'og:url', content: config.url });
    }

    // Twitter Card
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: config.title });
    this.meta.updateTag({ name: 'twitter:description', content: config.description });

    if (config.image) {
      this.meta.updateTag({ name: 'twitter:image', content: config.image });
    }
  }

  updateCanonicalUrl(url: string) {
    const head = document.getElementsByTagName('head')[0];
    let element: HTMLLinkElement | null = document.querySelector('link[rel="canonical"]');

    if (!element) {
      element = document.createElement('link');
      element.setAttribute('rel', 'canonical');
      head.appendChild(element);
    }

    element.setAttribute('href', url);
  }
}
```

**Usar en cada componente de página:**

```typescript
// Ejemplo: event-detail.ts
import { Component, OnInit } from '@angular/core';
import { SeoService } from '../../services/seo.service';

export class EventDetail implements OnInit {
  private seo = inject(SeoService);

  ngOnInit() {
    this.seo.updateMetaTags({
      title: this.event.title,
      description: this.event.description,
      keywords: `historia, ${this.event.category}, ${this.event.title}`,
      image: this.event.imageUrl,
      url: `https://epicstoria.com/evento/${this.event.id}`,
      type: 'article',
    });

    this.seo.updateCanonicalUrl(`https://epicstoria.com/evento/${this.event.id}`);
  }
}
```

---

### 3. 📄 Mejorar index.html con Meta Tags Básicos

**Impacto:** ⭐⭐⭐⭐

**Actualizar: `src/index.html`**

```html
<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />

    <!-- Primary Meta Tags -->
    <title>Epicstoria - Descubre la Historia del Mundo de Forma Interactiva</title>
    <meta name="title" content="Epicstoria - Descubre la Historia del Mundo de Forma Interactiva" />
    <meta
      name="description"
      content="Explora eventos históricos fascinantes, resuelve quizzes educativos y aprende historia de manera divertida. Desde el espacio hasta la mitología antigua."
    />
    <meta
      name="keywords"
      content="historia, eventos históricos, educación, quiz historia, cultura, ciencia, arte, mitología, tecnología"
    />
    <meta name="author" content="Epicstoria" />
    <meta name="robots" content="index, follow" />

    <base href="/" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />

    <!-- Theme Color -->
    <meta name="theme-color" content="#d97706" />

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://epicstoria.com/" />
    <meta property="og:title" content="Epicstoria - Descubre la Historia del Mundo" />
    <meta
      property="og:description"
      content="Explora eventos históricos fascinantes y aprende de forma interactiva"
    />
    <meta property="og:image" content="https://epicstoria.com/images/og-image.jpg" />
    <meta property="og:locale" content="es_ES" />
    <meta property="og:site_name" content="Epicstoria" />

    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image" />
    <meta property="twitter:url" content="https://epicstoria.com/" />
    <meta property="twitter:title" content="Epicstoria - Descubre la Historia del Mundo" />
    <meta
      property="twitter:description"
      content="Explora eventos históricos fascinantes y aprende de forma interactiva"
    />
    <meta property="twitter:image" content="https://epicstoria.com/images/twitter-card.jpg" />

    <!-- Canonical URL -->
    <link rel="canonical" href="https://epicstoria.com/" />

    <!-- Favicon -->
    <link rel="icon" type="image/x-icon" href="favicon.ico" />
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />

    <!-- Preconnect to external resources -->
    <link rel="preconnect" href="https://cdnjs.cloudflare.com" />
    <link rel="dns-prefetch" href="https://cdnjs.cloudflare.com" />

    <link
      rel="stylesheet"
      href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
    />

    <!-- JSON-LD Structured Data -->
    <script type="application/ld+json">
      {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "Epicstoria",
        "url": "https://epicstoria.com",
        "description": "Plataforma educativa de historia interactiva",
        "potentialAction": {
          "@type": "SearchAction",
          "target": "https://epicstoria.com/buscar?q={search_term_string}",
          "query-input": "required name=search_term_string"
        }
      }
    </script>
  </head>
  <body>
    <app-root></app-root>
  </body>
</html>
```

---

### 4. 🤖 Crear robots.txt

**Impacto:** ⭐⭐⭐⭐

**Crear: `public/robots.txt`**

```txt
# Epicstoria - robots.txt

User-agent: *
Allow: /
Disallow: /perfil
Disallow: /login
Disallow: /register
Disallow: /chat
Disallow: /api/

# Sitemap
Sitemap: https://epicstoria.com/sitemap.xml

# Crawl delay (opcional, si hay problemas de carga)
# Crawl-delay: 1
```

---

### 5. 🗺️ Generar Sitemap.xml Dinámico

**Impacto:** ⭐⭐⭐⭐

**Opción A: Sitemap Estático (Crear: `public/sitemap.xml`)**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">

  <!-- Página principal -->
  <url>
    <loc>https://epicstoria.com/</loc>
    <lastmod>2026-01-28</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>

  <!-- Páginas estáticas -->
  <url>
    <loc>https://epicstoria.com/eventos</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>

  <url>
    <loc>https://epicstoria.com/buscar</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>

  <url>
    <loc>https://epicstoria.com/juegos</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>

  <url>
    <loc>https://epicstoria.com/galeria</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>

  <url>
    <loc>https://epicstoria.com/acerca</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>

  <!-- Eventos individuales (agregar dinámicamente) -->
  <!-- Ejemplo: -->
  <!--
  <url>
    <loc>https://epicstoria.com/evento/llegada-hombre-luna</loc>
    <lastmod>2026-01-20</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  -->

</urlset>
```

**Opción B: Sitemap Dinámico (Backend)**

```typescript
// backend/src/routes/sitemap.routes.ts
import { Router } from 'express';
import pool from '../config/database';

const router = Router();

router.get('/sitemap.xml', async (req, res) => {
  try {
    // Obtener todos los eventos
    const events = await pool.query('SELECT id, updated_at FROM events ORDER BY updated_at DESC');

    const baseUrl = 'https://epicstoria.com';

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/eventos</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/buscar</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;

    // Agregar eventos dinámicamente
    events.rows.forEach((event) => {
      const lastmod = new Date(event.updated_at).toISOString().split('T')[0];
      xml += `
  <url>
    <loc>${baseUrl}/evento/${event.id}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`;
    });

    xml += '\n</urlset>';

    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (error) {
    console.error('Error generating sitemap:', error);
    res.status(500).send('Error generating sitemap');
  }
});

export default router;
```

---

### 6. 🏷️ Implementar Schema.org Structured Data

**Impacto:** ⭐⭐⭐⭐

Agregar datos estructurados JSON-LD en las páginas de eventos.

**En event-detail.ts:**

```typescript
import { DOCUMENT } from '@angular/common';

export class EventDetail implements OnInit {
  private document = inject(DOCUMENT);

  addStructuredData() {
    const script = this.document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: this.event.title,
      description: this.event.description,
      image: this.event.imageUrl,
      datePublished: this.event.date,
      author: {
        '@type': 'Organization',
        name: 'Epicstoria',
      },
      publisher: {
        '@type': 'Organization',
        name: 'Epicstoria',
        logo: {
          '@type': 'ImageObject',
          url: 'https://epicstoria.com/logo.png',
        },
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': `https://epicstoria.com/evento/${this.event.id}`,
      },
    });

    this.document.head.appendChild(script);
  }
}
```

---

### 7. 🖼️ Optimización de Imágenes

**Impacto:** ⭐⭐⭐⭐

**Implementar:**

1. **Lazy loading de imágenes:**

```html
<img [src]="imageUrl" loading="lazy" alt="Descripción descriptiva del evento" />
```

2. **Usar WebP con fallback:**

```html
<picture>
  <source srcset="image.webp" type="image/webp" />
  <img src="image.jpg" alt="Descripción" />
</picture>
```

3. **Agregar alt tags descriptivos:**

```html
<!-- ❌ Malo -->
<img src="event.jpg" alt="imagen" />

<!-- ✅ Bueno -->
<img src="event.jpg" alt="Neil Armstrong pisando la Luna durante la misión Apollo 11 en 1969" />
```

4. **Dimensiones explícitas:**

```html
<img src="event.jpg" alt="..." width="800" height="600" />
```

---

### 8. 🔗 URLs Amigables y Slugs

**Impacto:** ⭐⭐⭐

Convertir IDs en slugs descriptivos.

**Malo:**

```
https://epicstoria.com/evento/123
```

**Bueno:**

```
https://epicstoria.com/evento/llegada-hombre-luna-1969
```

**Implementación:**

```typescript
// utils/slug.utils.ts
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// En el modelo de evento
interface Event {
  id: string;
  title: string;
  slug: string; // 'llegada-hombre-luna-1969'
  // ...
}
```

---

### 9. ⚡ Mejoras de Performance (Core Web Vitals)

**Impacto:** ⭐⭐⭐⭐⭐

Google prioriza sitios rápidos.

**Implementar:**

1. **Lazy loading de rutas:**

```typescript
// app.routes.ts
export const routes: Routes = [
  {
    path: 'eventos',
    loadComponent: () => import('./pages/eventos/eventos').then((m) => m.Eventos),
  },
  // ...
];
```

2. **Preloading strategy:**

```typescript
// app.config.ts
import { PreloadAllModules } from '@angular/router';

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes, withPreloading(PreloadAllModules))],
};
```

3. **Bundle optimization en angular.json:**

```json
"optimization": {
  "scripts": true,
  "styles": {
    "minify": true,
    "inlineCritical": true
  },
  "fonts": true
},
"budgets": [
  {
    "type": "initial",
    "maximumWarning": "500kb",
    "maximumError": "1mb"
  }
]
```

---

### 10. 📱 Progressive Web App (PWA)

**Impacto:** ⭐⭐⭐

```bash
ng add @angular/pwa
```

Esto agrega:

- Service Worker
- manifest.json
- Íconos para móviles
- Capacidad de instalación

---

## 🎯 Plan de Implementación Recomendado

### Fase 1 - Básico (1-2 días):

1. ✅ Actualizar index.html con meta tags
2. ✅ Crear robots.txt
3. ✅ Crear sitemap.xml estático
4. ✅ Crear SeoService
5. ✅ Agregar alt tags a todas las imágenes

### Fase 2 - Importante (3-5 días):

6. ✅ Implementar Angular Universal (SSR)
7. ✅ Implementar meta tags dinámicos en todas las páginas
8. ✅ Agregar structured data (JSON-LD)
9. ✅ Implementar lazy loading de imágenes
10. ✅ URLs amigables con slugs

### Fase 3 - Avanzado (5-7 días):

11. ✅ Sitemap dinámico desde backend
12. ✅ PWA con service workers
13. ✅ Optimización de performance
14. ✅ Prerendering de rutas principales

---

## 📈 Métricas a Monitorear

1. **Google Search Console**
   - Impresiones
   - Clics
   - CTR
   - Posición promedio

2. **Google PageSpeed Insights**
   - LCP (Largest Contentful Paint) < 2.5s
   - FID (First Input Delay) < 100ms
   - CLS (Cumulative Layout Shift) < 0.1

3. **Google Analytics**
   - Tráfico orgánico
   - Tasa de rebote
   - Tiempo en página

---

## 🔧 Herramientas de Testing

- **Lighthouse** (Chrome DevTools)
- **Google Search Console**
- **Google PageSpeed Insights**
- **Screaming Frog SEO Spider**
- **SEMrush / Ahrefs** (análisis de competidores)

---

## ✅ Checklist Rápido

- [x] Angular Universal (SSR) implementado
- [x] Meta tags en index.html
- [ ] SeoService creado
- [ ] Meta tags dinámicos en todas las páginas
- [x] robots.txt creado
- [x] sitemap.xml creado
- [ ] Alt tags en todas las imágenes
- [ ] Lazy loading de imágenes
- [ ] URLs amigables (slugs)
- [ ] Structured data (JSON-LD)
- [ ] Canonical URLs
- [ ] Open Graph tags
- [ ] Twitter Cards
- [ ] Performance optimizada
- [ ] PWA configurado

---

## 💡 Consejos Adicionales

1. **Contenido único y de calidad**: Escribe descripciones únicas para cada evento
2. **Enlaces internos**: Vincula eventos relacionados entre sí
3. **Actualización regular**: Agrega contenido nuevo frecuentemente
4. **Mobile-first**: Asegura que todo funcione perfectamente en móviles
5. **HTTPS**: Siempre usa HTTPS (ya lo tienes en Hostinger)
6. **Velocidad**: Optimiza todo lo posible (imágenes, código, etc.)

---

**Prioridad #1: Implementar SSR con Angular Universal**
Sin SSR, los bots tendrán dificultad para indexar tu contenido JavaScript.

¿Por dónde quieres empezar?
