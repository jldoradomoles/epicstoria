import { NgOptimizedImage } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { Hero } from '../../../components/hero/hero';
import { SeoService } from '../../../services/seo.service';
import { COLORING_IMAGES } from './imprime-y-colorea-images';

@Component({
  selector: 'app-imprime-y-colorea',
  imports: [RouterLink, Hero, NgOptimizedImage],
  templateUrl: './imprime-y-colorea.html',
  styleUrl: './imprime-y-colorea.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(window:keydown.arrowleft)': 'previous()',
    '(window:keydown.arrowright)': 'next()',
  },
})
export class ImprimeYColorea implements OnInit {
  private seo = inject(SeoService);

  readonly images = COLORING_IMAGES;
  readonly currentIndex = signal(0);
  readonly current = computed(() => this.images[this.currentIndex()]);

  ngOnInit(): void {
    this.seo.updateMetaTags({
      title: 'Imprime y Colorea - Láminas de Historia para Colorear',
      description:
        'Descarga e imprime ilustraciones de faraones, gladiadores, vikingos, samuráis y otros protagonistas de la historia para colorear.',
      keywords: 'colorear historia, láminas para colorear, dibujos históricos, imprimir y colorear',
      url: 'https://epicstoria.es/juegos/imprime-y-colorea',
      type: 'website',
    });
  }

  previous(): void {
    this.currentIndex.update((i) => (i - 1 + this.images.length) % this.images.length);
  }

  next(): void {
    this.currentIndex.update((i) => (i + 1) % this.images.length);
  }

  select(index: number): void {
    this.currentIndex.set(index);
  }

  print(): void {
    const { file, title } = this.current();
    const win = window.open('', '_blank');
    if (!win) return;
    const doc = win.document;
    doc.title = title;
    const style = doc.createElement('style');
    style.textContent =
      '@page{margin:1cm}body{margin:0;display:flex;justify-content:center;align-items:center;height:100vh}img{max-width:100%;max-height:100vh;object-fit:contain}';
    doc.head.appendChild(style);
    const img = doc.createElement('img');
    img.onload = () => {
      win.focus();
      win.print();
      win.close();
    };
    img.src = new URL(file, document.baseURI).href;
    doc.body.appendChild(img);
  }
}
