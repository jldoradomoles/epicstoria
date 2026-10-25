import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './guards/auth.guard';
import { Home } from './pages/home/home';

export const routes: Routes = [
  {
    path: '',
    component: Home,
  },
  {
    path: 'evento/:id',
    loadComponent: () => import('./pages/event-detail/event-detail').then((m) => m.EventDetail),
  },
  {
    path: 'eventos',
    loadComponent: () => import('./pages/eventos/eventos').then((m) => m.Eventos),
  },
  {
    path: 'juegos',
    loadComponent: () => import('./pages/juegos/juegos').then((m) => m.Juegos),
  },
  {
    path: 'juegos/quien-lo-dijo',
    loadComponent: () =>
      import('./pages/juegos/quien-lo-dijo/quien-lo-dijo').then((m) => m.QuienLoDijo),
  },
  {
    path: 'juegos/epic-puzzle',
    loadComponent: () => import('./pages/juegos/epic-puzzle/epic-puzzle').then((m) => m.EpicPuzzle),
  },
  {
    path: 'juegos/imprime-y-colorea',
    loadComponent: () =>
      import('./pages/juegos/imprime-y-colorea/imprime-y-colorea').then((m) => m.ImprimeYColorea),
  },
  {
    path: 'galeria',
    loadComponent: () => import('./pages/galeria/galeria').then((m) => m.Galeria),
  },
  {
    path: 'galeria/evento/:id',
    loadComponent: () =>
      import('./pages/galeria-evento/galeria-evento').then((m) => m.GaleriaEvento),
  },
  {
    path: 'acerca',
    loadComponent: () => import('./pages/about/about').then((m) => m.About),
  },
  {
    path: 'terminos',
    loadComponent: () => import('./pages/terms/terms').then((m) => m.Terms),
  },
  {
    path: 'privacidad',
    loadComponent: () => import('./pages/privacy/privacy').then((m) => m.Privacy),
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then((m) => m.LoginComponent),
    canActivate: [guestGuard],
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register').then((m) => m.RegisterComponent),
    canActivate: [guestGuard],
  },
  {
    path: 'recuperar-password',
    loadComponent: () =>
      import('./pages/recuperar-password/recuperar-password').then(
        (m) => m.RecuperarPasswordComponent,
      ),
    canActivate: [guestGuard],
  },
  {
    path: 'restablecer-password',
    loadComponent: () =>
      import('./pages/restablecer-password/restablecer-password').then(
        (m) => m.RestablecerPasswordComponent,
      ),
    canActivate: [guestGuard],
  },
  {
    path: 'perfil',
    loadComponent: () => import('./pages/profile/profile').then((m) => m.ProfileComponent),
    canActivate: [authGuard],
  },
  {
    path: 'chat/:userId',
    loadComponent: () => import('./pages/chat/chat').then((m) => m.ChatComponent),
    canActivate: [authGuard],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
