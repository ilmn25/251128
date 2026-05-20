import os, subprocess, platform
from fastapi import APIRouter, Request
from session import get_user_from_request

router = APIRouter()

@router.post("/system/open")
async def open_system_location(type: str, request: Request):
    user = get_user_from_request(request)
    if not user:
        return {"success": False, "error": "Invalid session"}

    path = ""
    # Docker internal paths (from docker-compose environment)
    if type == "uploads":
        path = "/app/static/uploads"
    elif type == "db":
        path = "/data/db"
    else:
        return {"success": False, "error": "Invalid type"}

    # In a local dev environment (non-docker), we might want the real path
    # But since we're in Docker, we'll try to check if we can open it (usually doesn't work in headless docker)
    # So we'll return the path info so the user knows where it is
    
    return {
        "success": True, 
        "path": path,
        "message": f"Files are stored in Docker volume mapping at {path}"
    }
