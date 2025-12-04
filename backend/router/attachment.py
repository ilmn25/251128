from fastapi import APIRouter, UploadFile, File
from starlette.requests import Request
from starlette.responses import JSONResponse, FileResponse
import os, shutil, uuid
router = APIRouter()

from utility import ATTACHMENT_PATH
os.makedirs(ATTACHMENT_PATH, exist_ok=True)

@router.post("/attachment")
async def create_attachment(file: UploadFile = File(...)):
    file_id = f"{uuid.uuid4()}_{file.filename}"
    file_path = os.path.join(ATTACHMENT_PATH, file_id)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return file_id

@router.delete("/attachment")
async def delete_attachment(request: Request):
    file_id = await request.json()
    file_path = os.path.join(ATTACHMENT_PATH, file_id)

    if not os.path.exists(file_path):
        return JSONResponse({"error": "File not found"}, status_code=404)

    try:
        os.remove(file_path)
        return {"deleted": file_id}
    except Exception as e:
        return JSONResponse({"error": f"Failed to delete: {str(e)}"}, status_code=500)

@router.get("/attachment")
async def list_attachments():
    try:
        return os.listdir(ATTACHMENT_PATH)
    except Exception as e:
        return JSONResponse({"error": f"Failed to list files: {str(e)}"}, status_code=500)


@router.get("/attachment/{file_id}")
async def get_attachment(file_id: str):
    fpath = os.path.join(ATTACHMENT_PATH, file_id)
    if not os.path.exists(fpath):
        return JSONResponse({"error": "File not found"}, status_code=404)
    return FileResponse(fpath)
