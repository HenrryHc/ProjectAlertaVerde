import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { Reporte, ReporteInput } from '../interfaces/reporte.interface';
import { ReporteService } from './reporte.service';

const REPORTE: Reporte = {
  id: 1,
  categoria: 'Desmonte',
  zona: 'El Tambo',
  ubicacion: 'Av. Principal 123',
  descripcion: 'Desmonte acumulado en la esquina.',
  foto_url: null,
  estado: 'Pendiente',
  comentario: null,
  fecha_creacion: '2026-01-01T00:00:00',
};

const DATOS: ReporteInput = {
  categoria: 'Desmonte',
  zona: 'El Tambo',
  ubicacion: 'Av. Principal 123',
  descripcion: 'Desmonte acumulado en la esquina.',
  foto_url: null,
};

describe('ReporteService', () => {
  let service: ReporteService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ReporteService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('lista reportes enviando los filtros definidos', () => {
    service
      .listar({
        q: ' parque ',
        categoria: 'Desmonte',
        zona: 'El Tambo',
        estado: 'Pendiente',
      })
      .subscribe();

    const req = http.expectOne((r) => r.method === 'GET' && r.url.endsWith('/reportes'));
    expect(req.request.params.get('q')).toBe('parque');
    expect(req.request.params.get('categoria')).toBe('Desmonte');
    expect(req.request.params.get('zona')).toBe('El Tambo');
    expect(req.request.params.get('estado')).toBe('Pendiente');
    expect(req.request.params.has('q')).toBe(true);
    req.flush([REPORTE]);
  });

  it('crea un reporte', () => {
    service.crear(DATOS).subscribe();
    const req = http.expectOne((r) => r.method === 'POST' && r.url.endsWith('/reportes'));
    expect(req.request.body).toEqual(DATOS);
    req.flush(REPORTE);
  });

  it('actualiza un reporte existente', () => {
    service.actualizar(1, DATOS).subscribe();
    const req = http.expectOne((r) => r.method === 'PUT' && r.url.endsWith('/reportes/1'));
    expect(req.request.body).toEqual(DATOS);
    req.flush({ ...REPORTE, descripcion: 'Actualizado' });
  });

  it('cambia el estado de un reporte', () => {
    service.actualizarEstado(1, { estado: 'Atendido', comentario: 'Limpiado' }).subscribe();
    const req = http.expectOne(
      (r) => r.method === 'PATCH' && r.url.endsWith('/reportes/1/estado'),
    );
    expect(req.request.body).toEqual({ estado: 'Atendido', comentario: 'Limpiado' });
    req.flush({ ...REPORTE, estado: 'Atendido', comentario: 'Limpiado' });
  });

  it('elimina un reporte', () => {
    service.eliminar(1).subscribe();
    const req = http.expectOne((r) => r.method === 'DELETE' && r.url.endsWith('/reportes/1'));
    req.flush(null);
  });
});
