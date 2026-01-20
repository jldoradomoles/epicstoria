import { NgClass } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Event } from '../../models/event.model';
import { DateFormatPipe } from '../../pipes/date-format.pipe';
import { EventApiService } from '../../services/event-api.service';
import { getCategoryColor } from '../../utils/category.utils';
import { handleImageError } from '../../utils/image.utils';
import { getPlainText } from '../../utils/text.utils';

@Component({
  selector: 'app-event-cards',
  imports: [RouterLink, DateFormatPipe, NgClass],
  templateUrl: './event-cards.html',
  styleUrl: './event-cards.scss',
})
export class EventCards implements OnInit {
  private eventApiService = inject(EventApiService);
  private cdr = inject(ChangeDetectorRef);
  events: Event[] = [];

  readonly defaultImage = 'https://placehold.co/600x400/1F2937/FFFFFF?text=Evento+Hist%C3%B3rico';

  // Hacer las funciones disponibles en el template
  getCategoryColor = getCategoryColor;
  getPlainText = getPlainText;

  ngOnInit() {
    console.log('Loading events from database');
    this.eventApiService.getAllEvents().subscribe({
      next: async (data) => {
        console.log('Events loaded successfully:', data);
        // Procesar las URLs de imágenes para asegurar formatos correctos
        this.events = await this.processEventImages(data);
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error loading events:', error);
      },
    });
  }

  private async processEventImages(events: Event[]): Promise<Event[]> {
    // Procesar eventos para asegurar que las URLs de imágenes tengan formato correcto
    const processedEvents = events.map((event) => {
      let imageUrl = event.imageUrl;

      // Si no hay imageUrl, usar imagen por defecto
      if (!imageUrl) {
        return { ...event, imageUrl: this.defaultImage };
      }

      // Si la URL ya es absoluta (http/https), dejarla como está
      if (imageUrl.startsWith('http')) {
        return { ...event, imageUrl };
      }

      // Para URLs relativas, asegurar que empiecen con /
      if (!imageUrl.startsWith('/')) {
        imageUrl = `/${imageUrl}`;
      }

      // Si YA tiene una extensión válida, confiar en ella y no verificar
      // Esto evita intentos de carga innecesarios que generan 404s
      const hasValidExtension = imageUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i);

      if (!hasValidExtension) {
        // Solo si NO tiene extensión, agregar .png por defecto (más común)
        imageUrl = `${imageUrl}.png`;
      }

      return { ...event, imageUrl };
    });

    return Promise.resolve(processedEvents);
  }

  async onImageError(event: any) {
    const imgElement = event.target as HTMLImageElement;
    await handleImageError(event, imgElement.src, this.defaultImage);
  }
}
