import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Event } from '../../models/event.model';
import { DateFormatPipe } from '../../pipes/date-format.pipe';
import { getPlainText } from '../../utils/text.utils';

@Component({
  selector: 'app-event-cards',
  imports: [RouterLink, DateFormatPipe],
  templateUrl: './event-cards.html',
  styleUrl: './event-cards.scss',
})
export class EventCards implements OnInit {
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);
  events: Event[] = [];

  readonly defaultImage = 'https://placehold.co/600x400/1F2937/FFFFFF?text=Evento+Hist%C3%B3rico';

  // Hacer la función disponible en el template
  getPlainText = getPlainText;

  ngOnInit() {
    console.log('Loading events from /data/events.json');
    this.http.get<Event[]>('/data/events.json').subscribe({
      next: (data) => {
        console.log('Events loaded successfully:', data);
        this.events = data;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error loading events:', error);
      },
    });
  }

  onImageError(event: any) {
    (event.target as HTMLImageElement).src = this.defaultImage;
  }
}
