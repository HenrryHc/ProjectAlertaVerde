from datetime import datetime

from backend.schemas.reportes import (
    Categoria,
    Estado,
    EstadoUpdate,
    Reporte,
    ReporteCreate,
    ReporteUpdate,
    Zona,
)


class ReporteRepository:
    """Almacenamiento de reportes en memoria, indexado por id.

    Los datos viven durante la vida del proceso: se pierden al reiniciar el
    servidor. Es la única capa que conoce la estructura de almacenamiento.
    """

    def __init__(self) -> None:
        self._reportes: dict[int, Reporte] = {}
        self._siguiente_id: int = 1

    def list(
        self,
        q: str | None = None,
        categoria: Categoria | None = None,
        zona: Zona | None = None,
        estado: Estado | None = None,
    ) -> list[Reporte]:
        reportes = list(self._reportes.values())

        if q:
            texto = q.lower()
            reportes = [
                r
                for r in reportes
                if texto in r.descripcion.lower() or texto in r.ubicacion.lower()
            ]
        if categoria:
            reportes = [r for r in reportes if r.categoria == categoria]
        if zona:
            reportes = [r for r in reportes if r.zona == zona]
        if estado:
            reportes = [r for r in reportes if r.estado == estado]

        return sorted(reportes, key=lambda r: r.fecha_creacion, reverse=True)

    def get(self, id: int) -> Reporte | None:
        return self._reportes.get(id)

    def add(self, datos: ReporteCreate) -> Reporte:
        reporte = Reporte(
            id=self._siguiente_id,
            fecha_creacion=datetime.now(),
            **datos.model_dump(),
        )
        self._reportes[reporte.id] = reporte
        self._siguiente_id += 1
        return reporte

    def update(self, id: int, datos: ReporteUpdate) -> Reporte | None:
        reporte = self._reportes.get(id)
        if reporte is None:
            return None

        actualizado = reporte.model_copy(update=datos.model_dump())
        self._reportes[id] = actualizado
        return actualizado

    def update_estado(self, id: int, datos: EstadoUpdate) -> Reporte | None:
        reporte = self._reportes.get(id)
        if reporte is None:
            return None

        actualizado = reporte.model_copy(
            update={"estado": datos.estado, "comentario": datos.comentario}
        )
        self._reportes[id] = actualizado
        return actualizado

    def delete(self, id: int) -> bool:
        return self._reportes.pop(id, None) is not None


reporte_repository = ReporteRepository()