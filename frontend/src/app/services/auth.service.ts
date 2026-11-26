import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { Observable, map, tap } from 'rxjs';

import { environment } from '../../environments/environment';
import { LoginResponse, Sesion, Usuario } from '../interfaces/auth.interface';

const CLAVE_SESION = 'alerta-verde.sesion';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly esNavegador = isPlatformBrowser(this.platformId);
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/auth`;

  private readonly _usuarioActual = signal<string | null>(null);
  private readonly _accessToken = signal<string | null>(null);

  readonly usuarioActual = this._usuarioActual.asReadonly();

  readonly estaAutenticado = computed(
    () => this._usuarioActual() !== null && this._accessToken() !== null,
  );

  constructor() {
    if (!this.esNavegador) {
      return;
    }

    const sesion = this.leerSesion();

    if (sesion) {
      this._usuarioActual.set(sesion.email);
      this._accessToken.set(sesion.access_token);
    }
  }

  /** Registra una cuenta y guarda el token JWT. */
  registrar(email: string, password: string): Observable<Usuario> {
    return this.http
      .post<LoginResponse>(`${this.baseUrl}/registro`, { email, password })
      .pipe(
        tap((respuesta) => this.guardarSesion(respuesta)),
        map((respuesta) => respuesta.usuario),
      );
  }

  /** Inicia sesión y guarda el token JWT. */
  iniciarSesion(email: string, password: string): Observable<Usuario> {
    return this.http
      .post<LoginResponse>(`${this.baseUrl}/login`, { email, password })
      .pipe(
        tap((respuesta) => this.guardarSesion(respuesta)),
        map((respuesta) => respuesta.usuario),
      );
  }

  /** Obtiene el token para las solicitudes al backend. */
  obtenerToken(): string | null {
    return this._accessToken();
  }

  /** Cierra la sesión local. */
  cerrarSesion(): void {
    this._usuarioActual.set(null);
    this._accessToken.set(null);

    if (this.esNavegador) {
      localStorage.removeItem(CLAVE_SESION);
    }
  }

  /** Guarda los datos del usuario y el token. */
  private guardarSesion(respuesta: LoginResponse): void {
    const sesion: Sesion = {
      email: respuesta.usuario.email,
      access_token: respuesta.access_token,
    };

    this._usuarioActual.set(sesion.email);
    this._accessToken.set(sesion.access_token);

    if (this.esNavegador) {
      localStorage.setItem(CLAVE_SESION, JSON.stringify(sesion));
    }
  }

  /** Recupera la sesión almacenada. */
  private leerSesion(): Sesion | null {
    if (!this.esNavegador) {
      return null;
    }

    try {
      const json = localStorage.getItem(CLAVE_SESION);

      if (!json) {
        return null;
      }

      const sesion: unknown = JSON.parse(json);

      if (
        typeof sesion === 'object' &&
        sesion !== null &&
        'email' in sesion &&
        'access_token' in sesion &&
        typeof sesion.email === 'string' &&
        typeof sesion.access_token === 'string' &&
        sesion.access_token.length > 0
      ) {
        return {
          email: sesion.email,
          access_token: sesion.access_token,
        };
      }

      localStorage.removeItem(CLAVE_SESION);
      return null;
    } catch {
      localStorage.removeItem(CLAVE_SESION);
      return null;
    }
  }
}