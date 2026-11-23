import { Component, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, of } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ReporteInput } from '../../interfaces/reporte.interface';
import { ReporteService } from '../../services/reporte.service';
@Component({ selector:'app-reporte-form', imports:[FormsModule, RouterLink], templateUrl:'./reporte-form.html' })
export class ReporteForm {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private service = inject(ReporteService);
  private auth = inject(AuthService);
  private http = inject(HttpClient);
  id = Number(this.route.snapshot.paramMap.get('id'));
  esEdicion = computed(() => Number.isInteger(this.id) && this.id > 0);
  error = signal('');
  imagenPreview = signal('');
  subiendoImagen = signal(false);
  datos: ReporteInput = { titulo:'', descripcion:'', categoria:'Residuos y limpieza', ubicacion:'', imagen:'', imagenNombre:'' };
  constructor() {
    if (this.esEdicion()) {
      const r = this.service.obtener(this.id);
      if (!r) { void this.router.navigate(['/reportes']); return; }
      this.datos = { titulo:r.titulo, descripcion:r.descripcion, categoria:r.categoria, ubicacion:r.ubicacion, imagen:r.imagen, imagenNombre:r.imagenNombre };
      this.imagenPreview.set(r.imagen);
    }
  }
  seleccionarImagen(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    this.error.set('');
    if (!file) return;
    if (!file.type.startsWith('image/')) { this.error.set('Selecciona un archivo de imagen válido.'); return; }
    if (file.size > 5 * 1024 * 1024) { this.error.set('La imagen no debe superar los 5 MB.'); return; }
    const reader = new FileReader();
    reader.onload = () => {
      const value = String(reader.result);
      this.datos.imagen = value;
      this.datos.imagenNombre = file.name;
      this.imagenPreview.set(value);
      const formData = new FormData();
      this.subiendoImagen.set(true);
      formData.append('file', file);
      this.http.post<{ url: string }>('http://127.0.0.1:8000/api/uploads', formData)
        .pipe(catchError(() => of(null)))
        .subscribe(result => {
          if (result?.url) {
            this.datos.imagen = 'http://127.0.0.1:8000' + result.url;
            this.imagenPreview.set(this.datos.imagen);
          }
          this.subiendoImagen.set(false);
        });
    };
    reader.readAsDataURL(file);
  }
  quitarImagen(): void { this.datos.imagen = ''; this.datos.imagenNombre = ''; this.imagenPreview.set(''); }
  guardar(): void {
    this.error.set('');
    if (!this.datos.titulo.trim() || !this.datos.descripcion.trim() || !this.datos.ubicacion.trim()) { this.error.set('Completa el título, la descripción y la ubicación.'); return; }
    if (this.datos.titulo.length > 100 || this.datos.descripcion.length > 1000) { this.error.set('El título admite 100 caracteres y la descripción 1000.'); return; }
    if (this.esEdicion()) this.service.actualizar(this.id, this.datos);
    else this.service.crear(this.datos, this.auth.usuarioActual() ?? 'Usuario');
    void this.router.navigate(['/reportes']);
  }
}
