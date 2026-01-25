from bson import ObjectId
from fastapi import APIRouter
from starlette.requests import Request
import random
import services, selfbot
from session import get_profile_from_request
router = APIRouter()

@router.post("/send/{connectionId}")
async def send(request: Request, connectionId: str):
    profile = get_profile_from_request(request)
    if not profile:
        return {"success": False, "error": "Invalid Profile"}

    connection = services.connections.find_one({
        "_id": ObjectId(connectionId),
        "profileId": ObjectId(profile["_id"])
    })
    if not connection:
        return {"success": False, "error": "Connection not found"}

    channel = services.channels.find_one({"_id": ObjectId(connection["channelId"])})
    composition = services.compositions.find_one({"_id": ObjectId(connection["compositionId"])})

    bot = await selfbot.get_bot(profile["_id"])

    count = min(composition["count"], len(composition["attachments"]))
    if composition["randomize"]:
        attachments = random.sample(composition["attachments"], count)
    else:
        attachments = composition["attachments"][:count]

    message = random.choice(composition["messages"])

    return await bot.post(
        channel_id=channel["channelId"],
        attachments=attachments,
        message=message
    )
