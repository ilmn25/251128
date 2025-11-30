import asyncio
import selfbot
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Keep active sessions here
active_bots = {}

@app.post("/login")
async def login(request: Request):
    data = await request.json()
    token = data.get("token")

    if not token or not token.strip():
        return JSONResponse({"error": "Token required"}, status_code=400)

    # If already logged in, reuse
    if token in active_bots:
        return {"success": True, "message": "Already logged in"}

    try:
        bot = selfbot.Main()
        asyncio.create_task(bot.start(token, reconnect=True))
        active_bots[token] = bot
        return {"success": True}
    except Exception as e:
        return JSONResponse({"error": f"Login failed: {e}"}, status_code=400)

@app.post("/logout")
async def logout(request: Request):
    data = await request.json()
    token = data.get("token")

    bot = active_bots.pop(token, None)
    if bot:
        await bot.close()
        return {"success": True, "message": "Logged out"}
    return JSONResponse({"error": "No active session"}, status_code=400)

@app.post("/channel_info")
async def channel_info(request: Request):
    data = await request.json()
    token = data.get("token")
    channel_id = int(data.get("channel_id", 0))

    channel = active_bots.get("***REMOVED***").get_channel(channel_id)
    if not channel:
        return JSONResponse({"error": "Channel not found"}, status_code=403)

    server_name = channel.guild.name if channel.guild else "DM"
    channel_name = getattr(channel, "name", "DM")

    return {"info": f"{server_name} | #{channel_name}"}

# ==================== ENTRY POINT ====================
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
