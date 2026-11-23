import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('registra una cuenta e inicia sesión automáticamente', () => {
    expect(service.registrar('Ana@Ejemplo.com', 'clave123')).toBe(true);
    expect(service.estaAutenticado()).toBe(true);
    expect(service.usuarioActual()).toBe('ana@ejemplo.com');
    expect(service.existeEmail('ANA@ejemplo.com')).toBe(true);
  });

  it('rechaza un email ya registrado', () => {
    service.registrar('ana@ejemplo.com', 'clave123');

    expect(service.registrar('ana@ejemplo.com', 'otraClave1')).toBe(false);
  });

  it('inicia sesión con credenciales válidas y rechaza las incorrectas', () => {
    service.registrar('ana@ejemplo.com', 'clave123');
    service.cerrarSesion();

    expect(service.iniciarSesion('ana@ejemplo.com', 'incorrecta')).toBe(false);
    expect(service.estaAutenticado()).toBe(false);

    expect(service.iniciarSesion('ana@ejemplo.com', 'clave123')).toBe(true);
    expect(service.estaAutenticado()).toBe(true);
  });

  it('cerrar sesión no elimina la cuenta registrada', () => {
    service.registrar('ana@ejemplo.com', 'clave123');
    service.cerrarSesion();

    expect(service.estaAutenticado()).toBe(false);
    expect(service.existeEmail('ana@ejemplo.com')).toBe(true);
  });

  it('restaura la sesión guardada al crear un nuevo servicio', () => {
    service.registrar('ana@ejemplo.com', 'clave123');

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    const nuevoServicio = TestBed.inject(AuthService);

    expect(nuevoServicio.estaAutenticado()).toBe(true);
    expect(nuevoServicio.usuarioActual()).toBe('ana@ejemplo.com');
  });
});
