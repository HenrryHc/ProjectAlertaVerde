import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { environment } from '../../environments/environment';
import { AuthService } from '../services/auth.service';

/** Agrega el token JWT a las solicitudes dirigidas al backend. */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(AuthService).obtenerToken();

  const esSolicitudApi = req.url.startsWith(`${environment.apiUrl}/`);

  if (!token || !esSolicitudApi) {
    return next(req);
  }

  return next(
    req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    }),
  );
};