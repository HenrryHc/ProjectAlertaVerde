import { Routes } from '@angular/router';
import { authGuard, invitadoGuard } from './guards/auth.guard';
export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'inicio' },
  { path: 'login', canActivate: [invitadoGuard], loadComponent: () => import('./components/login/login').then(m => m.Login) },
  { path: 'registro', canActivate: [invitadoGuard], loadComponent: () => import('./components/registro/registro').then(m => m.Registro) },
  { path: 'inicio', canActivate: [authGuard], loadComponent: () => import('./components/inicio/inicio').then(m => m.Inicio) },
  { path: 'reportes', canActivate: [authGuard], loadComponent: () => import('./components/reportes-list/reportes-list').then(m => m.ReportesList) },
  { path: 'reportes/nuevo', canActivate: [authGuard], loadComponent: () => import('./components/reporte-form/reporte-form').then(m => m.ReporteForm) },
  { path: 'reportes/:id/editar', canActivate: [authGuard], loadComponent: () => import('./components/reporte-form/reporte-form').then(m => m.ReporteForm) },
  { path: '**', redirectTo: 'inicio' }
];
