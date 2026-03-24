import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { EventApiService } from '../../services/event-api.service';
import { SeoService } from '../../services/seo.service';

interface EventGallery {
  id: string;
  title: string;
  date: string;
  category: string;
  imageUrl: string;
  additionalImages: string[];
  allImages: string[];
}

@Component({
  selector: 'app-galeria-evento',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './galeria-evento.html',
  styleUrl: './galeria-evento.scss',
})
export class GaleriaEvento implements OnInit {
  private eventApiService = inject(EventApiService);
  private seo = inject(SeoService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  event = signal<EventGallery | null>(null);
  selectedImage = signal<string | null>(null);
  selectedImageIndex = signal<number>(0);
  isLoading = signal<boolean>(true);
  isModalOpen = signal<boolean>(false);

  ngOnInit(): void {
    const eventId = this.route.snapshot.paramMap.get('id');
    if (eventId) {
      this.loadEventGallery(eventId);
    }
  }

  loadEventGallery(eventId: string) {
    this.eventApiService.getEventById(eventId).subscribe({
      next: (event) => {
        const allImages = [event.imageUrl, ...(event.additionalImages || [])];

        const eventGallery: EventGallery = {
          id: event.id,
          title: event.title,
          date: event.date,
          category: event.category,
          imageUrl: event.imageUrl,
          additionalImages: event.additionalImages || [],
          allImages,
        };

        this.event.set(eventGallery);
        this.isLoading.set(false);

        // Update SEO
        this.seo.updateMetaTags({
          title: `Galería: ${event.title}`,
          description: `Explora las imágenes del evento histórico: ${event.title}`,
          keywords: `${event.title}, galería, imágenes históricas, ${event.category}`,
          url: `https://epicstoria.es/galeria/evento/${event.id}`,
          type: 'article',
        });

        this.seo.updateCanonicalUrl(`https://epicstoria.es/galeria/evento/${event.id}`);
      },
      error: (error) => {
        console.error('Error loading event:', error);
        this.isLoading.set(false);
        this.router.navigate(['/galeria']);
      },
    });
  }

  openImage(imageUrl: string, index: number) {
    this.selectedImage.set(imageUrl);
    this.selectedImageIndex.set(index);
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
    this.selectedImage.set(null);
  }

  previousImage() {
    const event = this.event();
    if (!event) return;

    const currentIndex = this.selectedImageIndex();
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      this.selectedImageIndex.set(newIndex);
      this.selectedImage.set(event.allImages[newIndex]);
    }
  }

  nextImage() {
    const event = this.event();
    if (!event) return;

    const currentIndex = this.selectedImageIndex();
    if (currentIndex < event.allImages.length - 1) {
      const newIndex = currentIndex + 1;
      this.selectedImageIndex.set(newIndex);
      this.selectedImage.set(event.allImages[newIndex]);
    }
  }

  canGoPrevious(): boolean {
    return this.selectedImageIndex() > 0;
  }

  canGoNext(): boolean {
    const event = this.event();
    return event ? this.selectedImageIndex() < event.allImages.length - 1 : false;
  }

  goToEventDetail() {
    const event = this.event();
    if (event) {
      this.router.navigate(['/evento', event.id]);
    }
  }

  goBack() {
    this.router.navigate(['/galeria']);
  }
}
