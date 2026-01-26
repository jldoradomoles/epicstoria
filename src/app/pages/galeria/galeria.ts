import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Hero } from '../../components/hero/hero';
import { EventApiService } from '../../services/event-api.service';

interface GalleryImage {
  url: string;
  name: string;
  title: string;
  eventId: string | null;
}

@Component({
  selector: 'app-galeria',
  standalone: true,
  imports: [CommonModule, RouterModule, Hero],
  templateUrl: './galeria.html',
  styleUrl: './galeria.scss',
})
export class Galeria implements OnInit {
  private eventApiService = inject(EventApiService);

  images = signal<GalleryImage[]>([]);
  selectedImage = signal<GalleryImage | null>(null);
  isLoading = signal<boolean>(true);

  // Lista de imágenes de eventos históricos
  private imageFiles = [
    'Abbas-Ibn-Firnas.jpg',
    'Abbas-Ibn-Firnas-2.jpg',
    'Anticitera.jpg',
    'Anticitera-2.jpg',
    'Anticitera-3.jpg',
    'Cuauhtemoc.jpg',
    'El-Cristo-del-abismo.jpg',
    'El-Cristo-del-abismo-2.jpg',
    'El-Cristo-del-abismo-3.jpg',
    'El-descubrimiento-de-America.jpg',
    'Federico-Garcia-Lorca.jpg',
    'Federico-García-Lorca-2.jpg',
    'Federico-García-Lorca-3.jpg',
    'Georges-Jacques-Danton.jpg',
    'Georges-Jacques-Danton-2.jpg',
    'Isabel-de-Baviera.jpg',
    'Isabel-de-Baviera-2.jpg',
    'Isabel-de-Baviera-3.jpg',
    'Jane-Goodall.jpg',
    'Jane-Goodall-2.jpg',
    'Jane-Goodall-3.jpg',
    'Jean-Paul-Marat.jpg',
    'Jean-Paul-Marat-2.jpg',
    'Jean-Paul-Marat-3.jpg',
    'La-Estatua-de-la-Libertad.jpg',
    'La-Estatua-de-la-Libertad-2.jpg',
    'La-opera-de-Viena.jpg',
    'La-opera-de-Viena-2.jpg',
    'La-opera-de-Viena-3.jpg',
    'La-opera-de-Viena-4.jpg',
    'Lozen.jpg',
    'Lozen-2.jpg',
    'Lozen-3.jpg',
    'Lozen-4.jpg',
    'Orfeo-y-Euridice.jpg',
    'Pompeya.jpg',
    'Roma-juicios-por-traición.jpg',
    'Voyager-1.jpg',
  ];

  ngOnInit(): void {
    this.loadImages();
  }

  loadImages() {
    // Cargar todos los eventos para hacer el matching
    this.eventApiService.getAllEvents().subscribe({
      next: (events) => {
        const galleryImages: GalleryImage[] = this.imageFiles.map((filename) => {
          const imageBaseName = filename
            .replace(/\.[^/.]+$/, '') // Quitar extensión
            .replace(/-\d+$/, ''); // Quitar guión y número al final

          // Buscar el evento que coincida con el nombre de la imagen
          const matchingEvent = events.find((event) => {
            if (!event.imageUrl) return false;

            // Extraer el nombre del archivo de la imageUrl del evento
            const eventImageName = event.imageUrl
              .split('/')
              .pop() // Obtener el nombre del archivo
              ?.replace(/\.[^/.]+$/, '') // Quitar extensión
              ?.replace(/-\d+$/, ''); // Quitar guión y número al final

            // Comparar nombres base
            return eventImageName === imageBaseName;
          });

          return {
            url: `images/eventos/${filename}`,
            name: filename,
            title: this.formatTitle(filename),
            eventId: matchingEvent ? matchingEvent.id : null,
          };
        });

        this.images.set(galleryImages);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading events:', error);
        // Si falla la carga de eventos, mostrar imágenes sin enlaces
        const galleryImages: GalleryImage[] = this.imageFiles.map((filename) => ({
          url: `images/eventos/${filename}`,
          name: filename,
          title: this.formatTitle(filename),
          eventId: null,
        }));
        this.images.set(galleryImages);
        this.isLoading.set(false);
      },
    });
  }

  formatTitle(filename: string): string {
    // Convertir nombre de archivo a título legible
    return filename
      .replace(/\.[^/.]+$/, '') // Quitar extensión
      .replace(/-\d+$/, '') // Quitar guión y número al final (ej: -2, -3, -4)
      .replace(/-/g, ' ') // Reemplazar guiones con espacios
      .replace(/\b\w/g, (l) => l.toUpperCase()); // Capitalizar primera letra de cada palabra
  }

  getEventLink(image: GalleryImage): string | null {
    // Usar el eventId obtenido de la base de datos
    if (!image.eventId) {
      return null;
    }
    return `/evento/${image.eventId}`;
  }

  openImage(image: GalleryImage) {
    this.selectedImage.set(image);
  }

  closeImage() {
    this.selectedImage.set(null);
  }

  previousImage() {
    const current = this.selectedImage();
    if (!current) return;

    const currentIndex = this.images().findIndex((img) => img.url === current.url);
    if (currentIndex > 0) {
      this.selectedImage.set(this.images()[currentIndex - 1]);
    }
  }

  nextImage() {
    const current = this.selectedImage();
    if (!current) return;

    const currentIndex = this.images().findIndex((img) => img.url === current.url);
    if (currentIndex < this.images().length - 1) {
      this.selectedImage.set(this.images()[currentIndex + 1]);
    }
  }
}
