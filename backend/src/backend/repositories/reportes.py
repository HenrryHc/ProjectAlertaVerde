
import pyodbc

from backend.schemas.reportes import (
    Categoria,
    Estado,
    EstadoUpdate,
    Reporte,
    ReporteCreate,
    ReporteUpdate,
    Zona,
)

_TABLE = "dbo.Reporte"

_COLUMNS = (
    "id, categoria, zona, ubicacion, descripcion, "
    "foto_url, estado, comentario, fecha_creacion"
)

_INSERTED = ", ".join(
    f"INSERTED.{c.strip()}"
    for c in _COLUMNS.split(",")
)


class ReporteRepository:
    """Acceso a la tabla dbo.Reporte en SQL Server."""

    def __init__(self, connection: pyodbc.Connection) -> None:
        self._connection = connection

    def list(
        self,
        q: str | None = None,
        categoria: Categoria | None = None,
        zona: Zona | None = None,
        estado: Estado | None = None,
    ) -> list[Reporte]:

        condiciones: list[str] = []
        params: list[str] = []

        if q:
            condiciones.append(
                "(descripcion LIKE ? OR ubicacion LIKE ?)"
            )
            params += [f"%{q}%", f"%{q}%"]

        if categoria:
            condiciones.append("categoria = ?")
            params.append(categoria.value)

        if zona:
            condiciones.append("zona = ?")
            params.append(zona.value)

        if estado:
            condiciones.append("estado = ?")
            params.append(estado.value)

        where = (
            f" WHERE {' AND '.join(condiciones)}"
            if condiciones else ""
        )

        rows = self._connection.execute(
            f"SELECT {_COLUMNS} FROM {_TABLE}{where} "
            "ORDER BY fecha_creacion DESC, id DESC",
            *params,
        ).fetchall()

        return [self._to_reporte(row) for row in rows]

    def get(self, id: int) -> Reporte | None:

        row = self._connection.execute(
            f"SELECT {_COLUMNS} FROM {_TABLE} WHERE id = ?",
            id,
        ).fetchone()

        return (
            self._to_reporte(row)
            if row is not None else None
        )

    def add(self, datos: ReporteCreate) -> Reporte:

        row = self._connection.execute(
            f"INSERT INTO {_TABLE} "
            "(categoria, zona, ubicacion, descripcion, foto_url) "
            f"OUTPUT {_INSERTED} VALUES (?, ?, ?, ?, ?)",
            datos.categoria.value,
            datos.zona.value,
            datos.ubicacion,
            datos.descripcion,
            datos.foto_url,
        ).fetchone()

        return self._to_reporte(row)

    def update(
        self,
        id: int,
        datos: ReporteUpdate,
    ) -> Reporte | None:

        cursor = self._connection.execute(
            f"UPDATE {_TABLE} SET "
            "categoria = ?, zona = ?, ubicacion = ?, "
            "descripcion = ?, foto_url = ? "
            "WHERE id = ?",
            datos.categoria.value,
            datos.zona.value,
            datos.ubicacion,
            datos.descripcion,
            datos.foto_url,
            id,
        )

        if cursor.rowcount == 0:
            return None

        return self.get(id)

    def update_estado(
        self,
        id: int,
        datos: EstadoUpdate,
    ) -> Reporte | None:

        cursor = self._connection.execute(
            f"UPDATE {_TABLE} "
            "SET estado = ?, comentario = ? WHERE id = ?",
            datos.estado.value,
            datos.comentario,
            id,
        )

        if cursor.rowcount == 0:
            return None

        return self.get(id)

    def delete(self, id: int) -> bool:

        cursor = self._connection.execute(
            f"DELETE FROM {_TABLE} WHERE id = ?",
            id,
        )

        return cursor.rowcount > 0

    @staticmethod
    def _to_reporte(row: pyodbc.Row) -> Reporte:

        return Reporte(
            id=row[0],
            categoria=row[1],
            zona=row[2],
            ubicacion=row[3],
            descripcion=row[4],
            foto_url=row[5],
            estado=row[6],
            comentario=row[7],
            fecha_creacion=row[8],
        )
