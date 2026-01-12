import os, uuid, boto3
from fastapi import APIRouter, UploadFile, File, Request
from starlette.responses import JSONResponse, RedirectResponse
from session import get_user_from_request

router = APIRouter()
s3 = boto3.client("s3")
AWS_S3_BUCKET_ID = os.getenv("AWS_S3_BUCKET_ID")
AWS_REGION_ID = os.getenv("AWS_REGION_ID")
AWS_S3_BUCKET_URL = f"https://{AWS_S3_BUCKET_ID}.s3.{AWS_REGION_ID}.amazonaws.com/"

@router.post("/attachment")
async def create_attachment(request: Request, file: UploadFile = File(...)):
    user = get_user_from_request(request)
    if not user:
        return {"success": False, "error": "Invalid session"}

    ext = os.path.splitext(file.filename)[1]
    file_id = f"{uuid.uuid4()}{ext}"

    s3.upload_fileobj(file.file, AWS_S3_BUCKET_ID, file_id)

    url = f"{AWS_S3_BUCKET_URL}{file_id}"
    return {"success": True, "url": url}

