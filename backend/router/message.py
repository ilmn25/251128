from fastapi import APIRouter, Request
from starlette.responses import JSONResponse
import os, json

router = APIRouter()
UPLOAD_DIR = "Data"
MESSAGE_FILE = os.path.join(UPLOAD_DIR, "messages.json")

os.makedirs(UPLOAD_DIR, exist_ok=True)

if not os.path.exists(MESSAGE_FILE):
    with open(MESSAGE_FILE, "w") as f:
        json.dump([], f)

@router.post("/message")
async def write(request: Request):
    try:
        data = await request.json()
        with open(MESSAGE_FILE, "w") as f:
            json.dump(data, f)
        return {"success": True, "messages": data}
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)


@router.get("/message")
async def read():
    try:
        with open(MESSAGE_FILE, "r") as f:
            messages = json.load(f)
        return {"messages": messages}
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)
