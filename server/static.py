import os
from fastapi import APIRouter
from starlette.responses import FileResponse

router = APIRouter()
INDEX_PATH = os.path.join(os.path.dirname(__file__), "static", "index.html")

@router.get("/{path}")
async def spa_fallback(path):
    return FileResponse(INDEX_PATH)