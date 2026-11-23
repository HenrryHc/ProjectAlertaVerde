# Alerta Verde — Frontend Angular

Plataforma comunitaria para registrar y administrar reportes de impacto social y ambiental.

## Requisitos
- Node.js LTS y npm
- Angular CLI (opcional; el proyecto incluye el comando vía npm)
- Python 3.10+ para el servicio opcional de almacenamiento de imágenes

## Iniciar el frontend

```bash
cd frontend
npm install
npm start
```

Abrir `http://localhost:4200`.

## Flujo de uso
1. Entrar a **Crear cuenta** y registrar un correo y contraseña.
2. Iniciar sesión (las rutas de inicio y reportes están protegidas).
3. Usar Inicio, Consultar reportes y Crear reporte.
4. En el listado se puede buscar, filtrar, editar, eliminar y cambiar el estado de cada reporte.

## Persistencia y fotografías
La plantilla del profesor implementaba autenticación de demostración con `localStorage`; se conserva ese enfoque para que el frontend pueda probarse sin credenciales de un backend. Los reportes también se guardan en `localStorage` en modo demostración.

Para guardar las fotografías como archivos reales dentro del proyecto, se incluye un servicio FastAPI en `backend/`. Al seleccionar una fotografía, Angular intenta subirla a `http://127.0.0.1:8000/api/uploads`; FastAPI la guarda en `backend/uploads/` y devuelve la ruta pública. Si el servicio no está iniciado, el frontend conserva la imagen localmente como vista previa/dato de demostración.

### Iniciar FastAPI (opcional, recomendado para guardar archivos)
En otra terminal:

```bash
cd frontend/backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

El servicio estará en `http://127.0.0.1:8000`. Verificación: `http://127.0.0.1:8000/api/health`.

## Importante para integrar con el backend definitivo
- El login actual sigue siendo el login de demostración del proyecto base (cuentas en `localStorage`); no sustituye autenticación JWT de FastAPI.
- El CRUD de reportes funciona en modo local del navegador. Para persistencia compartida entre usuarios, el siguiente paso es conectar `ReporteService` con endpoints REST de FastAPI y protegerlos con JWT.
- No se deben almacenar contraseñas reales en `localStorage`. Para producción, implementar hash de contraseñas, JWT, validación de permisos y persistencia en base de datos.

## Estructura añadida
- `src/app/components/inicio/`: dashboard y métricas.
- `src/app/components/reportes-list/`: consulta, búsqueda, filtros, estados y eliminación.
- `src/app/components/reporte-form/`: creación y edición con fotografía.
- `src/app/interfaces/reporte.interface.ts`: modelo de datos.
- `src/app/services/reporte.service.ts`: CRUD local.
- `backend/`: endpoint FastAPI para guardar imágenes en disco.
