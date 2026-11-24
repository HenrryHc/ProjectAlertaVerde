from typing import Annotated

import pyodbc
from fastapi import APIRouter, Depends, status

from backend.core.config import settings
from backend.core.security import CurrentUser, create_access_token
from backend.db.connection import get_db
from backend.repositories.usuarios import UsuarioRepository
from backend.schemas.usuarios import (
    LoginResponse,
    Usuario,
    UsuarioLogin,
    UsuarioRegistro,
)
from backend.services.usuarios import UsuarioService

router = APIRouter(prefix="/auth", tags=["auth"])


def get_usuario_service(
    connection: Annotated[pyodbc.Connection, Depends(get_db)],
) -> UsuarioService:
    return UsuarioService(UsuarioRepository(connection))


ServiceDep = Annotated[UsuarioService, Depends(get_usuario_service)]


def _login_response(usuario: Usuario) -> LoginResponse:
    return LoginResponse(
        access_token=create_access_token(usuario),
        expires_in=settings.jwt_expire_minutes * 60,
        usuario=usuario,
    )


@router.post(
    "/registro",
    response_model=LoginResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Registrar una cuenta e iniciar sesión",
)
def registrar_usuario(datos: UsuarioRegistro, service: ServiceDep) -> LoginResponse:
    return _login_response(service.registrar(datos))


@router.post(
    "/login",
    response_model=LoginResponse,
    summary="Iniciar sesión",
)
def iniciar_sesion(datos: UsuarioLogin, service: ServiceDep) -> LoginResponse:
    return _login_response(service.iniciar_sesion(datos))


@router.get(
    "/me",
    response_model=Usuario,
    summary="Obtener la cuenta autenticada",
)
def obtener_sesion(usuario: CurrentUser) -> Usuario:
    return usuario


@router.post(
    "/logout",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Cerrar sesión",
)
def cerrar_sesion(usuario: CurrentUser) -> None:
    """El JWT no tiene estado: el cliente descarta el token.

    El endpoint existe para que el frontend confirme el cierre de sesión y
    para poder agregar revocación en el servidor más adelante.
    """
    return None
