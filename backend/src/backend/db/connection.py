from collections.abc import Iterator
from contextlib import contextmanager

import pyodbc

from backend.core.config import settings


@contextmanager
def get_connection() -> Iterator[pyodbc.Connection]:
    """Abre una conexión, confirma la transacción y la cierra siempre."""
    connection = pyodbc.connect(
        settings.connection_string,
        timeout=settings.db_timeout,
        autocommit=False,
    )
    try:
        yield connection
        connection.commit()
    except Exception:
        connection.rollback()
        raise
    finally:
        connection.close()


def get_db() -> Iterator[pyodbc.Connection]:
    """Dependencia de FastAPI: una conexión por request."""
    with get_connection() as connection:
        yield connection


def ping() -> None:
    """Comprueba que el servidor responde con las credenciales configuradas."""
    with get_connection() as connection:
        connection.execute("SELECT 1").fetchone()
