# Alerta Verde — Proyecto Angular + FastAPI

Plataforma comunitaria para registrar y administrar reportes de impacto social y ambiental.

## Requisitos
- Node.js compatible con Angular 22 (recomendado Node 22.22.3 o superior dentro de la rama 22, o Node 24.15+) y npm.
- Python 3.10+ para el servicio opcional de almacenamiento de imágenes.

## Iniciar el frontend
```bash
cd frontend
npm install
npm start
```
Abrir `http://localhost:4200`.

## Iniciar FastAPI para guardar fotografías en disco
En otra terminal:
```bash
cd frontend/backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```
FastAPI guarda los archivos en `frontend/backend/uploads/`. Angular envía la fotografía a `http://127.0.0.1:8000/api/uploads`. Si FastAPI no está iniciado, el frontend conserva la imagen en el almacenamiento local de demostración.

## Funcionalidades
- Registro e inicio de sesión obligatorio para las secciones privadas.
- Panel de inicio con indicadores de actividad.
- CRUD de reportes: crear, consultar, editar y eliminar.
- Búsqueda por texto y filtros por categoría y estado.
- Actualización del estado del reporte.
- Fotografía con vista previa y validación de formato/tamaño.
- Diseño adaptable con Bootstrap y paleta verde/blanco.

## Nota de integración
La autenticación del proyecto base y el CRUD de reportes usan `localStorage` para permitir probar el frontend sin depender de un backend de autenticación o base de datos. El endpoint FastAPI incluido se encarga del almacenamiento físico de fotografías. Para uso multiusuario real, se deben conectar los endpoints CRUD a la API definitiva y protegerlos con autenticación JWT, autorización y base de datos. No usar el login de demostración para datos reales.
