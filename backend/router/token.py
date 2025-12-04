import asyncio, os,json
from fastapi import APIRouter
from starlette.requests import Request
from starlette.responses import JSONResponse
from selfbot import selfbot
router = APIRouter()

from utility import ROOT, write, read
import utility

USER_FILE = os.path.join(ROOT, "user.json")
if not os.path.exists(USER_FILE):
    with open(USER_FILE, "w") as f:
        json.dump([], f)

@router.get("/user")
async def read_user():
    users = await read(USER_FILE)
    if len(utility.bots) < 1:
        users_filtered = []
        for user in users:
            token = user["token"]
            bot = selfbot.Main()
            if not await bot.validate_token(token):
                continue
            asyncio.create_task(bot.start(token, reconnect=True))
            utility.bots[token] = bot
            users_filtered.append(user)
        return users_filtered
    return users

@router.post("/user")
async def write_user(request: Request):
    return await write(await request.json(), USER_FILE)

@router.post("/user/lookup")
async def lookup_user(request: Request):
    token = (await request.json()).strip()

    if token in utility.bots:
        utility.token = token
        return JSONResponse({"error": "User Selected"}, status_code=409)

    bot = selfbot.Main()
    if not await bot.validate_token(token):
        return JSONResponse({"error": "Token Invalid"}, status_code=400)

    utility.token = token
    asyncio.create_task(bot.start(token, reconnect=True))
    utility.bots[token] = bot

    return JSONResponse({"token": token, "username": bot.user.name})

