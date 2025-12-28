from fastapi import APIRouter, UploadFile, File
from starlette.responses import JSONResponse, FileResponse
import os, shutil, uuid
router = APIRouter()

from env import ATTACHMENT_PATH
os.makedirs(ATTACHMENT_PATH, exist_ok=True)

@router.post("/attachment")
async def create_attachment(file: UploadFile = File(...)):
    ext = os.path.splitext(file.filename)[1]
    file_id = f"{uuid.uuid4()}{ext}"

    with open(os.path.join(ATTACHMENT_PATH, file_id), "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return {"success": True, "url": file_id}


@router.get("/attachment/{url}")
async def get_attachment(url: str):
    fpath = os.path.join(ATTACHMENT_PATH, url)
    if not os.path.exists(fpath):
        return JSONResponse({"error": "File not found"}, status_code=404)
    return FileResponse(fpath)
