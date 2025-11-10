import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Event } from '../../models/event.model';
import { DateFormatPipe } from '../../pipes/date-format.pipe';
import { getCategoryColor as getCategoryColorUtil } from '../../utils/category.utils';
import { getParagraphs } from '../../utils/text.utils';

@Component({
  selector: 'app-event-detail',
  imports: [RouterLink, DateFormatPipe],
  templateUrl: './event-detail.html',
  styleUrl: './event-detail.scss',
})
export class EventDetail implements OnInit {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);

  event: Event | undefined;
  getCategoryColor = getCategoryColorUtil;
  getParagraphs = getParagraphs;

  readonly defaultImage = 'https://placehold.co/1200x600/1F2937/FFFFFF?text=Evento+Hist%C3%B3rico';

  ngOnInit() {
    const eventId = this.route.snapshot.paramMap.get('id');

    this.http.get<Event[]>('/data/events.json').subscribe({
      next: (events) => {
        this.event = events.find((e) => e.id === eventId);
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error loading event:', error);
      },
    });
  }

  onImageError(event: any) {
    (event.target as HTMLImageElement).src = this.defaultImage;
  }
}
