import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GameCard, GameCardData } from '../../components/game-card/game-card';
import { Hero } from '../../components/hero/hero';
import { AuthService } from '../../services/auth.service';
import { PointsService } from '../../services/points.service';
import { SeoService } from '../../services/seo.service';
import { LEVELS } from '../../utils/levels.utils';

interface LeaderboardEntry {
  id: number;
  name: string;
  lastname?: string;
  nickname?: string;
  avatar_url?: string;
  country?: string;
  points: number;
  stars: number;
  level: string;
  quizzes_completed: number;
  created_at: Date;
}

@Component({
  selector: 'app-juegos',
  standalone: true,
  imports: [CommonModule, RouterLink, Hero, GameCard],
  templateUrl: './juegos.html',
  styleUrls: ['./juegos.scss'],
})
export class Juegos implements OnInit {
  leaderboard = signal<LeaderboardEntry[]>([]);
  isLoading = signal<boolean>(false);
  total = signal<number>(0);
  limit = 10;
  private seo = inject(SeoService);

  // Juegos disponibles
  availableGames = signal<GameCardData[]>([
    {
      id: 'quien-lo-dijo',
      title: '¿Quién lo dijo?',
      description:
        'Adivina quién pronunció cada cita histórica. Demuestra que conoces bien a los grandes personajes de la historia.',
      imageUrl: 'images/juegos/quien-lo-dijo.webp',
      route: '/juegos/quien-lo-dijo',
      difficulty: 'medium',
    },
    {
      id: 'epic-puzzle',
      title: 'EpicPuzzle',
      description:
        'Descubre qué evento histórico se esconde en cada imagen de puzzle. ¿Eres capaz de reconocer los grandes momentos de la historia?',
      imageUrl: 'images/juegos/cabecera-epicpuzzle.webp',
      route: '/juegos/epic-puzzle',
      difficulty: 'medium',
    },
    {
      id: 'imprime-y-colorea',
      title: 'Imprime y Colorea',
      description: 'Elige tu dibujo favorito, imprímelo y dale vida con tus colores.',
      imageUrl: 'images/juegos/imprime-y-colorea.webp',
      route: '/juegos/imprime-y-colorea',
      difficulty: 'easy',
    },
    // Más juegos irán aquí en el futuro
    // {
    //   id: 'timeline-puzzle',
    //   title: 'Ordena la Historia',
    //   description: 'Ordena cronológicamente los eventos más importantes. ¿Sabes cuál sucedió primero?',
    //   imageUrl: 'images/juegos/timeline.jpg',
    //   route: '/juegos/timeline-puzzle',
    //   difficulty: 'hard',
    // },
  ]);

  constructor(
    private pointsService: PointsService,
    public authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.seo.updateMetaTags({
      title: 'Juegos y Quizzes',
      description:
        'Pon a prueba tus conocimientos de historia con nuestros quizzes interactivos. Compite en el ranking global y gana estrellas mientras aprendes.',
      keywords: 'quiz historia, juegos educativos, trivial historia, ranking, puntos, estrellas',
      url: 'https://epicstoria.es/juegos',
      type: 'website',
    });

    this.seo.updateCanonicalUrl('https://epicstoria.es/juegos');

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

  getInitials(entry: LeaderboardEntry): string {
    // Si tiene nickname, usar las primeras dos letras del nickname
    if (entry.nickname) {
      return entry.nickname.substring(0, 2).toUpperCase();
    }
    // Si no, usar inicial del nombre y apellido
    const firstInitial = entry.name.charAt(0).toUpperCase();
    const lastInitial = entry.lastname ? entry.lastname.charAt(0).toUpperCase() : '';
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

  private readonly countryCodes: Record<string, string> = {
    Argentina: 'ar',
    Bolivia: 'bo',
    Chile: 'cl',
    Colombia: 'co',
    'Costa Rica': 'cr',
    Cuba: 'cu',
    Ecuador: 'ec',
    'El Salvador': 'sv',
    España: 'es',
    'Estados Unidos': 'us',
    Guatemala: 'gt',
    Honduras: 'hn',
    México: 'mx',
    Nicaragua: 'ni',
    Panamá: 'pa',
    Paraguay: 'py',
    Perú: 'pe',
    'Puerto Rico': 'pr',
    'República Dominicana': 'do',
    Uruguay: 'uy',
    Venezuela: 've',
  };

  getCountryCode(country?: string): string {
    if (!country) return '';
    return this.countryCodes[country] ?? '';
  }

  private readonly levelImageMap = new Map<string, number>(LEVELS.map((l) => [l.name, l.index]));

  getLevelImage(levelName: string): string {
    const index = this.levelImageMap.get(levelName) ?? 0;
    return `images/levels/Nivel-${index}.jpg`;
  }

  get currentUser() {
    return this.authService.currentUser();
  }
}
