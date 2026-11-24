"""Hashing de contraseñas con Argon2 y emisión/validación de tokens JWT."""

import hashlib
import hmac
from datetime import datetime, timedelta, timezone
from typing import Annotated, Any

import jwt
from argon2 import PasswordHasher
from argon2.exceptions import InvalidHashError, VerificationError
from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from backend.core.config import settings
from backend.db.connection import get_connection
from backend.repositories.usuarios import UsuarioRepository
from backend.schemas.usuarios import Usuario
from backend.services.exceptions import TokenInvalidoError

# Parámetros recomendados por la documentación de argon2-cffi (OWASP):
# 64 MiB de memoria, 3 iteraciones y 4 hilos.
_hasher = PasswordHasher(
    time_cost=3,
    memory_cost=64 * 1024,
    parallelism=4,
    hash_len=32,
    salt_len=16,
)

_bearer = HTTPBearer(
    auto_error=False,
    description="Token JWT obtenido en POST /auth/login.",
)

# Formato usado antes de migrar a Argon2: pbkdf2_sha256$iteraciones$sal$hash.
_LEGACY_PREFIX = "pbkdf2_sha256$"


def hash_password(password: str) -> str:
    """Devuelve el hash Argon2 de la contraseña."""
    return _hasher.hash(password)


def _verify_legacy_password(password: str, stored: str) -> bool:
    """Valida hashes PBKDF2 antiguos para poder migrarlos a Argon2."""
    try:
        algorithm, iterations, salt, expected = stored.split("$", 3)
        if algorithm != "pbkdf2_sha256":
            return False

        digest = hashlib.pbkdf2_hmac(
            "sha256",
            password.encode("utf-8"),
            bytes.fromhex(salt),
            int(iterations),
        )
        return hmac.compare_digest(digest.hex(), expected)
    except (TypeError, ValueError):
        return False


def verify_password(password: str, stored: str) -> bool:
    """Compara una contraseña en texto plano con el hash almacenado."""
    if stored.startswith(_LEGACY_PREFIX):
        return _verify_legacy_password(password, stored)

    try:
        return _hasher.verify(stored, password)
    except (VerificationError, InvalidHashError):
        return False


def needs_rehash(stored: str) -> bool:
    """Indica si el hash es antiguo (PBKDF2) o usa parámetros desactualizados."""
    if stored.startswith(_LEGACY_PREFIX):
        return True

    try:
        return _hasher.check_needs_rehash(stored)
    except InvalidHashError:
        return True


def create_access_token(usuario: Usuario) -> str:
    """Firma un JWT con el id y el email de la cuenta."""
    now = datetime.now(timezone.utc)
    payload = {
        "sub": str(usuario.id),
        "email": usuario.email,
        "iat": now,
        "exp": now + timedelta(minutes=settings.jwt_expire_minutes),
    }
    return jwt.encode(
        payload,
        settings.jwt_secret.get_secret_value(),
        algorithm=settings.jwt_algorithm,
    )


def decode_access_token(token: str) -> dict[str, Any]:
    """Valida la firma y la expiración del JWT."""
    try:
        return jwt.decode(
            token,
            settings.jwt_secret.get_secret_value(),
            algorithms=[settings.jwt_algorithm],
        )
    except jwt.ExpiredSignatureError as exc:
        raise TokenInvalidoError(
            "El token expiró. Inicia sesión de nuevo."
        ) from exc
    except jwt.InvalidTokenError as exc:
        raise TokenInvalidoError("Token inválido.") from exc


def get_current_user(
    credentials: Annotated[
        HTTPAuthorizationCredentials | None, Depends(_bearer)
    ],
) -> Usuario:
    """Dependencia de FastAPI que resuelve la cuenta dueña del token.

    La conexión se abre solo después de validar el token: así una petición sin
    credenciales responde 401 sin tocar la base de datos.
    """
    if credentials is None:
        raise TokenInvalidoError("Falta el token de acceso.")

    payload = decode_access_token(credentials.credentials)

    try:
        usuario_id = int(payload.get("sub"))
    except (TypeError, ValueError) as exc:
        raise TokenInvalidoError("Token inválido.") from exc

    with get_connection() as connection:
        usuario = UsuarioRepository(connection).get_by_id(usuario_id)

    if usuario is None:
        raise TokenInvalidoError("La cuenta del token ya no existe.")

    return usuario


CurrentUser = Annotated[Usuario, Depends(get_current_user)]
