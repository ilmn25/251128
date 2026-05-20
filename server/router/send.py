from bson import ObjectId
from fastapi import APIRouter
from starlette.requests import Request
import random
from datetime import datetime
import services, selfbot
from session import get_profile_from_request
from pydantic import BaseModel

router = APIRouter()


class BatchSendData(BaseModel):
    connectionIds: list[str]
    message: str = None
    attachments: list = None


async def send_connection(profile, connection_id: str, message: str = None, attachments: list = None):
    connection = services.connections.find_one({
        "_id": ObjectId(connection_id),
        "profileId": ObjectId(profile["_id"])
    })
    if not connection:
        return {"success": False, "error": "Connection not found"}

    channel = services.channels.find_one({"_id": ObjectId(connection["channelId"])} )
    composition = services.compositions.find_one({"_id": ObjectId(connection["compositionId"])} )

    if not channel:
        return {"success": False, "error": "Channel not found"}
    if not composition:
        return {"success": False, "error": "Composition not found"}

    bot = await selfbot.get_bot(profile["_id"])
    if not bot:
        return {"success": False, "error": "Unable to start bot"}

    if message is None:
        if not composition.get("messages"):
            return {"success": False, "error": "Composition has no messages"}
        message = random.choice(composition["messages"])

    if attachments is None:
        count = min(composition.get("count", 1), len(composition.get("attachments", [])))
        if composition.get("randomize"):
            attachments = random.sample(composition["attachments"], count)
        else:
            attachments = composition.get("attachments", [])[:count]

    # Filters
    if channel.get("linkFilter") is False:
        message = message.replace("https://", "").replace("http://", "")
    
    if channel.get("mediaFilter") is False or not channel.get("attachmentPerm", True):
        attachments = []

    res = await bot.post(
        channel_id=channel["channelId"],
        attachments=attachments,
        message=message
    )

    if res.get("success"):
        services.connections.update_one(
            {"_id": ObjectId(connection_id)},
            {"$set": {"lastSentAt": datetime.now()}}
        )

    return res

@router.post("/send/batch")
async def send_batch(request: Request, data: BatchSendData):
    profile = get_profile_from_request(request)
    if not profile:
        return {"success": False, "error": "Invalid Profile"}

    if not data.connectionIds:
        return {"success": False, "error": "No connections selected"}

    results = []
    success_count = 0
    fail_count = 0

    for connection_id in data.connectionIds:
        result = await send_connection(profile, connection_id, message=data.message, attachments=data.attachments)
        results.append({"connectionId": connection_id, **result})
        if result.get("success"):
            success_count += 1
        else:
            fail_count += 1

    return {
        "success": success_count > 0,
        "successCount": success_count,
        "failCount": fail_count,
        "results": results
    }


class SendItemData(BaseModel):
    message: str | None = None
    attachments: list[dict] | None = None

@router.post("/send/{connectionId}")
async def send(request: Request, connectionId: str, data: SendItemData):
    profile = get_profile_from_request(request)
    if not profile:
        return {"success": False, "error": "Invalid Profile"}

    return await send_connection(profile, connectionId, message=data.message, attachments=data.attachments)

