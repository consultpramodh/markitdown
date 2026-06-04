from pathlib import Path
from tempfile import TemporaryDirectory

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from markitdown import MarkItDown


BASE_DIR = Path(__file__).resolve().parent.parent
STATIC_DIR = BASE_DIR / "static"
MAX_UPLOAD_BYTES = 50 * 1024 * 1024

app = FastAPI(title="Markdown Converter")
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")


@app.get("/", response_class=HTMLResponse)
def home() -> str:
    return (STATIC_DIR / "index.html").read_text(encoding="utf-8")


@app.post("/api/convert")
async def convert(file: UploadFile = File(...)) -> dict[str, str]:
    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Upload a non-empty file.")
    if len(content) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail="File is larger than 50 MB.")

    suffix = Path(file.filename or "upload").suffix
    try:
        with TemporaryDirectory() as tmp_dir:
            upload_path = Path(tmp_dir) / f"upload{suffix}"
            upload_path.write_bytes(content)
            result = MarkItDown(enable_plugins=False).convert(str(upload_path))
    except Exception as exc:
        raise HTTPException(
            status_code=422,
            detail=f"Could not convert this file. {exc}",
        ) from exc

    return {
        "filename": file.filename or "converted.md",
        "markdown": result.text_content,
    }
