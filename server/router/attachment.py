import os, uuid, boto3
from fastapi import APIRouter, UploadFile, File, Request
from starlette.responses import JSONResponse, RedirectResponse
from session import get_user_from_request

router = APIRouter()
s3 = boto3.client("s3")
S3_BUCKET = os.getenv("S3_BUCKET")
S3_BUCKET_URL = os.getenv("S3_BUCKET_URL")

@router.post("/attachment")
async def create_attachment(request: Request, file: UploadFile = File(...)):
    user = get_user_from_request(request)
    if not user:
        return {"success": False, "error": "Invalid session"}

    ext = os.path.splitext(file.filename)[1]
    file_id = f"{uuid.uuid4()}{ext}"

    s3.upload_fileobj(file.file, S3_BUCKET, file_id)

    url = f"{S3_BUCKET_URL}{file_id}"
    return {"success": True, "url": url}

