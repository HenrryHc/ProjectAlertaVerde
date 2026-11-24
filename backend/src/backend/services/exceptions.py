class PersonaNotFoundError(Exception):
    """No existe una persona con el DNI solicitado."""

    def __init__(self, dni: str) -> None:
        self.dni = dni
        super().__init__(f"No existe una persona con DNI '{dni}'.")


class PersonaAlreadyExistsError(Exception):
    """Ya hay una persona registrada con ese DNI."""

    def __init__(self, dni: str) -> None:
        self.dni = dni
        super().__init__(f"Ya existe una persona con DNI '{dni}'.")


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


class UsuarioAlreadyExistsError(Exception):
    """Ya existe una cuenta registrada con ese email."""

    def __init__(self, email: str) -> None:
        self.email = email
        super().__init__(f"Ya existe una cuenta con el email '{email}'.")


class CredencialesInvalidasError(Exception):
    """El email no existe o la contraseña no coincide."""

    def __init__(self) -> None:
        super().__init__("Email o contraseña incorrectos.")


class TokenInvalidoError(Exception):
    """El token JWT falta, es inválido o expiró."""

    def __init__(self, detalle: str = "Token inválido o expirado.") -> None:
        super().__init__(detalle)
