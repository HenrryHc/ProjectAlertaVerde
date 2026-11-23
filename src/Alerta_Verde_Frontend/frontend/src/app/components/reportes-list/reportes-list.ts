import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Reporte, } from '../../interfaces/reporte.interface';
import { ReporteService } from '../../services/reporte.service';
@Component({ selector:'app-reportes-list', imports:[RouterLink, DatePipe], templateUrl:'./reportes-list.html' })
export class ReportesList {
  private service = inject(ReporteService);
  reportes = this.service.reportes;
  busqueda = signal('');
  categoria = signal('Todas');
  estado = signal('Todos');
  filtrados = computed(() => this.reportes().filter(r => {
    const q = this.busqueda().toLowerCase();
    return (r.titulo.toLowerCase().includes(q) || r.descripcion.toLowerCase().includes(q) || r.ubicacion.toLowerCase().includes(q))
      && (this.categoria() === 'Todas' || r.categoria === this.categoria())
      && (this.estado() === 'Todos' || r.estado === this.estado());
  }));
  eliminar(r: Reporte): void {
    if (confirm(`¿Seguro que deseas eliminar el reporte "${r.titulo}"? Esta acción no se puede deshacer.`)) this.service.eliminar(r.id);
  }
  cambiarEstado(r: Reporte, event: Event): void {
    this.service.cambiarEstado(r.id, (event.target as HTMLSelectElement).value as Reporte['estado']);
  }
}
