from fastapi import APIRouter, UploadFile, File, Request
from starlette.responses import JSONResponse, FileResponse
import os, shutil, uuid
from session import get_user_from_request
from env import ATTACHMENT_PATH

router = APIRouter()
os.makedirs(ATTACHMENT_PATH, exist_ok=True)

@router.post("/attachment")
async def create_attachment(request: Request, file: UploadFile = File(...)):
    user = get_user_from_request(request)
    if not user:
        return {"success": False, "error": "Invalid session"}

    ext = os.path.splitext(file.filename)[1]
    file_id = f"{uuid.uuid4()}{ext}"

    with open(os.path.join(ATTACHMENT_PATH, file_id), "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return {"success": True, "url": file_id}


@router.get("/attachment/{url}")
async def get_attachment(request: Request, url: str):
    user = get_user_from_request(request)
    if not user:
        return JSONResponse(status_code=401)

    fpath = os.path.join(ATTACHMENT_PATH, url)
    if not os.path.exists(fpath):
        return JSONResponse(status_code=404)
    return FileResponse(fpath)
