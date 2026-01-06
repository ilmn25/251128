import os
from fastapi import APIRouter
from starlette.responses import FileResponse

router = APIRouter()
BASE_DIR = os.path.dirname(__file__)
INDEX_PATH = os.path.join(BASE_DIR, "static", "index.html")

@router.get("/{path:path}")
async def spa_fallback(path: str = ""):
    if path.startswith("static/"):
        return FileResponse(os.path.join(BASE_DIR, path)) if os.path.exists(os.path.join(BASE_DIR, path)) else FileResponse(INDEX_PATH)
    return FileResponse(INDEX_PATH)
