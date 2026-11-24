from typing import Annotated

from fastapi import APIRouter, Depends, Path, Query, status

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
from backend.services.reportes import ReporteService, reporte_service

router = APIRouter(prefix="/reportes", tags=["reportes"])
estadisticas_router = APIRouter(prefix="/estadisticas", tags=["estadisticas"])

IdPath = Annotated[
    int,
    Path(ge=1, description="Id del reporte."),
]


def get_reporte_service() -> ReporteService:
    return reporte_service


ServiceDep = Annotated[ReporteService, Depends(get_reporte_service)]



@router.get("", response_model=list[Reporte], summary="Listar reportes")
def listar_reportes(
    service: ServiceDep,
    q: Annotated[
        str | None,
        Query(description="Texto a buscar en la descripción o la ubicación."),
    ] = None,
    categoria: Annotated[Categoria | None, Query()] = None,
    zona: Annotated[Zona | None, Query()] = None,
    estado: Annotated[Estado | None, Query()] = None,
) -> list[Reporte]:
    return service.listar(q, categoria, zona, estado)


@router.get("/{id}", response_model=Reporte, summary="Obtener un reporte por id")
def obtener_reporte(id: IdPath, service: ServiceDep) -> Reporte:
    return service.obtener(id)


@router.post(
    "",
    response_model=Reporte,
    status_code=status.HTTP_201_CREATED,
    summary="Crear un reporte",
)
def crear_reporte(datos: ReporteCreate, service: ServiceDep) -> Reporte:
    return service.crear(datos)


@router.put("/{id}", response_model=Reporte, summary="Actualizar un reporte")
def actualizar_reporte(
    id: IdPath, datos: ReporteUpdate, service: ServiceDep

) -> Reporte:
    return service.actualizar(id, datos)


@router.patch(
    "/{id}/estado",
    response_model=Reporte,
    summary="Cambiar el estado de un reporte",
)
def actualizar_estado_reporte(
    id: IdPath, datos: EstadoUpdate, service: ServiceDep
) -> Reporte:
    return service.actualizar_estado(id, datos)


@router.delete(
    "/{id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Eliminar un reporte",
)
def eliminar_reporte(id: IdPath, service: ServiceDep) -> None:
    service.eliminar(id)


@estadisticas_router.get(
    "",
    response_model=Estadisticas,
    summary="Estadísticas de los reportes",
)
def obtener_estadisticas(service: ServiceDep) -> Estadisticas:
    return service.estadisticas()