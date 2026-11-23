export interface Reporte {
  id: number;
  titulo: string;
  descripcion: string;
  categoria: string;
  ubicacion: string;
  imagen: string;
  imagenNombre: string;
  estado: 'Pendiente' | 'En revisión' | 'Atendido';
  fecha: string;
  autor: string;
}
export type ReporteInput = Pick<Reporte, 'titulo' | 'descripcion' | 'categoria' | 'ubicacion' | 'imagen' | 'imagenNombre'>;
