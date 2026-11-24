import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { Subject, catchError, debounceTime, finalize, of, switchMap } from 'rxjs';

import {
  CATEGORIAS,
  Categoria,
  ESTADOS,
  Estado,
  Reporte,
  ReporteFiltros,
  ZONAS,
  Zona,
} from '../../interfaces/reporte.interface';
import { ReporteService } from '../../services/reporte.service';
import { mensajeDeError } from '../../utils/api-error';
import { resolverFoto } from '../../utils/foto-url';

@Component({
  selector: 'app-reportes-list',
  imports: [RouterLink, DatePipe],
  templateUrl: './reportes-list.html',
})
export class ReportesList implements OnInit {
  private readonly service = inject(ReporteService);

  readonly categorias = CATEGORIAS;
  readonly zonas = ZONAS;
  readonly estados = ESTADOS;

  readonly reportes = signal<Reporte[]>([]);
  readonly cargando = signal(false);
  readonly error = signal('');

  readonly q = signal('');
  readonly categoria = signal<Categoria | 'Todas'>('Todas');
  readonly zona = signal<Zona | 'Todas'>('Todas');
  readonly estado = signal<Estado | 'Todos'>('Todos');

  private readonly filtros$ = new Subject<ReporteFiltros>();

  constructor() {
    this.filtros$
      .pipe(
        debounceTime(200),
        switchMap((filtros) => {
          this.cargando.set(true);
          this.error.set('');

          return this.service.listar(filtros).pipe(
            catchError((error: unknown) => {
              this.error.set(mensajeDeError(error));
              return of([]);
            }),
            finalize(() => this.cargando.set(false)),
          );
        }),
        takeUntilDestroyed(),
      )
      .subscribe((reportes) => this.reportes.set(reportes));
  }

  ngOnInit(): void {
    this.cargar();
  }

  actualizarBusqueda(valor: string): void {
    this.q.set(valor);
    this.cargar();
  }

  cambiarCategoria(valor: string): void {
    this.categoria.set(valor as Categoria | 'Todas');
    this.cargar();
  }

  cambiarZona(valor: string): void {
    this.zona.set(valor as Zona | 'Todas');
    this.cargar();
  }

  cambiarEstadoFiltro(valor: string): void {
    this.estado.set(valor as Estado | 'Todos');
    this.cargar();
  }

  eliminar(reporte: Reporte): void {
    if (
      !confirm(
        `¿Seguro que deseas eliminar el reporte #${reporte.id}? Esta acción no se puede deshacer.`,
      )
    ) {
      return;
    }

    this.service.eliminar(reporte.id).subscribe({
      next: () => this.cargar(),
      error: (error: unknown) => this.error.set(mensajeDeError(error)),
    });
  }

  cambiarEstado(reporte: Reporte, event: Event): void {
    const select = event.target as HTMLSelectElement;
    const nuevoEstado = select.value as Estado;
    const estadoAnterior = reporte.estado;

    if (nuevoEstado === estadoAnterior) {
      return;
    }

    let comentario = reporte.comentario;
    if (nuevoEstado === 'Atendido') {
      const entrada = prompt(
        'Comentario obligatorio para marcar el reporte como Atendido:',
        reporte.comentario ?? '',
      );

      if (entrada === null || !entrada.trim()) {
        select.value = estadoAnterior;
        this.error.set('Debes indicar un comentario para marcar el reporte como Atendido.');
        return;
      }

      comentario = entrada.trim();
    }

    this.error.set('');
    this.service.actualizarEstado(reporte.id, { estado: nuevoEstado, comentario }).subscribe({
      next: (actualizado) =>
        this.reportes.update((lista) =>
          lista.map((item) => (item.id === actualizado.id ? actualizado : item)),
        ),
      error: (error: unknown) => {
        select.value = estadoAnterior;
        this.error.set(mensajeDeError(error));
      },
    });
  }

  readonly fotoUrl = (url: string | null): string => resolverFoto(url) ?? '';

  private cargar(): void {
    const filtros: ReporteFiltros = {};

    if (this.q().trim()) {
      filtros.q = this.q().trim();
    }
    if (this.categoria() !== 'Todas') {
      filtros.categoria = this.categoria() as Categoria;
    }
    if (this.zona() !== 'Todas') {
      filtros.zona = this.zona() as Zona;
    }
    if (this.estado() !== 'Todos') {
      filtros.estado = this.estado() as Estado;
    }

    this.filtros$.next(filtros);
  }
}
