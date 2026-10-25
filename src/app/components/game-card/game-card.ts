import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

export interface GameCardData {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  route: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

@Component({
  selector: 'app-game-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './game-card.html',
  styleUrl: './game-card.scss',
})
export class GameCard {
  game = input.required<GameCardData>();
}
