from fastapi import APIRouter, Request
import os, json
router = APIRouter()

from utility import MESSAGE_FILE, write, read
if not os.path.exists(MESSAGE_FILE):
    with open(MESSAGE_FILE, "w") as f:
        json.dump([], f)

@router.get("/message")
async def read_message():
    return await read(MESSAGE_FILE)
@router.post("/message")
async def write_message(request: Request):
    return await write(await request.json(), MESSAGE_FILE)


