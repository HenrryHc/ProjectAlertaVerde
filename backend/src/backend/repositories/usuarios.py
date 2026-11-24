import threading

import pyodbc

from backend.schemas.usuarios import Usuario

_TABLE = "dbo.Usuario"

# La tabla se crea la primera vez que se usa el repositorio. Así el proyecto
# funciona sin tener que ejecutar un script manual y sin romper el arranque de
# la API cuando la base de datos no está disponible.
_CREATE_TABLE = """
IF OBJECT_ID(N'dbo.Usuario', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Usuario (
        id INT IDENTITY(1, 1) NOT NULL
            CONSTRAINT PK_Usuario PRIMARY KEY,
        email NVARCHAR(255) NOT NULL,
        password_hash NVARCHAR(255) NOT NULL,
        fecha_creacion DATETIME2 NOT NULL
            CONSTRAINT DF_Usuario_fecha DEFAULT SYSUTCDATETIME(),
        CONSTRAINT UQ_Usuario_email UNIQUE (email)
    )
END
"""

_schema_ready = False
_schema_lock = threading.Lock()


class UsuarioRepository:
    """Acceso a la tabla dbo.Usuario en SQL Server."""

    def __init__(self, connection: pyodbc.Connection) -> None:
        self._connection = connection
        self._ensure_schema()

    def _ensure_schema(self) -> None:
        global _schema_ready
        if _schema_ready:
            return

        # Varias peticiones pueden entrar a la vez al arrancar la API.
        with _schema_lock:
            if _schema_ready:
                return

            self._connection.execute(_CREATE_TABLE)
            self._connection.commit()
            _schema_ready = True

    def get_by_email(self, email: str) -> tuple[Usuario, str] | None:
        row = self._connection.execute(
            f"SELECT id, email, password_hash, fecha_creacion "
            f"FROM {_TABLE} WHERE email = ?",
            email,
        ).fetchone()

        if row is None:
            return None

        return self._to_usuario(row), row[2]

    def get_by_id(self, id: int) -> Usuario | None:
        row = self._connection.execute(
            f"SELECT id, email, password_hash, fecha_creacion "
            f"FROM {_TABLE} WHERE id = ?",
            id,
        ).fetchone()

        if row is None:
            return None

        return self._to_usuario(row)

    def update_password_hash(self, id: int, password_hash: str) -> None:
        """Se usa al migrar un hash PBKDF2 a Argon2."""
        self._connection.execute(
            f"UPDATE {_TABLE} SET password_hash = ? WHERE id = ?",
            password_hash,
            id,
        )

    def add(self, email: str, password_hash: str) -> Usuario:
        row = self._connection.execute(
            f"INSERT INTO {_TABLE} (email, password_hash) "
            "OUTPUT INSERTED.id, INSERTED.email, INSERTED.password_hash, "
            "INSERTED.fecha_creacion "
            "VALUES (?, ?)",
            email,
            password_hash,
        ).fetchone()

        return self._to_usuario(row)

    @staticmethod
    def _to_usuario(row: pyodbc.Row) -> Usuario:
        return Usuario(
            id=row[0],
            email=row[1],
            fecha_creacion=row[3],
        )
