import { Injectable, signal } from '@angular/core';
import { Reporte, ReporteInput } from '../interfaces/reporte.interface';

const STORAGE_KEY = 'alerta-verde.reportes';
@Injectable({ providedIn: 'root' })
export class ReporteService {
  private readonly _reportes = signal<Reporte[]>(this.cargar());
  readonly reportes = this._reportes.asReadonly();

  private cargar(): Reporte[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) as Reporte[] : [];
    } catch { return []; }
  }
  private persistir(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this._reportes()));
  }
  crear(datos: ReporteInput, autor: string): void {
    const reporte: Reporte = {
      ...datos, id: Date.now(), estado: 'Pendiente',
      fecha: new Date().toISOString(), autor
    };
    this._reportes.update(items => [reporte, ...items]);
    this.persistir();
  }
  actualizar(id: number, datos: ReporteInput): boolean {
    if (!this._reportes().some(r => r.id === id)) return false;
    this._reportes.update(items => items.map(r => r.id === id ? { ...r, ...datos } : r));
    this.persistir(); return true;
  }
  eliminar(id: number): void {
    this._reportes.update(items => items.filter(r => r.id !== id));
    this.persistir();
  }
  cambiarEstado(id: number, estado: Reporte['estado']): void {
    this._reportes.update(items => items.map(r => r.id === id ? { ...r, estado } : r));
    this.persistir();
  }
  obtener(id: number): Reporte | undefined { return this._reportes().find(r => r.id === id); }
}
