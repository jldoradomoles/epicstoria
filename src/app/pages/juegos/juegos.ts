import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Hero } from '../../components/hero/hero';
import { PointsService } from '../../services/points.service';
import { SeoService } from '../../services/seo.service';

interface LeaderboardEntry {
  id: number;
  name: string;
  lastname?: string;
  avatar_url?: string;
  points: number;
  stars: number;
  quizzes_completed: number;
  created_at: Date;
}

@Component({
  selector: 'app-juegos',
  standalone: true,
  imports: [CommonModule, RouterLink, Hero],
  templateUrl: './juegos.html',
  styleUrl: './juegos.scss',
})
export class Juegos implements OnInit {
  leaderboard = signal<LeaderboardEntry[]>([]);
  isLoading = signal<boolean>(false);
  total = signal<number>(0);
  limit = 10;
  private seo = inject(SeoService);

  constructor(private pointsService: PointsService) {}

  ngOnInit(): void {
    this.seo.updateMetaTags({
      title: 'Juegos y Quizzes',
      description:
        'Pon a prueba tus conocimientos de historia con nuestros quizzes interactivos. Compite en el ranking global y gana estrellas mientras aprendes.',
      keywords: 'quiz historia, juegos educativos, trivial historia, ranking, puntos, estrellas',
      url: 'https://epicstoria.com/juegos',
      type: 'website',
    });

    this.seo.updateCanonicalUrl('https://epicstoria.com/juegos');

    this.loadLeaderboard();
  }

  loadLeaderboard() {
    this.isLoading.set(true);
    this.pointsService.getLeaderboard(this.limit).subscribe({
      next: (response) => {
        this.leaderboard.set(response.data.leaderboard);
        this.total.set(response.data.total);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading leaderboard:', error);
        this.isLoading.set(false);
      },
    });
  }

  getInitials(name: string, lastname?: string): string {
    const firstInitial = name.charAt(0).toUpperCase();
    const lastInitial = lastname ? lastname.charAt(0).toUpperCase() : '';
    return firstInitial + lastInitial;
  }

  getStarsArray(stars: number): number[] {
    return Array(Math.min(stars, 10)).fill(0);
  }

  getRankClass(index: number): string {
    if (index === 0) return 'text-yellow-400'; // Oro
    if (index === 1) return 'text-gray-300'; // Plata
    if (index === 2) return 'text-orange-400'; // Bronce
    return 'text-blue-400';
  }

  getRankIcon(index: number): string {
    if (index === 0) return 'fa-crown';
    if (index === 1) return 'fa-medal';
    if (index === 2) return 'fa-award';
    return 'fa-trophy';
  }
}
