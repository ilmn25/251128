from fastapi import APIRouter
from starlette.requests import Request
from starlette.responses import JSONResponse
router = APIRouter()
import utility
#
# @router.post("/task/get")
# async def get(request: Request):
#     if utility.token not in utility.bots:
#         return JSONResponse({"error": "Bot not active"}, status_code=403)
#     bot = utility.bots[utility.token]
#     data = await request.json()
#     if data["task"] == "next":
#         utility.channel_index += 1
#     if data["task"] == "prev":
#         utility.channel_index -= 1
#     if data["task"] == "reset":
#         utility.channel_index = 9999
#     return JSONResponse(await bot.get(data["attachment_count"]))
#
# @router.post("/task/post")
# async def post():
#     bot = utility.bots[utility.token]
#     if not bot:
#         return JSONResponse({"error": "Bot not active"}, status_code=403)
#     return JSONResponse(await bot.post())
#
# @router.post("/task/reset")
# async def reset():
#     utility.channel_index = 0
#     return JSONResponse({"success": True})
#
# @router.post("/task/skip")
# async def reset():
#     utility.channel_index += 1
#     return JSONResponse({"success": True})

