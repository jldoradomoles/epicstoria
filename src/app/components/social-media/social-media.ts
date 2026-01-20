import { Component } from '@angular/core';

@Component({
  selector: 'app-social-media',
  imports: [],
  templateUrl: './social-media.html',
  styleUrl: './social-media.scss',
})
export class SocialMedia {
  socialLinks = [
    {
      name: 'Facebook',
      url: 'https://facebook.com/epicstoria',
      icon: 'fab fa-facebook-f',
      color: 'bg-blue-600 hover:bg-blue-700',
    },
    {
      name: 'Twitter',
      url: 'https://twitter.com/epicstoria',
      icon: 'fab fa-twitter',
      color: 'bg-sky-500 hover:bg-sky-600',
    },
    {
      name: 'Instagram',
      url: 'https://instagram.com/epicstoria',
      icon: 'fab fa-instagram',
      color: 'bg-pink-600 hover:bg-pink-700',
    },
    {
      name: 'YouTube',
      url: 'https://youtube.com/@epicstoria',
      icon: 'fab fa-youtube',
      color: 'bg-red-600 hover:bg-red-700',
    },
    {
      name: 'TikTok',
      url: 'https://tiktok.com/@epicstoria',
      icon: 'fab fa-tiktok',
      color: 'bg-gray-900 hover:bg-black',
    },
  ];
}
