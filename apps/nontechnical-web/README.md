# Markdown Converter

A small local web app that makes [Microsoft MarkItDown](https://github.com/microsoft/markitdown) usable through a drag-and-drop interface.

## Run

```powershell
cd apps\nontechnical-web
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```

Open http://127.0.0.1:8000 and drop in a document.

## Notes

- Files are handled locally by the running Python process.
- Uploads are capped at 50 MB.
- MarkItDown plugins are disabled in this first version to keep conversion behavior predictable.
