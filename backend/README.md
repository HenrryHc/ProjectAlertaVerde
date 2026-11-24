# Alerta Verde API

Backend FastAPI con SQL Server para reportes de residuos y cuentas de usuario.

## Requisitos

- Python 3.13+
- `uv`
- Driver ODBC de SQL Server (`ODBC Driver 18 for SQL Server`)
- Una base de datos SQL Server accesible

## Configuración

Copia `.env.example` a `.env` y completa los datos de conexión:

```env
DB_SERVER=localhost\SQLEXPRESS
DB_NAME=EjemploDB
DB_USER=sa
DB_PASSWORD=tu_password
DB_DRIVER=ODBC Driver 18 for SQL Server
DB_ENCRYPT=yes
DB_TRUST_SERVER_CERTIFICATE=yes
DB_TIMEOUT=5
```

## Ejecutar

```bash
uv sync
uv run uvicorn backend.main:app --reload --port 8000
```

Documentación interactiva: `http://127.0.0.1:8000/docs`

## Endpoints

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/reportes` | Lista reportes; filtros `q`, `categoria`, `zona`, `estado` |
| POST | `/reportes` | Crea un reporte |
| GET | `/reportes/{id}` | Obtiene un reporte |
| PUT | `/reportes/{id}` | Actualiza los datos de un reporte |
| PATCH | `/reportes/{id}/estado` | Cambia estado y comentario |
| DELETE | `/reportes/{id}` | Elimina un reporte |
| GET | `/estadisticas` | Totales por estado, zona y categoría |
| POST | `/auth/registro` | Registra una cuenta |
| POST | `/auth/login` | Valida las credenciales |
| POST | `/api/uploads` | Sube una fotografía (máx. 5 MB) |
| GET | `/uploads/{archivo}` | Sirve una fotografía subida |

## Base de datos

Ejecuta el script de inicialización conectado a SQL Server:

```bash
sqlcmd -S localhost\SQLEXPRESS -U sa -P TU_PASSWORD -i sql/init.sql
```

El script crea la base `EjemploDB` si no existe y las tablas `dbo.Reporte` y `dbo.Usuario`. Es idempotente: no modifica tablas existentes.

- `dbo.Reporte` guarda los reportes; las columnas usan camelCase (`fotoUrl`, `fechaCreacion`).
- `dbo.Usuario` guarda las cuentas con la contraseña hasheada. Además, el backend intenta crearla automáticamente la primera vez que se registra o inicia sesión una cuenta. Si el usuario de SQL Server no tiene permisos para crear tablas, ejecuta `sql/init.sql` manualmente.

## Fotos

Las imágenes se guardan en `backend/uploads/` y se exponen en `/uploads/`. El campo `foto_url` de un reporte guarda la ruta relativa, por ejemplo `/uploads/abc123.jpg`.

## Seguridad

- Las contraseñas se almacenan con PBKDF2-HMAC-SHA256 y sal aleatoria.
- La sesión del frontend se conserva en `localStorage`; los endpoints de reportes no están protegidos con tokens todavía.
