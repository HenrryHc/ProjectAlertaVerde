import { environment } from '../../environments/environment';

/** Resuelve rutas relativas de fotos contra la URL del backend. */
export function resolverFoto(url: string | null | undefined): string | null {
  if (!url) {
    return null;
  }

  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  const ruta = url.startsWith('/') ? url : `/${url}`;
  return `${environment.apiUrl}${ruta}`;
}
