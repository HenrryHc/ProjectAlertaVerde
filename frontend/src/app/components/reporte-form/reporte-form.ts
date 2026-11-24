import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import {
  CATEGORIAS,
  ReporteInput,
  ZONAS,
} from '../../interfaces/reporte.interface';
import { ReporteService } from '../../services/reporte.service';
import { UploadService } from '../../services/upload.service';
import { mensajeDeError } from '../../utils/api-error';
import { resolverFoto } from '../../utils/foto-url';

const TIPOS_PERMITIDOS = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_BYTES = 5 * 1024 * 1024;

@Component({
  selector: 'app-reporte-form',
  imports: [FormsModule, RouterLink],
  templateUrl: './reporte-form.html',
})
export class ReporteForm {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly service = inject(ReporteService);
  private readonly uploadService = inject(UploadService);

  readonly categorias = CATEGORIAS;
  readonly zonas = ZONAS;

  private readonly idParam = this.route.snapshot.paramMap.get('id');
  readonly id = Number(this.idParam);
  readonly esEdicion = computed(() => this.idParam !== null);

  readonly error = signal('');
  readonly aviso = signal('');
  readonly cargando = signal(false);
  readonly guardando = signal(false);
  readonly subiendoImagen = signal(false);
  readonly imagenPreview = signal('');

  datos: ReporteInput = {
    categoria: CATEGORIAS[0],
    zona: ZONAS[0],
    ubicacion: '',
    descripcion: '',
    foto_url: null,
  };

  constructor() {
    if (!this.esEdicion()) {
      return;
    }

    this.cargando.set(true);
    this.service.obtener(this.id).subscribe({
      next: (reporte) => {
        this.datos = {
          categoria: reporte.categoria,
          zona: reporte.zona,
          ubicacion: reporte.ubicacion,
          descripcion: reporte.descripcion,
          foto_url: reporte.foto_url,
        };
        this.imagenPreview.set(resolverFoto(reporte.foto_url) ?? '');
        this.cargando.set(false);
      },
      error: (error: unknown) => {
        this.error.set(mensajeDeError(error));
        this.cargando.set(false);

        if (error instanceof HttpErrorResponse && error.status === 404) {
          void this.router.navigate(['/reportes']);
        }
      },
    });
  }

  async seleccionarImagen(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    this.error.set('');
    this.aviso.set('');

    if (!file) {
      return;
    }

    if (!TIPOS_PERMITIDOS.includes(file.type)) {
      this.error.set('Formato no permitido. Usa JPG, PNG o WEBP.');
      return;
    }

    if (file.size > MAX_BYTES) {
      this.error.set('La imagen no debe superar los 5 MB.');
      return;
    }

    this.subiendoImagen.set(true);
    try {
      const resultado = await firstValueFrom(this.uploadService.subir(file));
      this.datos.foto_url = resultado.url;
      this.imagenPreview.set(resolverFoto(resultado.url) ?? '');
    } catch (error) {
      this.error.set(mensajeDeError(error));
      this.aviso.set('No se pudo subir la fotografía. Puedes guardar el reporte sin imagen.');
    } finally {
      this.subiendoImagen.set(false);
    }
  }

  quitarImagen(): void {
    this.datos.foto_url = null;
    this.imagenPreview.set('');
    this.aviso.set('');
  }

  async guardar(): Promise<void> {
    if (this.subiendoImagen() || this.guardando()) {
      return;
    }

    this.error.set('');
    this.aviso.set('');

    const ubicacion = this.datos.ubicacion.trim();
    const descripcion = this.datos.descripcion.trim();

    if (ubicacion.length < 3) {
      this.error.set('La ubicación debe tener al menos 3 caracteres.');
      return;
    }
    if (ubicacion.length > 200) {
      this.error.set('La ubicación no puede superar los 200 caracteres.');
      return;
    }
    if (descripcion.length < 10) {
      this.error.set('La descripción debe tener al menos 10 caracteres.');
      return;
    }
    if (descripcion.length > 500) {
      this.error.set('La descripción no puede superar los 500 caracteres.');
      return;
    }

    const datos: ReporteInput = {
      ...this.datos,
      ubicacion,
      descripcion,
      foto_url: this.datos.foto_url || null,
    };

    this.guardando.set(true);
    try {
      if (this.esEdicion()) {
        await firstValueFrom(this.service.actualizar(this.id, datos));
      } else {
        await firstValueFrom(this.service.crear(datos));
      }
      await this.router.navigate(['/reportes']);
    } catch (error) {
      this.error.set(mensajeDeError(error));
    } finally {
      this.guardando.set(false);
    }
  }
}
