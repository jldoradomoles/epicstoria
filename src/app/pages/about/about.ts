import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../services/seo.service';

@Component({
  selector: 'app-about',
  imports: [RouterLink],
  templateUrl: './about.html',
  styleUrl: './about.scss',
})
export class About implements OnInit {
  private seo = inject(SeoService);

  ngOnInit() {
    this.seo.updateMetaTags({
      title: 'Acerca de Epicstoria',
      description:
        'Conoce más sobre Epicstoria, la plataforma educativa que hace que aprender historia sea divertido e interactivo. Descubre nuestra misión y equipo.',
      keywords: 'acerca de, sobre nosotros, epicstoria, historia educativa, plataforma educativa',
      url: 'https://epicstoria.es/acerca',
      type: 'website',
    });

    this.seo.updateCanonicalUrl('https://epicstoria.es/acerca');
  }
}
