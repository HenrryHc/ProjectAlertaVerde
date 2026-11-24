# Almacenamiento de imágenes con FastAPI

Este servicio complementario guarda físicamente las fotografías en `backend/uploads/`.
El formulario Angular intenta enviar cada imagen a `http://127.0.0.1:8000/api/uploads`.
Si FastAPI no está iniciado, la aplicación mantiene una vista previa y guarda la imagen
como dato local del navegador (modo demostración).

## Ejecutar

Desde la carpeta `frontend/backend`:

```bash
python -m venv .venv
# Windows:
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

La ruta `POST /api/uploads` recibe `multipart/form-data` con el campo `file`.
Las imágenes se sirven desde `/uploads/<nombre>`.
