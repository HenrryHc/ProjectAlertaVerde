# Alerta Verde — Frontend Angular

Plataforma comunitaria para registrar y administrar reportes de impacto social y ambiental.

## Requisitos

- Node.js LTS y npm
- Backend de Alerta Verde (FastAPI + SQL Server) en `http://127.0.0.1:8000`

## Iniciar el frontend

```bash
cd frontend
npm install
npm start
```

Abrir `http://localhost:4200`. El backend debe estar activo; el frontend ya no funciona en modo demostración.

## Flujo de uso

1. Entrar a **Crear cuenta** y registrar un correo y contraseña. La cuenta se guarda en SQL Server.
2. Iniciar sesión; las credenciales se validan contra el backend.
3. Usar Inicio, Consultar reportes y Crear reporte.
4. En el listado se puede buscar, filtrar, editar, eliminar y cambiar el estado de cada reporte.

## Conexión con el backend

La URL del API vive en `src/environments/`:

- `environment.development.ts` → `http://127.0.0.1:8000` (usado por `npm start`)
- `environment.ts` → también apunta al backend local; cámbialo cuando despliegues.

Servicios que consumen el API:

- `ReporteService`: CRUD de `/reportes` (GET, POST, PUT, PATCH, DELETE).
- `EstadisticasService`: `GET /estadisticas`.
- `AuthService`: `POST /auth/registro` y `POST /auth/login`.
- `UploadService`: `POST /api/uploads` para las fotografías.

La sesión local solo guarda el email en `localStorage`; las cuentas y los hashes de contraseña viven en SQL Server. Las fotografías se sirven desde `/uploads/<archivo>` y el campo `foto_url` guarda la ruta relativa.

## Backend

El backend del proyecto está en `C:\Users\Luist\OneDrive\Desktop\ProyecAlertaVerde\backend`. Consulta su `README.md` para configurar SQL Server y arrancar FastAPI.

La carpeta `frontend/backend/` es el servicio de imágenes de la versión anterior y ya no se usa.

## Estructura principal

- `src/app/components/inicio/`: dashboard y métricas.
- `src/app/components/reportes-list/`: consulta, búsqueda, filtros, estados y eliminación.
- `src/app/components/reporte-form/`: creación y edición con fotografía.
- `src/app/components/login/` y `registro/`: autenticación contra el backend.
- `src/app/interfaces/reporte.interface.ts`: modelo alineado con el backend.
- `src/app/interfaces/auth.interface.ts`: usuario y sesión.
- `src/app/services/`: servicios HTTP (`reporte`, `estadisticas`, `auth`, `upload`).
- `src/app/utils/`: manejo de errores del API y resolución de URLs de fotos.
- `src/environments/`: URL del backend por configuración.

## Pruebas y compilación

```bash
npm run build
npm test -- --watch=false
```
