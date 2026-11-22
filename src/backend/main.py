from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse

from backend.apis.reportes import estadisticas_router
from backend.apis.reportes import router as reportes_router
from backend.services.exceptions import (
    ComentarioRequeridoError,
    ReporteNotFoundError,
)

app = FastAPI(
    title="Alerta Verde API",
    version="0.1.0",
    description="CRUD de reportes de basura en espacios públicos de Huancayo, "
    "con almacenamiento en memoria.",
)

app.include_router(reportes_router)
app.include_router(estadisticas_router)


@app.exception_handler(ReporteNotFoundError)
async def reporte_not_found_handler(
    request: Request, exc: ReporteNotFoundError
) -> JSONResponse:
    return JSONResponse(
        status_code=status.HTTP_404_NOT_FOUND,
        content={"detail": str(exc)},
    )


@app.exception_handler(ComentarioRequeridoError)

async def comentario_requerido_handler(
    request: Request, exc: ComentarioRequeridoError
) -> JSONResponse:
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={"detail": str(exc)},
    )