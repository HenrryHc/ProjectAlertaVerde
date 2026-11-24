import { HttpErrorResponse } from '@angular/common/http';

interface ErrorValidacion {
  msg?: string;
  loc?: (string | number)[];
}

/** Convierte la respuesta de error de FastAPI en un texto para la UI. */
export function mensajeDeError(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    const detalle: unknown = error.error?.detail;

    if (typeof detalle === 'string' && detalle.trim()) {
      return detalle;
    }

    if (Array.isArray(detalle)) {
      const mensajes = detalle
        .map((item: ErrorValidacion) => {
          const campo = Array.isArray(item.loc)
            ? item.loc.filter((parte) => parte !== 'body').join('.')
            : '';
          return campo ? `${campo}: ${item.msg ?? 'valor inválido'}` : item.msg;
        })
        .filter((mensaje): mensaje is string => Boolean(mensaje));

      if (mensajes.length > 0) {
        return mensajes.join('\n');
      }
    }

    if (error.status === 0) {
      return 'No se pudo conectar con el backend. Verifica que esté activo.';
    }

    return error.message || `Error ${error.status}.`;
  }

  return 'Ocurrió un error inesperado.';
}
