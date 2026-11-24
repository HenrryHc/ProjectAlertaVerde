import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';

export interface RespuestaSubida {
  filename: string;
  url: string;
}

@Injectable({ providedIn: 'root' })
export class UploadService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/api/uploads`;

  subir(file: File): Observable<RespuestaSubida> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<RespuestaSubida>(this.url, formData);
  }
}
