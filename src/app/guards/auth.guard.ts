import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Si estamos usando datos estáticos (GitHub Pages), no permitir acceso a rutas protegidas
  if (environment.useStaticData) {
    router.navigate(['/']);
    return false;
  }

  if (authService.isAuthenticated()) {
    return true;
  }

  // Guardar la URL intentada para redireccionar después del login
  router.navigate(['/login'], {
    queryParams: { returnUrl: state.url },
  });

  return false;
};

export const guestGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Si estamos usando datos estáticos, redirigir al home (no permitir login/registro)
  if (environment.useStaticData) {
    router.navigate(['/']);
    return false;
  }

  if (!authService.isAuthenticated()) {
    return true;
  }

  // Si ya está autenticado, redirigir al home
  router.navigate(['/']);
  return false;
};
