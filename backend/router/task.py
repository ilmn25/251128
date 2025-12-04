from fastapi import APIRouter
from starlette.requests import Request
from starlette.responses import JSONResponse
router = APIRouter()
from utility import bots

@router.post("/run")
async def run(request: Request):
    token = request.cookies.get("auth")
    if not token:
        return JSONResponse({"error": "No auth cookie"}, status_code=401)
    bot = bots.get(token)
    if not bot:
        return JSONResponse({"error": "Bot not active"}, status_code=403)
    return await bot.begin(await request.json())
