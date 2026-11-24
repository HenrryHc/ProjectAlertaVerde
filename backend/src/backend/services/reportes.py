from collections import Counter

from backend.repositories.reportes import ReporteRepository
from backend.schemas.reportes import (
    Categoria,
    Estadisticas,
    Estado,
    EstadoUpdate,
    Reporte,
    ReporteCreate,
    ReporteUpdate,
    Zona,
)
from backend.services.exceptions import (
    ComentarioRequeridoError,
    ReporteNotFoundError,
)


class ReporteService:
    """Reglas de negocio del CRUD de reportes."""

    def __init__(self, repository: ReporteRepository) -> None:
        self._repository = repository

    def listar(
        self,
        q: str | None = None,
        categoria: Categoria | None = None,
        zona: Zona | None = None,
        estado: Estado | None = None,
    ) -> list[Reporte]:

        return self._repository.list(q, categoria, zona, estado)

    def obtener(self, id: int) -> Reporte:
        reporte = self._repository.get(id)
        if reporte is None:
            raise ReporteNotFoundError(id)
        return reporte

    def crear(self, datos: ReporteCreate) -> Reporte:
        return self._repository.add(datos)

    def actualizar(self, id: int, datos: ReporteUpdate) -> Reporte:
        reporte = self._repository.update(id, datos)
        if reporte is None:
            raise ReporteNotFoundError(id)
        return reporte

    def actualizar_estado(self, id: int, datos: EstadoUpdate) -> Reporte:
        if datos.estado == Estado.ATENDIDO and not datos.comentario:
            raise ComentarioRequeridoError()

        reporte = self._repository.update_estado(id, datos)
        if reporte is None:
            raise ReporteNotFoundError(id)
        return reporte

    def eliminar(self, id: int) -> None:
        if not self._repository.delete(id):
            raise ReporteNotFoundError(id)

    def estadisticas(self) -> Estadisticas:
        reportes = self._repository.list()


        por_estado = {e.value: 0 for e in Estado}
        por_estado.update(Counter(r.estado.value for r in reportes))

        return Estadisticas(
            total=len(reportes),
            por_estado=por_estado,
            por_zona=dict(Counter(r.zona.value for r in reportes)),
            por_categoria=dict(Counter(r.categoria.value for r in reportes)),
        )