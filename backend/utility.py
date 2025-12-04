import json, os
from starlette.responses import JSONResponse

bots = {}

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
