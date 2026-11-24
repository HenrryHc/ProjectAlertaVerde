from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UsuarioBase(BaseModel):
    """Datos comunes para registro e inicio de sesión."""

    model_config = ConfigDict(str_strip_whitespace=True)

    email: EmailStr = Field(..., examples=["ana@ejemplo.com"])
    password: str = Field(
        ...,
        min_length=8,
        max_length=64,
        description="Contraseña en texto plano solo durante el request; nunca se guarda así.",
    )


class UsuarioRegistro(UsuarioBase):
    """Datos necesarios para crear una cuenta."""


class UsuarioLogin(UsuarioBase):
    """Credenciales para iniciar sesión."""


class Usuario(BaseModel):
    """Cuenta almacenada, sin exponer el hash de la contraseña."""

    id: int
    email: str
    fecha_creacion: datetime


class Token(BaseModel):
    """Token JWT emitido al iniciar sesión."""

    access_token: str
    token_type: Literal["bearer"] = "bearer"
    expires_in: int = Field(
        ...,
        description="Segundos de validez del token.",
    )


class LoginResponse(Token):
    """Token y datos de la cuenta autenticada."""

    usuario: Usuario
