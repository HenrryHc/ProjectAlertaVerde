import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { AuthService } from './auth.service';

const CLAVE_SESION = 'alerta-verde.sesion';

describe('AuthService', () => {
  let service: AuthService;
  let http: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    localStorage.clear();
    http.verify();
  });

  it('registra una cuenta en el backend y crea la sesión local', () => {
    let email = '';
    service.registrar('Ana@Ejemplo.com', 'clave123').subscribe((usuario) => {
      email = usuario.email;
    });

    const req = http.expectOne(
      (r) => r.method === 'POST' && r.url.endsWith('/auth/registro'),
    );
    expect(req.request.body).toEqual({ email: 'Ana@Ejemplo.com', password: 'clave123' });
    req.flush({ id: 1, email: 'ana@ejemplo.com', fecha_creacion: '2026-01-01T00:00:00' });

    expect(email).toBe('ana@ejemplo.com');
    expect(service.estaAutenticado()).toBe(true);
    expect(service.usuarioActual()).toBe('ana@ejemplo.com');
    expect(localStorage.getItem(CLAVE_SESION)).toContain('ana@ejemplo.com');
  });

  it('inicia sesión con las credenciales validadas por el backend', () => {
    let email = '';
    service.iniciarSesion('ana@ejemplo.com', 'clave123').subscribe((usuario) => {
      email = usuario.email;
    });

    const req = http.expectOne((r) => r.method === 'POST' && r.url.endsWith('/auth/login'));
    expect(req.request.body).toEqual({ email: 'ana@ejemplo.com', password: 'clave123' });
    req.flush({ id: 1, email: 'ana@ejemplo.com', fecha_creacion: '2026-01-01T00:00:00' });

    expect(email).toBe('ana@ejemplo.com');
    expect(service.estaAutenticado()).toBe(true);
  });

  it('cerrar sesión elimina solo la sesión local', () => {
    service.registrar('ana@ejemplo.com', 'clave123').subscribe();
    http
      .expectOne((r) => r.method === 'POST' && r.url.endsWith('/auth/registro'))
      .flush({ id: 1, email: 'ana@ejemplo.com', fecha_creacion: '2026-01-01T00:00:00' });

    service.cerrarSesion();

    expect(service.estaAutenticado()).toBe(false);
    expect(service.usuarioActual()).toBeNull();
    expect(localStorage.getItem(CLAVE_SESION)).toBeNull();
  });

  it('restaura la sesión guardada al crear un nuevo servicio', () => {
    localStorage.setItem(CLAVE_SESION, JSON.stringify({ email: 'ana@ejemplo.com' }));

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    const nuevoServicio = TestBed.inject(AuthService);

    expect(nuevoServicio.estaAutenticado()).toBe(true);
    expect(nuevoServicio.usuarioActual()).toBe('ana@ejemplo.com');
  });
});
