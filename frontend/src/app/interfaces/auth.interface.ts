/** Datos públicos de una cuenta registrada en el backend. */
export interface Usuario {
  id: number;
  email: string;
  fecha_creacion: string;
}

/** Respuesta que devuelve FastAPI al iniciar sesión o registrarse. */
export interface LoginResponse {
  access_token: string;
  token_type: 'bearer';
  expires_in: number;
  usuario: Usuario;
}

/** Datos de sesión que se conservan en el navegador. */
export interface Sesion {
  email: string;
  access_token: string;
}