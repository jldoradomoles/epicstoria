import { inject, Injectable } from '@angular/core';
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
    this.meta.updateTag({
      property: 'og:description',
      content: config.description,
    });
    this.meta.updateTag({
      property: 'og:type',
      content: config.type || 'website',
    });

    if (config.image) {
      this.meta.updateTag({ property: 'og:image', content: config.image });
    }

    if (config.url) {
      this.meta.updateTag({ property: 'og:url', content: config.url });
    }

    // Twitter Card
    this.meta.updateTag({
      name: 'twitter:card',
      content: 'summary_large_image',
    });
    this.meta.updateTag({ name: 'twitter:title', content: config.title });
    this.meta.updateTag({
      name: 'twitter:description',
      content: config.description,
    });

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

  removeCanonicalUrl() {
    const element: HTMLLinkElement | null = document.querySelector('link[rel="canonical"]');
    if (element) {
      element.remove();
    }
  }
}
