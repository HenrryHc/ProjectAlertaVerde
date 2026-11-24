import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import {
  EstadoUpdate,
  Reporte,
  ReporteFiltros,
  ReporteInput,
} from '../interfaces/reporte.interface';

@Injectable({ providedIn: 'root' })
export class ReporteService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/reportes`;

  listar(filtros: ReporteFiltros = {}): Observable<Reporte[]> {
    let params = new HttpParams();

    if (filtros.q?.trim()) {
      params = params.set('q', filtros.q.trim());
    }
    if (filtros.categoria) {
      params = params.set('categoria', filtros.categoria);
    }
    if (filtros.zona) {
      params = params.set('zona', filtros.zona);
    }
    if (filtros.estado) {
      params = params.set('estado', filtros.estado);
    }

    return this.http.get<Reporte[]>(this.baseUrl, { params });
  }

  obtener(id: number): Observable<Reporte> {
    return this.http.get<Reporte>(`${this.baseUrl}/${id}`);
  }

  crear(datos: ReporteInput): Observable<Reporte> {
    return this.http.post<Reporte>(this.baseUrl, datos);
  }

  actualizar(id: number, datos: ReporteInput): Observable<Reporte> {
    return this.http.put<Reporte>(`${this.baseUrl}/${id}`, datos);
  }

  actualizarEstado(id: number, datos: EstadoUpdate): Observable<Reporte> {
    return this.http.patch<Reporte>(`${this.baseUrl}/${id}/estado`, datos);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
