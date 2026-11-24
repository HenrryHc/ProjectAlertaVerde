import os
from pathlib import Path
from uuid import uuid4

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

BASE_DIR = Path(__file__).resolve().parent
UPLOAD_DIR = BASE_DIR / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

MAX_BYTES = 5 * 1024 * 1024
CHUNK = 64 * 1024

# Orígenes permitidos. Para producción: ALLOWED_ORIGINS="https://tudominio.com"
ORIGINS = os.getenv(
    "ALLOWED_ORIGINS", "http://localhost:4200,http://127.0.0.1:4200"
).split(",")

app = FastAPI(title="Alerta Verde API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in ORIGINS],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")


def detectar_extension(cabecera: bytes) -> str | None:
    """Identifica el formato por el contenido real, no por el nombre del archivo."""
    if cabecera.startswith(b"\xff\xd8\xff"):
        return ".jpg"
    if cabecera.startswith(b"\x89PNG\r\n\x1a\n"):
        return ".png"
    if cabecera[:4] == b"RIFF" and cabecera[8:12] == b"WEBP":
        return ".webp"
    return None


@app.get("/api/health")
def health():
    return {"status": "ok", "service": "Alerta Verde"}


@app.post("/api/uploads")
async def upload_image(file: UploadFile = File(...)):
    contenido = bytearray()
    while True:
        bloque = await file.read(CHUNK)
        if not bloque:
            break
        contenido.extend(bloque)
        if len(contenido) > MAX_BYTES:  # corta sin cargar archivos enormes en memoria
            raise HTTPException(status_code=413, detail="La imagen supera el límite de 5 MB.")

    extension = detectar_extension(bytes(contenido[:12]))
    if extension is None:
        raise HTTPException(status_code=400, detail="Formato no permitido. Usa JPG, PNG o WEBP.")

    nombre = f"{uuid4().hex}{extension}"
    (UPLOAD_DIR / nombre).write_bytes(contenido)
    return {"filename": nombre, "url": f"/uploads/{nombre}"}