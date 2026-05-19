import os, shutil, uuid, services
from fastapi import APIRouter, UploadFile, File, Request
from session import get_user_from_request

router = APIRouter()

@router.post("/attachment")
async def create_attachment(request: Request, file: UploadFile = File(...)):
    user = get_user_from_request(request)
    if not user:
        return {"success": False, "error": "Invalid session"}

    ext = os.path.splitext(file.filename)[1]
    file_id = f"{uuid.uuid4()}{ext}"

    file_path = os.path.join(services.UPLOADS_DIR, file_id)
    with open(file_path, "wb") as destination:
        shutil.copyfileobj(file.file, destination)

    url = str(request.url_for("static", path=f"uploads/{file_id}"))
    return {"success": True, "url": url}

