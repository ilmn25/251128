import asyncio

from fastapi import APIRouter
from starlette.requests import Request
from starlette.responses import JSONResponse
from selfbot import selfbot
from session import active_bots

router = APIRouter()

@router.post("/login")
async def login(request: Request):
    # Check if cookie already exists
    cookie_token = request.cookies.get("auth")
    if cookie_token and cookie_token in active_bots:
        return JSONResponse({"success": True, "message": "Already logged in with cookie"})

    # Otherwise require token input
    data = await request.json()
    token = data.get("token").strip()

    if not token:
        return JSONResponse({"error": "Token required"}, status_code=400)

    # If already logged in, reuse
    if token in active_bots:
        resp = JSONResponse({"success": True, "message": "Already logged in"})
        set_auth_cookie(resp, token)
        return resp

    try:
        bot = selfbot.Main()
        asyncio.create_task(bot.start(token, reconnect=True))
        active_bots[token] = bot

        resp = JSONResponse({"success": True})
        set_auth_cookie(resp, token)

        return resp
    except Exception as e:
        return JSONResponse({"error": f"Login failed: {e}"}, status_code=400)


def set_auth_cookie(resp, token):
    resp.set_cookie(
        key="auth",
        value=token,
        httponly=True,
        secure=False,
        samesite="strict"
    )

@router.post("/logout")
async def logout(request: Request):
    data = await request.json()
    token = data.get("token")

    bot = active_bots.pop(token, None)
    if bot:
        await bot.close()
        return {"success": True, "message": "Logged out"}
    return JSONResponse({"error": "No active session"}, status_code=400)
