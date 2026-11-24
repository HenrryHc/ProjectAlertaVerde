import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { Estadisticas } from '../interfaces/reporte.interface';

@Injectable({ providedIn: 'root' })
export class EstadisticasService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/estadisticas`;

  obtener(): Observable<Estadisticas> {
    return this.http.get<Estadisticas>(this.url);
  }
}
