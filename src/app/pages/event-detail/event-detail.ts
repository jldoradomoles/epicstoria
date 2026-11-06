import { DOCUMENT, NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { QuizComponent } from '../../components/quiz/quiz';
import { Event } from '../../models/event.model';
import { DateFormatPipe } from '../../pipes/date-format.pipe';
import { EventApiService } from '../../services/event-api.service';
import { SeoService } from '../../services/seo.service';
import { getCategoryColor as getCategoryColorUtil } from '../../utils/category.utils';
import { handleImageError } from '../../utils/image.utils';
import { getParagraphs } from '../../utils/text.utils';

@Component({
  selector: 'app-event-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, DateFormatPipe, QuizComponent, NgOptimizedImage],
  templateUrl: './event-detail.html',
  styleUrl: './event-detail.scss',
})
export class EventDetail implements OnInit {
  private eventApiService = inject(EventApiService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private seo = inject(SeoService);
  private document = inject(DOCUMENT);

  event: Event | undefined;
  readonly loading = signal(true);
  readonly loadError = signal(false);
  readonly relatedEvents = signal<Event[]>([]);
  getCategoryColor = getCategoryColorUtil;
  getParagraphs = getParagraphs;

  readonly defaultImage = 'https://placehold.co/1200x600/1F2937/FFFFFF?text=Evento+Hist%C3%B3rico';

  ngOnInit() {
    const eventId = this.route.snapshot.paramMap.get('id');

    if (!eventId) {
      this.router.navigate(['/eventos']);
      return;
    }

    this.eventApiService.getEventById(eventId).subscribe({
      next: (event) => {
        if (!event) {
          this.loading.set(false);
          this.loadError.set(true);
          setTimeout(() => this.router.navigate(['/eventos']), 2500);
          return;
        }
        this.event = this.loadAdditionalImages(event);
        this.loading.set(false);
        this.updateSeoTags(event);
        this.addStructuredData(event);
        this.cdr.markForCheck();

        this.eventApiService.getEventsByCategory(event.category).subscribe({
          next: (events) => {
            this.relatedEvents.set(events.filter((e) => e.id !== event.id).slice(0, 3));
          },
          error: () => {},
        });
      },
      error: (error) => {
        console.error('Error loading event:', error);
        this.loading.set(false);
        this.loadError.set(true);
        setTimeout(() => this.router.navigate(['/eventos']), 2500);
      },
    });
  }

  private updateSeoTags(event: Event) {
    // Descripción del evento (primeros 160 caracteres del resumen)
    const description = Array.isArray(event.summary)
      ? event.summary[0].substring(0, 160)
      : event.summary.substring(0, 160);

    // Imagen del evento
    const imageUrl = event.imageUrl.startsWith('http')
      ? event.imageUrl
      : `https://epicstoria.es${event.imageUrl}`;

    // Actualizar meta tags
    this.seo.updateMetaTags({
      title: event.title,
      description: `${description}...`,
      keywords: `historia, ${event.category}, ${event.title}, ${event.date}`,
      image: imageUrl,
      url: `https://epicstoria.es/evento/${event.slug || event.id}`,
      type: 'article',
    });

    this.seo.updateCanonicalUrl(`https://epicstoria.es/evento/${event.slug || event.id}`);
  }

  private addStructuredData(event: Event) {
    // Descripción completa del evento
    const description = Array.isArray(event.summary) ? event.summary.join(' ') : event.summary;

    // Imagen del evento
    const imageUrl = event.imageUrl.startsWith('http')
      ? event.imageUrl
      : `https://epicstoria.es${event.imageUrl}`;

    // Eliminar script anterior si existe
    const existingScript = this.document.querySelector(
      'script[type="application/ld+json"][data-event-schema]',
    );
    if (existingScript) {
      existingScript.remove();
    }

    // Crear el script con los datos estructurados
    const script = this.document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-event-schema', 'true');
    script.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: event.title,
      description: description.substring(0, 300),
      image: imageUrl,
      datePublished: event.date,
      dateModified: event.date,
      author: {
        '@type': 'Organization',
        name: 'Epicstoria',
        url: 'https://epicstoria.es',
      },
      publisher: {
        '@type': 'Organization',
        name: 'Epicstoria',
        url: 'https://epicstoria.es',
        logo: {
          '@type': 'ImageObject',
          url: 'https://epicstoria.es/images/logo_transparent.png',
        },
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': `https://epicstoria.es/evento/${event.slug || event.id}`,
      },
      articleSection: event.category,
      keywords: `historia, ${event.category}, ${event.title}`,
      inLanguage: 'es-ES',
    });

    this.document.head.appendChild(script);
  }

  /**
   * Detecta y carga imágenes adicionales basadas en el patrón nombre-1, nombre-2, etc.
   * Solo se cargan si existen imágenes con el sufijo numérico
   */
  private loadAdditionalImages(event: Event): Event {
    if (!event.imageUrl) {
      return event;
    }

    // Si ya tiene additionalImages definidas, usarlas
    if (event.additionalImages && event.additionalImages.length > 0) {
      return event;
    }

    // Extraer el nombre base de la imagen
    const imageUrlWithoutLeadingSlash = event.imageUrl.replace(/^\//, '');
    const pathMatch = imageUrlWithoutLeadingSlash.match(/^(.+\/)?(.+?)(\.[^.]+)$/);

    if (!pathMatch) {
      return event;
    }

    const directory = pathMatch[1] || '';
    const baseName = pathMatch[2];
    const extension = pathMatch[3];

    // Detectar imágenes adicionales que existen físicamente
    // Este array se llenará con las URLs de las imágenes que existen
    const additionalImages: string[] = [];

    // Para detectar imágenes, usamos un enfoque: intentamos cargar hasta 10 imágenes
    // Si el evento ya tiene las imágenes cargadas desde la BD, no intentamos detectarlas
    // Por ahora, retornamos el evento sin modificar ya que la detección real
    // se hará desde el backend o se configurará manualmente

    return event;
  }

  async onImageError(event: any) {
    const imgElement = event.target as HTMLImageElement;
    await handleImageError(event, imgElement.src, this.defaultImage);
  }

  /**
   * Obtiene una imagen adicional por índice si existe
   */
  getAdditionalImage(index: number): string | null {
    if (!this.event?.additionalImages || index >= this.event.additionalImages.length) {
      return null;
    }
    return this.event.additionalImages[index];
  }

  /**
   * Verifica si hay imágenes adicionales disponibles
   */
  hasAdditionalImages(): boolean {
    return !!this.event?.additionalImages && this.event.additionalImages.length > 0;
  }

  /**
   * Verifica si hay datos curiosos válidos para mostrar
   */
  hasValidKeyFacts(): boolean {
    return !!(
      this.event?.keyFacts &&
      this.event.keyFacts.length > 0 &&
      this.event.keyFacts.some((f) => f.title && f.description)
    );
  }

  /**
   * Verifica si hay una cronología válida para mostrar
   */
  hasValidTimeline(): boolean {
    return !!(
      this.event?.timeline &&
      this.event.timeline.length > 0 &&
      this.event.timeline.some((t) => t.date && t.event)
    );
  }

  /**
   * Obtiene el icono apropiado para un dato curioso basado en su título y descripción
   */
  getFactIcon(title: string, description: string): { icon: string; color: string } {
    const text = (title + ' ' + description).toLowerCase();

    if (
      text.includes('distancia') ||
      text.includes('kilómetros') ||
      text.includes('alejado') ||
      text.includes('espacio') ||
      text.includes('años luz')
    ) {
      return { icon: 'fas fa-rocket', color: 'text-amber-300' };
    }
    if (
      text.includes('tiempo') ||
      text.includes('años') ||
      text.includes('horas') ||
      text.includes('días') ||
      text.includes('duración')
    ) {
      return { icon: 'fas fa-clock', color: 'text-amber-400' };
    }
    if (
      text.includes('música') ||
      text.includes('sonidos') ||
      text.includes('disco') ||
      text.includes('audio')
    ) {
      return { icon: 'fas fa-music', color: 'text-amber-300' };
    }
    if (
      text.includes('mensaje') ||
      text.includes('idiomas') ||
      text.includes('comunicación') ||
      text.includes('saludos')
    ) {
      return { icon: 'fas fa-comment', color: 'text-amber-300' };
    }
    if (
      text.includes('primera') ||
      text.includes('primer') ||
      text.includes('único') ||
      text.includes('primero')
    ) {
      return { icon: 'fas fa-trophy', color: 'text-amber-400' };
    }
    if (
      text.includes('tierra') ||
      text.includes('planeta') ||
      text.includes('mundo') ||
      text.includes('global')
    ) {
      return { icon: 'fas fa-globe', color: 'text-amber-500' };
    }
    if (
      text.includes('tecnología') ||
      text.includes('instrumento') ||
      text.includes('equipo') ||
      text.includes('dispositivo')
    ) {
      return { icon: 'fas fa-cog', color: 'text-amber-500' };
    }
    if (
      text.includes('descubrimiento') ||
      text.includes('hallazgo') ||
      text.includes('encontró') ||
      text.includes('reveló')
    ) {
      return { icon: 'fas fa-search', color: 'text-amber-400' };
    }
    if (
      text.includes('científico') ||
      text.includes('investigación') ||
      text.includes('estudio') ||
      text.includes('ciencia')
    ) {
      return { icon: 'fas fa-flask', color: 'text-amber-400' };
    }
    if (
      text.includes('récord') ||
      text.includes('máximo') ||
      text.includes('mayor') ||
      text.includes('extremo')
    ) {
      return { icon: 'fas fa-medal', color: 'text-amber-400' };
    }

    return { icon: 'fas fa-star', color: 'text-amber-400' };
  }

  /**
   * Obtiene el icono apropiado para un elemento de cronología basado en la fecha y período histórico
   */
  getTimelineIcon(dateString: string): { icon: string; color: string } {
    const year = parseInt(dateString.split('-')[0]);

    // Prehistoria y Antigüedad (antes del año 500) — oro más profundo, patinado
    if (year < 500) {
      return { icon: 'fas fa-mountain', color: 'text-amber-600' };
    }
    // Edad Media (500-1450)
    else if (year >= 500 && year < 1450) {
      return { icon: 'fas fa-chess-rook', color: 'text-amber-500' };
    }
    // Renacimiento y Edad Moderna (1450-1800)
    else if (year >= 1450 && year < 1800) {
      return { icon: 'fas fa-feather', color: 'text-amber-400' };
    }
    // Revolución Industrial (1800-1900)
    else if (year >= 1800 && year < 1900) {
      return { icon: 'fas fa-industry', color: 'text-amber-400' };
    }
    // Siglo XX temprano (1900-1950)
    else if (year >= 1900 && year < 1950) {
      return { icon: 'fas fa-car', color: 'text-amber-300' };
    }
    // Era Espacial/Nuclear (1950-1990)
    else if (year >= 1950 && year < 1990) {
      return { icon: 'fas fa-rocket', color: 'text-amber-300' };
    }
    // Era Digital (1990-2010)
    else if (year >= 1990 && year < 2010) {
      return { icon: 'fas fa-desktop', color: 'text-amber-200' };
    }
    // Era Moderna/Internet (2010+) — oro más claro, contemporáneo
    else {
      return { icon: 'fas fa-wifi', color: 'text-amber-200' };
    }
  }
}
