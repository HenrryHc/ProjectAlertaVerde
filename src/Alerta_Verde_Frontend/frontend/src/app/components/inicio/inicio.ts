import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ReporteService } from '../../services/reporte.service';
@Component({ selector:'app-inicio', imports:[RouterLink], templateUrl:'./inicio.html' })
export class Inicio {
  private service = inject(ReporteService);
  reportes = this.service.reportes;
  total = computed(() => this.reportes().length);
  pendientes = computed(() => this.reportes().filter(r => r.estado === 'Pendiente').length);
  revision = computed(() => this.reportes().filter(r => r.estado === 'En revisión').length);
  atendidos = computed(() => this.reportes().filter(r => r.estado === 'Atendido').length);
}
