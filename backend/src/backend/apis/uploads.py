from uuid import uuid4

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status

from backend.core.config import PROJECT_ROOT
from backend.core.security import get_current_user

router = APIRouter(
    prefix="/api/uploads",
    tags=["uploads"],
    dependencies=[Depends(get_current_user)],
)

UPLOAD_DIR = PROJECT_ROOT / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

MAX_BYTES = 5 * 1024 * 1024
CHUNK = 64 * 1024


def _detectar_extension(cabecera: bytes) -> str | None:
    """Identifica el formato por el contenido real, no por el nombre del archivo."""
    if cabecera.startswith(b"\xff\xd8\xff"):
        return ".jpg"
    if cabecera.startswith(b"\x89PNG\r\n\x1a\n"):
        return ".png"
    if cabecera[:4] == b"RIFF" and cabecera[8:12] == b"WEBP":
        return ".webp"
    return None


@router.post("", summary="Subir una fotografía")
async def subir_imagen(file: UploadFile = File(...)) -> dict[str, str]:
    contenido = bytearray()

    while True:
        bloque = await file.read(CHUNK)
        if not bloque:
            break

        contenido.extend(bloque)
        if len(contenido) > MAX_BYTES:
            raise HTTPException(
                status_code=413,
                detail="La imagen supera el límite de 5 MB.",
            )

    extension = _detectar_extension(bytes(contenido[:12]))
    if extension is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Formato no permitido. Usa JPG, PNG o WEBP.",
        )

    nombre = f"{uuid4().hex}{extension}"
    (UPLOAD_DIR / nombre).write_bytes(contenido)

    return {"filename": nombre, "url": f"/uploads/{nombre}"}
