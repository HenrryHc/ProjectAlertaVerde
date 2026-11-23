/** Datos públicos de una cuenta registrada. */
export interface Usuario {
  email: string;
  creadoEn: string;
}

/**
 * Cuenta tal como se guarda en localStorage.
 *
 * La contraseña se almacena sin cifrar porque esta autenticación es una
 * simulación de taller: no protege datos reales ni sustituye a un backend.
 */
export interface UsuarioGuardado extends Usuario {
  password: string;
}

/** Sesión activa. Solo se guarda el email; la sesión no contiene datos sensibles. */
export interface Sesion {
  email: string;
}
