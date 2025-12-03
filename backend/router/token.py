import asyncio

from fastapi import APIRouter
from starlette.requests import Request
from starlette.responses import JSONResponse
from selfbot import selfbot
from session import active_bots

router = APIRouter()

@router.post("/login")
async def login(request: Request):
    cookie_token = request.cookies.get("auth")
    if cookie_token and cookie_token in active_bots:
        return JSONResponse({"success": True, "message": "Already logged in with cookie"})

    token = await request.json()

    if token in active_bots:
        resp = JSONResponse({"success": True, "message": "token in Selfbot list"})
        set_auth_cookie(resp, token)
        return resp

    bot = selfbot.Main()
    if not await bot.validate_token(token):
        return JSONResponse({"error": "Token Invalid"}, status_code=400)
    asyncio.create_task(bot.start(token, reconnect=True))
    active_bots[token] = bot

    resp = JSONResponse({"success": True})
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
