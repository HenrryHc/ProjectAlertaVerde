import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { environment } from '../../environments/environment';
import { Sesion, Usuario } from '../interfaces/auth.interface';

const CLAVE_SESION = 'alerta-verde.sesion';

/**
 * Registro e inicio de sesión contra el backend.
 *
 * Las cuentas y las contraseñas hasheadas viven en SQL Server. La sesión
 * continúa siendo local (solo se guarda el email) para no añadir tokens por
 * ahora; los endpoints de reportes siguen sin autenticación.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly esNavegador = isPlatformBrowser(this.platformId);
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/auth`;

  private readonly _usuarioActual = signal<string | null>(null);

  readonly usuarioActual = this._usuarioActual.asReadonly();
  readonly estaAutenticado = computed(() => this._usuarioActual() !== null);

  constructor() {
    if (!this.esNavegador) {
      return;
    }

    const sesion = this.leerSesion();
    if (sesion) {
      this._usuarioActual.set(sesion.email);
    }
  }

  /** Crea la cuenta en SQL Server e inicia sesión automáticamente. */
  registrar(email: string, password: string): Observable<Usuario> {
    return this.http
      .post<Usuario>(`${this.baseUrl}/registro`, { email, password })
      .pipe(tap((usuario) => this.iniciarSesionLocal(usuario.email)));
  }

  /** Valida las credenciales contra SQL Server y guarda la sesión local. */
  iniciarSesion(email: string, password: string): Observable<Usuario> {
    return this.http
      .post<Usuario>(`${this.baseUrl}/login`, { email, password })
      .pipe(tap((usuario) => this.iniciarSesionLocal(usuario.email)));
  }

  /** Elimina la sesión activa; la cuenta permanece en la base de datos. */
  cerrarSesion(): void {
    this._usuarioActual.set(null);

    if (this.esNavegador) {
      localStorage.removeItem(CLAVE_SESION);
    }
  }

  private iniciarSesionLocal(email: string): void {
    this._usuarioActual.set(email);

    if (!this.esNavegador) {
      return;
    }

    const sesion: Sesion = { email };
    localStorage.setItem(CLAVE_SESION, JSON.stringify(sesion));
  }

  private leerSesion(): Sesion | null {
    if (!this.esNavegador) {
      return null;
    }

    try {
      const json = localStorage.getItem(CLAVE_SESION);
      if (!json) {
        return null;
      }

      const sesion = JSON.parse(json);
      return sesion && typeof sesion.email === 'string' ? (sesion as Sesion) : null;
    } catch {
      return null;
    }
  }
}
