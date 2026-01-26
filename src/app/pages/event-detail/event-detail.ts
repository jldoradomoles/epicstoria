import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { QuizComponent } from '../../components/quiz/quiz';
import { Event } from '../../models/event.model';
import { DateFormatPipe } from '../../pipes/date-format.pipe';
import { EventApiService } from '../../services/event-api.service';
import { getCategoryColor as getCategoryColorUtil } from '../../utils/category.utils';
import { handleImageError } from '../../utils/image.utils';
import { getParagraphs } from '../../utils/text.utils';

@Component({
  selector: 'app-event-detail',
  imports: [RouterLink, DateFormatPipe, QuizComponent],
  templateUrl: './event-detail.html',
  styleUrl: './event-detail.scss',
})
export class EventDetail implements OnInit {
  private eventApiService = inject(EventApiService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  event: Event | undefined;
  getCategoryColor = getCategoryColorUtil;
  getParagraphs = getParagraphs;

  readonly defaultImage = 'https://placehold.co/1200x600/1F2937/FFFFFF?text=Evento+Hist%C3%B3rico';

  ngOnInit() {
    const eventId = this.route.snapshot.paramMap.get('id');

    if (eventId) {
      console.log('Loading event from database:', eventId);
      this.eventApiService.getEventById(eventId).subscribe({
        next: (event) => {
          if (!event) {
            console.error('Event not found:', eventId);
            this.router.navigate(['/']);
            return;
          }
          console.log('Event loaded successfully:', event);
          this.event = this.loadAdditionalImages(event);
          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error('Error loading event:', error);
          // Si el evento no existe, redirigir a la página principal
          this.router.navigate(['/']);
        },
      });
    } else {
      // Si no hay eventId, redirigir a la home
      this.router.navigate(['/']);
    }
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
   * Obtiene el icono apropiado para un dato curioso basado en su título y descripción
   */
  getFactIcon(title: string, description: string): { icon: string; color: string } {
    const text = (title + ' ' + description).toLowerCase();

    // Palabras clave y sus iconos correspondientes
    if (
      text.includes('distancia') ||
      text.includes('kilómetros') ||
      text.includes('alejado') ||
      text.includes('espacio') ||
      text.includes('años luz')
    ) {
      return { icon: 'fas fa-rocket', color: 'text-blue-500' };
    }
    if (
      text.includes('tiempo') ||
      text.includes('años') ||
      text.includes('horas') ||
      text.includes('días') ||
      text.includes('duración')
    ) {
      return { icon: 'fas fa-clock', color: 'text-green-500' };
    }
    if (
      text.includes('música') ||
      text.includes('sonidos') ||
      text.includes('disco') ||
      text.includes('audio')
    ) {
      return { icon: 'fas fa-music', color: 'text-purple-500' };
    }
    if (
      text.includes('mensaje') ||
      text.includes('idiomas') ||
      text.includes('comunicación') ||
      text.includes('saludos')
    ) {
      return { icon: 'fas fa-comment', color: 'text-blue-400' };
    }
    if (
      text.includes('primera') ||
      text.includes('primer') ||
      text.includes('único') ||
      text.includes('primero')
    ) {
      return { icon: 'fas fa-trophy', color: 'text-yellow-500' };
    }
    if (
      text.includes('tierra') ||
      text.includes('planeta') ||
      text.includes('mundo') ||
      text.includes('global')
    ) {
      return { icon: 'fas fa-globe', color: 'text-green-400' };
    }
    if (
      text.includes('tecnología') ||
      text.includes('instrumento') ||
      text.includes('equipo') ||
      text.includes('dispositivo')
    ) {
      return { icon: 'fas fa-cog', color: 'text-gray-500' };
    }
    if (
      text.includes('descubrimiento') ||
      text.includes('hallazgo') ||
      text.includes('encontró') ||
      text.includes('reveló')
    ) {
      return { icon: 'fas fa-search', color: 'text-orange-500' };
    }
    if (
      text.includes('científico') ||
      text.includes('investigación') ||
      text.includes('estudio') ||
      text.includes('ciencia')
    ) {
      return { icon: 'fas fa-flask', color: 'text-cyan-500' };
    }
    if (
      text.includes('récord') ||
      text.includes('máximo') ||
      text.includes('mayor') ||
      text.includes('extremo')
    ) {
      return { icon: 'fas fa-medal', color: 'text-amber-500' };
    }

    // Icono por defecto
    return { icon: 'fas fa-star', color: 'text-yellow-500' };
  }

  /**
   * Obtiene el icono apropiado para un elemento de cronología basado en la fecha y período histórico
   */
  getTimelineIcon(dateString: string): { icon: string; color: string } {
    const year = parseInt(dateString.split('-')[0]);

    // Prehistoria y Antigüedad (antes del año 500)
    if (year < 500) {
      return { icon: 'fas fa-mountain', color: 'text-amber-800' };
    }
    // Edad Media (500-1450)
    else if (year >= 500 && year < 1450) {
      return { icon: 'fas fa-chess-rook', color: 'text-gray-600' };
    }
    // Renacimiento y Edad Moderna (1450-1800)
    else if (year >= 1450 && year < 1800) {
      return { icon: 'fas fa-feather', color: 'text-purple-600' };
    }
    // Revolución Industrial (1800-1900)
    else if (year >= 1800 && year < 1900) {
      return { icon: 'fas fa-industry', color: 'text-orange-600' };
    }
    // Siglo XX temprano (1900-1950)
    else if (year >= 1900 && year < 1950) {
      return { icon: 'fas fa-car', color: 'text-blue-600' };
    }
    // Era Espacial/Nuclear (1950-1990)
    else if (year >= 1950 && year < 1990) {
      return { icon: 'fas fa-rocket', color: 'text-cyan-500' };
    }
    // Era Digital (1990-2010)
    else if (year >= 1990 && year < 2010) {
      return { icon: 'fas fa-desktop', color: 'text-green-500' };
    }
    // Era Moderna/Internet (2010+)
    else {
      return { icon: 'fas fa-wifi', color: 'text-blue-400' };
    }
  }
}
