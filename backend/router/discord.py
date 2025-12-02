from fastapi import APIRouter
from starlette.requests import Request
from starlette.responses import JSONResponse
from session import active_bots
router = APIRouter()
@router.post("/channel_info")
async def channel_info(request: Request):
    data = await request.json()
    token = data.get("token")
    channel_id = int(data.get("channel_id", 0))

    channel = active_bots.get(token).get_channel(channel_id)
    if not channel:
        return JSONResponse({"error": "Channel not found"}, status_code=403)

    server_name = channel.guild.name if channel.guild else "DM"
    channel_name = getattr(channel, "name", "DM")

    return {"info": f"{server_name} | #{channel_name}"}
