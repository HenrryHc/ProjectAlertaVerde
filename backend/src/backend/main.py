from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from backend.apis.reportes import estadisticas_router
from backend.apis.reportes import router as reportes_router
from backend.apis.uploads import UPLOAD_DIR
from backend.apis.uploads import router as uploads_router
from backend.apis.usuarios import router as usuarios_router
from backend.services.exceptions import (
    ComentarioRequeridoError,
    CredencialesInvalidasError,
    PersonaAlreadyExistsError,
    PersonaNotFoundError,
    ReporteNotFoundError,
    TokenInvalidoError,
    UsuarioAlreadyExistsError,
)

app = FastAPI(
    title="Alerta Verde API",
    version="0.1.0",
    description="CRUD de reportes de basura en Huancayo con almacenamiento en SQL Server.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:4200",
        "http://127.0.0.1:4200",
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(reportes_router)
app.include_router(estadisticas_router)
app.include_router(usuarios_router)
app.include_router(uploads_router)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")



@app.exception_handler(PersonaNotFoundError)
async def persona_not_found_handler(
    request: Request, exc: PersonaNotFoundError
) -> JSONResponse:
    return JSONResponse(
        status_code=status.HTTP_404_NOT_FOUND,
        content={"detail": str(exc)},
    )


@app.exception_handler(PersonaAlreadyExistsError)
async def persona_already_exists_handler(
    request: Request, exc: PersonaAlreadyExistsError
) -> JSONResponse:
    return JSONResponse(
        status_code=status.HTTP_409_CONFLICT,
        content={"detail": str(exc)},
    )


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


@app.exception_handler(UsuarioAlreadyExistsError)
async def usuario_already_exists_handler(
    request: Request, exc: UsuarioAlreadyExistsError
) -> JSONResponse:
    return JSONResponse(
        status_code=status.HTTP_409_CONFLICT,
        content={"detail": str(exc)},
    )


@app.exception_handler(CredencialesInvalidasError)
async def credenciales_invalidas_handler(
    request: Request, exc: CredencialesInvalidasError
) -> JSONResponse:
    return JSONResponse(
        status_code=status.HTTP_401_UNAUTHORIZED,
        content={"detail": str(exc)},
    )


@app.exception_handler(TokenInvalidoError)
async def token_invalido_handler(
    request: Request, exc: TokenInvalidoError
) -> JSONResponse:
    return JSONResponse(
        status_code=status.HTTP_401_UNAUTHORIZED,
        content={"detail": str(exc)},
        headers={"WWW-Authenticate": "Bearer"},
    )