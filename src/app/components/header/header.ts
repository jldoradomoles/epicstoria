import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  imports: [RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  readonly useStaticData = environment.useStaticData;

  constructor(public authService: AuthService) {}

  get currentUser() {
    return this.authService.currentUser();
  }

  get isAuthenticated() {
    return this.authService.isAuthenticated();
  }

  getInitials(): string {
    const user = this.currentUser;
    if (!user) return '?';
    const firstInitial = user.name?.charAt(0) || '';
    const lastInitial = user.lastname?.charAt(0) || '';
    return (firstInitial + lastInitial).toUpperCase() || '?';
  }

  logout(): void {
    this.authService.logout();
  }
}
