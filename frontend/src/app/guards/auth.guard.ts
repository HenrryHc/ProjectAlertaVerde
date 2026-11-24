import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/** Protege las rutas privadas: sin sesión redirige al login. */
export const authGuard: CanActivateFn = () => {
  // En SSR no existe localStorage; las rutas privadas se renderizan en el cliente.
  if (!isPlatformBrowser(inject(PLATFORM_ID))) {
    return true;
  }

  const authService = inject(AuthService);
  if (authService.estaAutenticado()) {
    return true;
  }

  return inject(Router).createUrlTree(['/login']);
};

/** Evita que un usuario ya autenticado vuelva a login o registro. */
export const invitadoGuard: CanActivateFn = () => {
  if (!isPlatformBrowser(inject(PLATFORM_ID))) {
    return true;
  }

  const authService = inject(AuthService);
  if (!authService.estaAutenticado()) {
    return true;
  }

  return inject(Router).createUrlTree(['/inicio']);
};
