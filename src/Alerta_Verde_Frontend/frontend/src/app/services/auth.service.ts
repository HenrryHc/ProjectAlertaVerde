import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { Sesion, UsuarioGuardado } from '../interfaces/auth.interface';

const CLAVE_USUARIOS = 'alerta-verde.usuarios';
const CLAVE_SESION = 'alerta-verde.sesion';

/**
 * Autenticación simulada en el navegador.
 *
 * No hay backend ni seguridad real: las cuentas y la sesión viven en
 * localStorage y cualquiera puede modificarlas desde las herramientas del
 * navegador. Sirve para practicar el flujo registro / login / logout.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly esNavegador = isPlatformBrowser(this.platformId);

  private readonly _usuarios = signal<UsuarioGuardado[]>([]);
  private readonly _usuarioActual = signal<string | null>(null);

  readonly usuarioActual = this._usuarioActual.asReadonly();
  readonly estaAutenticado = computed(() => this._usuarioActual() !== null);

  constructor() {
    if (!this.esNavegador) {
      return;
    }

    this._usuarios.set(this.leerUsuarios());

    const sesion = this.leerSesion();
    if (sesion && this._usuarios().some((usuario) => usuario.email === sesion.email)) {
      this._usuarioActual.set(sesion.email);
    } else {
      this.olvidarSesion();
    }
  }

  /** Registra una cuenta nueva e inicia sesión automáticamente. */
  registrar(email: string, password: string): boolean {
    const emailNormalizado = this.normalizarEmail(email);
    if (this.existeEmail(emailNormalizado)) {
      return false;
    }

    const usuario: UsuarioGuardado = {
      email: emailNormalizado,
      password,
      creadoEn: new Date().toISOString(),
    };

    this._usuarios.update((usuarios) => [...usuarios, usuario]);
    this.guardarUsuarios();
    this.iniciarSesion(emailNormalizado, password);
    return true;
  }

  /** Devuelve true si las credenciales son válidas y deja la sesión iniciada. */
  iniciarSesion(email: string, password: string): boolean {
    const emailNormalizado = this.normalizarEmail(email);
    const usuario = this._usuarios().find(
      (candidato) => candidato.email === emailNormalizado && candidato.password === password,
    );

    if (!usuario) {
      return false;
    }

    this._usuarioActual.set(usuario.email);
    this.guardarSesion({ email: usuario.email });
    return true;
  }

  /** Elimina la sesión activa; las cuentas registradas se conservan. */
  cerrarSesion(): void {
    this._usuarioActual.set(null);
    this.olvidarSesion();
  }

  /** Comprueba si ya hay una cuenta con ese email (para validar el registro). */
  existeEmail(email: string): boolean {
    const emailNormalizado = this.normalizarEmail(email);
    return this._usuarios().some((usuario) => usuario.email === emailNormalizado);
  }

  private normalizarEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  private leerUsuarios(): UsuarioGuardado[] {
    if (!this.esNavegador) {
      return [];
    }

    try {
      const json = localStorage.getItem(CLAVE_USUARIOS);
      if (!json) {
        return [];
      }

      const usuarios = JSON.parse(json);
      return Array.isArray(usuarios) ? (usuarios as UsuarioGuardado[]) : [];
    } catch {
      return [];
    }
  }

  private guardarUsuarios(): void {
    if (!this.esNavegador) {
      return;
    }

    localStorage.setItem(CLAVE_USUARIOS, JSON.stringify(this._usuarios()));
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

  private guardarSesion(sesion: Sesion): void {
    if (!this.esNavegador) {
      return;
    }

    localStorage.setItem(CLAVE_SESION, JSON.stringify(sesion));
  }

  private olvidarSesion(): void {
    if (!this.esNavegador) {
      return;
    }

    localStorage.removeItem(CLAVE_SESION);
  }
}
