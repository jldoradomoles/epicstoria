import { Component, inject, OnInit } from '@angular/core';
import { EventCards } from '../../components/event-cards/event-cards';
import { Hero } from '../../components/hero/hero';
import { SeoService } from '../../services/seo.service';

@Component({
  selector: 'app-eventos',
  imports: [EventCards, Hero],
  templateUrl: './eventos.html',
  styleUrl: './eventos.scss',
})
export class Eventos implements OnInit {
  private seo = inject(SeoService);

  ngOnInit() {
    this.seo.updateMetaTags({
      title: 'Eventos Históricos',
      description:
        'Descubre y explora una colección completa de eventos históricos fascinantes. Desde batallas épicas hasta descubrimientos científicos revolucionarios.',
      keywords:
        'eventos históricos, historia mundial, cronología histórica, hechos históricos, cultura, ciencia, guerras, descubrimientos',
      url: 'https://epicstoria.es/eventos',
      type: 'website',
    });

    this.seo.updateCanonicalUrl('https://epicstoria.es/eventos');
  }
}
