export const CATEGORIAS = ['Basura doméstica', 'Desmonte', 'Plásticos', 'Otros'] as const;
export const ZONAS = ['Huancayo', 'El Tambo', 'Chilca', 'Pilcomayo', 'Palián'] as const;
export const ESTADOS = ['Pendiente', 'En revisión', 'Atendido'] as const;

export type Categoria = (typeof CATEGORIAS)[number];
export type Zona = (typeof ZONAS)[number];
export type Estado = (typeof ESTADOS)[number];

/** Reporte tal como lo devuelve el backend (snake_case). */
export interface Reporte {
  id: number;
  categoria: Categoria;
  zona: Zona;
  ubicacion: string;
  descripcion: string;
  foto_url: string | null;
  estado: Estado;
  comentario: string | null;
  fecha_creacion: string;
}

export type ReporteInput = Pick<
  Reporte,
  'categoria' | 'zona' | 'ubicacion' | 'descripcion' | 'foto_url'
>;

export interface EstadoUpdate {
  estado: Estado;
  comentario?: string | null;
}

export interface ReporteFiltros {
  q?: string;
  categoria?: Categoria;
  zona?: Zona;
  estado?: Estado;
}

export interface Estadisticas {
  total: number;
  por_estado: Record<Estado, number>;
  por_zona: Partial<Record<Zona, number>>;
  por_categoria: Partial<Record<Categoria, number>>;
}
