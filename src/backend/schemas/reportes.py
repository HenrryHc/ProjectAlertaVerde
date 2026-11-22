from datetime import datetime
from enum import Enum

from pydantic import BaseModel, ConfigDict, Field


class Categoria(str, Enum):
    BASURA_DOMESTICA = "Basura doméstica"
    DESMONTE = "Desmonte"
    PLASTICOS = "Plásticos"
    OTROS = "Otros"


class Zona(str, Enum):
    HUANCAYO = "Huancayo"
    EL_TAMBO = "El Tambo"
    CHILCA = "Chilca"
    PILCOMAYO = "Pilcomayo"
    PALIAN = "Palián"


class Estado(str, Enum):
    PENDIENTE = "Pendiente"
    EN_REVISION = "En revisión"
    ATENDIDO = "Atendido"


class ReporteBase(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    categoria: Categoria = Field(..., examples=["Desmonte"])
    zona: Zona = Field(..., examples=["Palián"])
    ubicacion: str = Field(
        ...,
        min_length=3,
        max_length=200,
        description="Dirección o referencia escrita del lugar.",
        examples=["Av. Giraldez cuadra 5, frente al parque"],
    )
    descripcion: str = Field(
        ...,
        min_length=10,
        max_length=500,
        examples=["Desmonte acumulado fuera del horario de recojo."],
    )
    foto_url: str | None = Field(
        default=None,
        max_length=300,
        description="Enlace o ruta de la foto (opcional).",
        examples=["https://ejemplo.com/foto.jpg"],
    )


class ReporteCreate(ReporteBase):
    """Datos necesarios para crear un reporte."""


class ReporteUpdate(ReporteBase):
    """Datos modificables de un reporte (el estado se cambia aparte)."""


class EstadoUpdate(BaseModel):
    """Datos para cambiar el estado de un reporte."""

    model_config = ConfigDict(str_strip_whitespace=True)

    estado: Estado = Field(..., examples=["En revisión"])
    comentario: str | None = Field(
        default=None,
        max_length=300,
        description="Obligatorio al marcar un reporte como Atendido.",
        examples=["Se verificó con foto que el lugar fue limpiado."],
    )


class Reporte(ReporteBase):
    """Representación de un reporte almacenado."""

    id: int
    estado: Estado = Estado.PENDIENTE
    comentario: str | None = None
    fecha_creacion: datetime


class Estadisticas(BaseModel):
    """Resumen para GET /estadisticas."""

    total: int
    por_estado: dict[str, int]
    por_zona: dict[str, int]
    por_categoria: dict[str, int]