import { afterNextRender, ChangeDetectionStrategy, Component, ElementRef, inject } from '@angular/core';

@Component({
  selector: 'app-social-media',
  imports: [],
  templateUrl: './social-media.html',
  styleUrl: './social-media.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SocialMedia {
  private el = inject(ElementRef);

  constructor() {
    afterNextRender(() => {
      const observer = new IntersectionObserver(
        (entries) =>
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              (entry.target as HTMLElement).classList.add('is-visible');
              observer.unobserve(entry.target);
            }
          }),
        { threshold: 0.25, rootMargin: '0px 0px -10% 0px' }
      );
      this.el.nativeElement
        .querySelectorAll('[data-reveal]')
        .forEach((el: Element) => observer.observe(el));
    });
  }

  socialLinks = [
    {
      name: 'Facebook',
      url: 'https://www.facebook.com/share/1PhQaFcS5h/',
      icon: 'fab fa-facebook-f',
      bgClass: 'bg-facebook',
    },
    {
      name: 'X (Twitter)',
      url: 'https://x.com/Epicstoria',
      icon: 'fab fa-x-twitter',
      bgClass: 'bg-twitter',
    },
    {
      name: 'Instagram',
      url: 'https://www.instagram.com/epicstoria_/',
      icon: 'fab fa-instagram',
      bgClass: 'bg-instagram',
    },
    {
      name: 'YouTube',
      url: 'https://www.youtube.com/@Epicstoria0',
      icon: 'fab fa-youtube',
      bgClass: 'bg-youtube',
    },
    {
      name: 'TikTok',
      url: 'https://www.tiktok.com/@epicstoria',
      icon: 'fab fa-tiktok',
      bgClass: 'bg-tiktok',
    },
  ];
}
