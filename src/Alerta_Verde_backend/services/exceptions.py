class ReporteNotFoundError(Exception):
    """No existe un reporte con el id solicitado."""

    def __init__(self, id: int) -> None:
        self.id = id
        super().__init__(f"No existe un reporte con id '{id}'.")


class ComentarioRequeridoError(Exception):
    """Para marcar un reporte como Atendido se exige un comentario."""

    def __init__(self) -> None:
        super().__init__(
            "Para marcar un reporte como 'Atendido' debes indicar un "
            "comentario que justifique la verificación."
        )