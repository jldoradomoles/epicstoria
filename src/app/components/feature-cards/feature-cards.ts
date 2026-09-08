import { NgOptimizedImage } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-feature-cards',
  imports: [RouterLink, NgOptimizedImage],
  templateUrl: './feature-cards.html',
  styleUrl: './feature-cards.scss',
})
export class FeatureCards {}
