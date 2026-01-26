import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { Friend } from '../../models/user.model';
import { FriendshipService } from '../../services/friendship.service';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users-list.html',
  styleUrl: './users-list.scss',
})
export class UsersList {
  private friendshipService = inject(FriendshipService);
  private searchSubject = new Subject<string>();

  users = signal<Friend[]>([]);
  isLoading = signal<boolean>(false);
  searchTerm = signal<string>('');

  constructor() {
    // Configurar búsqueda con debounce
    this.searchSubject.pipe(debounceTime(300), distinctUntilChanged()).subscribe((term) => {
      this.performSearch(term);
    });
  }

  onSearchChange(value: string) {
    this.searchTerm.set(value);
    this.searchSubject.next(value);
  }

  performSearch(term: string) {
    if (!term || term.trim().length < 2) {
      this.users.set([]);
      return;
    }

    this.isLoading.set(true);
    this.friendshipService.searchUsers(term.trim()).subscribe({
      next: (users) => {
        this.users.set(users);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error searching users:', error);
        this.isLoading.set(false);
      },
    });
  }

  toggleFriend(user: Friend) {
    if (user.isFriend) {
      this.removeFriend(user);
    } else {
      this.addFriend(user);
    }
  }

  addFriend(user: Friend) {
    this.friendshipService.addFriend(user.id).subscribe({
      next: () => {
        // Actualizar el estado local
        this.users.update((users) =>
          users.map((u) => (u.id === user.id ? { ...u, isFriend: true } : u)),
        );
      },
      error: (error) => {
        console.error('Error adding friend:', error);
      },
    });
  }

  removeFriend(user: Friend) {
    this.friendshipService.removeFriend(user.id).subscribe({
      next: () => {
        // Actualizar el estado local
        this.users.update((users) =>
          users.map((u) => (u.id === user.id ? { ...u, isFriend: false } : u)),
        );
      },
      error: (error) => {
        console.error('Error removing friend:', error);
      },
    });
  }

  getStarsCount(points: number): number {
    return Math.floor(points / 100);
  }

  getStarsArray(points: number): number[] {
    return Array(this.getStarsCount(points)).fill(0);
  }

  getInitials(name: string, lastname?: string): string {
    const fullName = lastname ? `${name} ${lastname}` : name;
    return fullName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }
}
