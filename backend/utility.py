import json, os
import random

from starlette.responses import JSONResponse

bots = {}
channel_index = 0
token = ""

ROOT = "Data"
ATTACHMENT_PATH = ROOT + "/Attachment"
MESSAGE_FILE = os.path.join(ROOT, "messages.json")
CHANNEL_FILE = os.path.join(ROOT, "channel.json")

async def write(data, path):
    try:
        with open(path, "w") as f:
            json.dump(data, f)
        return {"success": True, "messages": data}
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)


async def read(path):
    try:
        with open(path, "r") as f:
            messages = json.load(f)
        return messages
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)

async def get_channel():
    global channel_index
    channel_data = await read(CHANNEL_FILE)
    if channel_index >= len(channel_data) or channel_index < 0:
        channel_index = 0
        return None
    return channel_data[channel_index]

async def get_message():
    message_data = await read(MESSAGE_FILE)
    return random.choice(message_data)["text"]

async def get_attachments(count):
    attachment_ids = os.listdir(ATTACHMENT_PATH)
    i = min(len(attachment_ids), int(count))
    return random.sample(attachment_ids, i)

# def set_auth_cookie(resp, token):
#     resp.set_cookie(
#         key="auth",
#         value=token,
#         httponly=True,
#         secure=False,
#         samesite="strict"
#     )