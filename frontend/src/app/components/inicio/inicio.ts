import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { Reporte } from '../../interfaces/reporte.interface';
import { EstadisticasService } from '../../services/estadisticas.service';
import { ReporteService } from '../../services/reporte.service';
import { mensajeDeError } from '../../utils/api-error';
import { resolverFoto } from '../../utils/foto-url';

@Component({
  selector: 'app-inicio',
  imports: [RouterLink],
  templateUrl: './inicio.html',
})
export class Inicio {
  private readonly reporteService = inject(ReporteService);
  private readonly estadisticasService = inject(EstadisticasService);

  readonly reportes = signal<Reporte[]>([]);
  readonly total = signal(0);
  readonly pendientes = signal(0);
  readonly revision = signal(0);
  readonly atendidos = signal(0);
  readonly error = signal('');
  readonly cargando = signal(true);

  constructor() {
    this.estadisticasService
      .obtener()
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: (estadisticas) => {
          this.total.set(estadisticas.total);
          this.pendientes.set(estadisticas.por_estado.Pendiente ?? 0);
          this.revision.set(estadisticas.por_estado['En revisión'] ?? 0);
          this.atendidos.set(estadisticas.por_estado.Atendido ?? 0);
        },
        error: (error: unknown) => this.error.set(mensajeDeError(error)),
      });

    this.reporteService
      .listar()
      .pipe(
        finalize(() => this.cargando.set(false)),
        takeUntilDestroyed(),
      )
      .subscribe({
        next: (reportes) => this.reportes.set(reportes),
        error: (error: unknown) => this.error.set(mensajeDeError(error)),
      });
  }

  readonly fotoUrl = (url: string | null): string => resolverFoto(url) ?? '';
}
