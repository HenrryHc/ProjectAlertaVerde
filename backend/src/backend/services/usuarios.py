import pyodbc

from backend.core.security import hash_password, needs_rehash, verify_password
from backend.repositories.usuarios import UsuarioRepository
from backend.schemas.usuarios import Usuario, UsuarioLogin, UsuarioRegistro
from backend.services.exceptions import (
    CredencialesInvalidasError,
    UsuarioAlreadyExistsError,
)


class UsuarioService:
    """Registro e inicio de sesión contra SQL Server."""

    def __init__(self, repository: UsuarioRepository) -> None:
        self._repository = repository

    def registrar(self, datos: UsuarioRegistro) -> Usuario:
        email = datos.email.strip().lower()

        if self._repository.get_by_email(email) is not None:
            raise UsuarioAlreadyExistsError(email)

        try:
            return self._repository.add(email, hash_password(datos.password))
        except pyodbc.IntegrityError as exc:
            # Otra petición pudo registrar el mismo email entre la consulta y el insert.
            raise UsuarioAlreadyExistsError(email) from exc

    def iniciar_sesion(self, datos: UsuarioLogin) -> Usuario:
        email = datos.email.strip().lower()
        encontrado = self._repository.get_by_email(email)

        if encontrado is None:
            raise CredencialesInvalidasError()

        usuario, password_hash = encontrado
        if not verify_password(datos.password, password_hash):
            raise CredencialesInvalidasError()

        # Las cuentas creadas antes de Argon2 se actualizan al iniciar sesión.
        if needs_rehash(password_hash):
            self._repository.update_password_hash(
                usuario.id, hash_password(datos.password)
            )

        return usuario
