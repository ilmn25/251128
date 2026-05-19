from datetime import datetime, timezone
import os, shutil, uuid, services
from bson import ObjectId
from fastapi import APIRouter, UploadFile, File, Request
from session import get_user_from_request

router = APIRouter()


def build_media_item(request: Request, record: dict) -> dict:
    return {
        "mediaId": str(record["_id"]),
        "url": record["url"],
        "name": record["name"],
        "ext": record["ext"],
        "sizeBytes": record["sizeBytes"],
        "contentType": record.get("contentType"),
        "createdAt": record.get("createdAt").isoformat() if record.get("createdAt") else None,
    }

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
    record = {
        "userId": user["_id"],
        "name": file.filename,
        "storedName": file_id,
        "url": url,
        "ext": ext.lstrip(".").lower(),
        "sizeBytes": os.path.getsize(file_path),
        "contentType": file.content_type,
        "createdAt": datetime.now(timezone.utc),
    }
    result = services.media.insert_one(record)
    record["_id"] = result.inserted_id

    return {"success": True, "item": build_media_item(request, record)}


@router.get("/attachment/media")
async def list_media(request: Request):
    user = get_user_from_request(request)
    if not user:
        return {"success": False, "error": "Invalid session"}

    items = []
    for record in services.media.find({"userId": user["_id"]}).sort("createdAt", -1):
        items.append(build_media_item(request, record))

    return {"success": True, "items": items}


@router.delete("/attachment/media/{media_id}")
async def delete_media(request: Request, media_id: str):
    user = get_user_from_request(request)
    if not user:
        return {"success": False, "error": "Invalid session"}

    record = services.media.find_one({"_id": ObjectId(media_id), "userId": user["_id"]})
    if not record:
        return {"success": False, "error": "Media not found"}

    file_path = os.path.join(services.UPLOADS_DIR, record["storedName"])
    if os.path.exists(file_path):
        os.remove(file_path)

    services.media.delete_one({"_id": record["_id"]})

    for composition in services.compositions.find({"userId": user["_id"]}):
        attachments = composition.get("attachments", [])
        filtered = [
            attachment
            for attachment in attachments
            if attachment.get("mediaId") != media_id and attachment.get("url") != record["url"]
        ]
        if filtered != attachments:
            services.compositions.update_one(
                {"_id": composition["_id"]},
                {"$set": {"attachments": filtered}}
            )

    return {"success": True}

