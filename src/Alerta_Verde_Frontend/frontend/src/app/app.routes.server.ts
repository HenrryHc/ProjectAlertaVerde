import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // La sesión vive en localStorage, así que las rutas protegidas y de autenticación se renderizan en el cliente.
  {
    path: 'login',
    renderMode: RenderMode.Client,
  },
  {
    path: 'registro',
    renderMode: RenderMode.Client,
  },
  {
    path: 'inicio',
    renderMode: RenderMode.Client,
  },
  {
    path: 'reportes',
    renderMode: RenderMode.Client,
  },
  {
    path: 'reportes/nuevo',
    renderMode: RenderMode.Client,
  },
  {
    path: 'reportes/:id/editar',
    renderMode: RenderMode.Client,
  },
  {
    path: '**',
    renderMode: RenderMode.Client,
  },
];
