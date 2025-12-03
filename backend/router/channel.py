from fastapi import APIRouter
from starlette.requests import Request
from starlette.responses import JSONResponse
from session import active_bots
router = APIRouter()

@router.post("/channel_info")
async def channel_info(request: Request):
    token = request.cookies.get("auth")
    if not token:
        return JSONResponse({"error": "No auth cookie"}, status_code=401)

    data = await request.json()

    channel = active_bots.get(token).get_channel(int(data.get("channel_id", 0)))
    if not channel:
        return JSONResponse({"error": "Channel not found"}, status_code=403)

    server_name = channel.guild.name if channel.guild else "DM"
    channel_name = getattr(channel, "name", "DM")

    return {"info": f"{server_name} | #{channel_name}"}
