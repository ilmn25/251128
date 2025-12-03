import asyncio, os,json
from fastapi import APIRouter
from starlette.requests import Request
from starlette.responses import JSONResponse
from selfbot import selfbot
from utility import bots
router = APIRouter()

from utility import ROOT, write, read
TOKEN_FILE = os.path.join(ROOT, "token.json")
if not os.path.exists(TOKEN_FILE):
    with open(TOKEN_FILE, "w") as f:
        json.dump([], f)

@router.get("/token")
async def read_token():
    return await read(TOKEN_FILE)
@router.post("/token")
async def write_token(request: Request):
    token = request.cookies.get("auth")
    if not token:
        token = await request.json()
    token = token.strip()

    if token in bots:
        resp = JSONResponse({"success": True, "message": "bot active"})
        set_auth_cookie(resp, token)
        return resp

    bot = selfbot.Main()
    if not await bot.validate_token(token):
        return JSONResponse({"error": "Token Invalid"}, status_code=400)

    asyncio.create_task(bot.start(token, reconnect=True))
    bots[token] = bot

    resp = JSONResponse({{"success": True, "message": "bot active"}})
    set_auth_cookie(resp, token)
    return resp

def set_auth_cookie(resp, token):
    resp.set_cookie(
        key="auth",
        value=token,
        httponly=True,
        secure=False,
        samesite="strict"
    )
