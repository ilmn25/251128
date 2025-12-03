import os, json, discord
from fastapi import APIRouter
from starlette.requests import Request
from starlette.responses import JSONResponse
from session import active_bots
router = APIRouter()

from session import ROOT, write, read
CHANNEL_FILE = os.path.join(ROOT, "channel.json")
if not os.path.exists(CHANNEL_FILE):
    with open(CHANNEL_FILE, "w") as f:
        json.dump([], f)

@router.get("/channel")
async def read_channel():
    return await read(CHANNEL_FILE)
@router.post("/channel")
async def write_channel(request: Request):
    return await write(await request.json(), CHANNEL_FILE)
@router.post("/channel/lookup")
async def lookup_channel(request: Request):
    token = request.cookies.get("auth")
    if not token:
        return JSONResponse({"error": "No auth cookie"}, status_code=401)

    data = await request.json()
    channel_id = int(data)

    bot = active_bots.get(token)
    if not bot:
        return JSONResponse({"error": "Bot not active"}, status_code=403)

    channel = bot.get_channel(channel_id)
    if not channel:
        return JSONResponse({"error": "Channel not found"}, status_code=403)

    if isinstance(channel, discord.TextChannel) or isinstance(channel, discord.VoiceChannel):
        server_name = channel.guild.name
        channel_name = f"#{channel.name}"
    elif isinstance(channel, discord.DMChannel):
        server_name = "DM"
        channel_name = f"@{channel.recipient.name}"
    elif isinstance(channel, discord.GroupChannel):
        server_name = "Group DM"
        channel_name = channel.name or "Unnamed Group"
    else:
        server_name = "Unknown"
        channel_name = "Unknown"

    return {"info": f"{server_name} | {channel_name}"}

