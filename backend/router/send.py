from bson import ObjectId
from fastapi import APIRouter
from starlette.requests import Request
import random
import mongo

router = APIRouter()
import utility

@router.post("/send/{connectionId}")
async def send(request: Request, connectionId: str):
    session_id = request.cookies.get("session")
    profile_id = request.cookies.get("profile")
    if not session_id or not profile_id:
        return {"success": False, "error": "Invalid Session"}

    connection = mongo.connections.find_one({
        "_id": ObjectId(connectionId),
        "profileId": ObjectId(profile_id)
    })
    if not connection:
        return {"success": False, "error": "Connection not found"}

    channel = mongo.channels.find_one({"_id": ObjectId(connection["channelId"])})
    composition = mongo.compositions.find_one({"_id": ObjectId(connection["compositionId"])})

    bot = await utility.get_bot(profile_id)

    count = min(composition["count"], len(composition["attachments"]))
    if composition["randomize"]:
        attachments = random.sample(composition["attachments"], count)
    else:
        attachments = composition["attachments"][:count]

    message = random.choice(composition["messages"])

    await bot.post(
        channel_id=channel["channelId"],
        attachments=attachments,
        message=message
    )
    return {"success": True}
