/** Datos públicos de una cuenta registrada en el backend. */
export interface Usuario {
  id: number;
  email: string;
  fecha_creacion: string;
}

/** Sesión activa en el navegador. Solo se guarda el email. */
export interface Sesion {
  email: string;
}
