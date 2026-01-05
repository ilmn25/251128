from fastapi import APIRouter, Request
from bson.objectid import ObjectId
from pydantic import BaseModel
import mongo
from session import get_profile_from_request

router = APIRouter()

class ConnectionData(BaseModel):
    id: str | None = None
    channelId: str
    compositionId: str


@router.post("/connection")
async def connection_submit(data: ConnectionData, request: Request):
    profile = get_profile_from_request(request)
    if not profile:
        return {"success": False, "error": "Invalid Session"}

    # If id is provided and matches → update
    if data.id:
        connection = mongo.connections.find_one({"_id": ObjectId(data.id)})
        if connection:
            mongo.connections.update_one(
                {"_id": connection["_id"]},
                {"$set": {
                    "channelId": ObjectId(data.channelId),
                    "compositionId": ObjectId(data.compositionId),
                }}
            )
            return {"success": True}

    # Otherwise → insert new
    mongo.connections.insert_one({
        "profileId": profile["_id"],
        "channelId": ObjectId(data.channelId),
        "compositionId": ObjectId(data.compositionId),
    })
    return {"success": True}


@router.get("/connection")
async def connection_list(request: Request):
    profile = get_profile_from_request(request)
    if not profile:
        return {"success": False, "error": "Invalid Session"}

    items = []
    for conn in mongo.connections.find({"profileId": profile["_id"]}):
        channel = mongo.channels.find_one({"_id": ObjectId(conn["channelId"])})
        composition = mongo.compositions.find_one({"_id": ObjectId(conn["compositionId"])})
        items.append({
            "id": str(conn["_id"]),
            "channelId": str(conn["channelId"]),
            "channel": channel["name"],
            "compositionId": str(conn["compositionId"]),
            "message": composition["messages"][0],
        })

    return {"success": True, "items": items}

@router.get("/connection/{connection_id}")
async def connection_get_one(request: Request, connection_id: str):
    profile = get_profile_from_request(request)
    if not profile:
        return {"success": False, "error": "Invalid Session"}

    conn = mongo.connections.find_one({
        "_id": ObjectId(connection_id),
        "profileId": profile["_id"]
    })
    if not conn:
        return {"success": False, "error": "Connection not found"}

    return {
        "success": True,
        "item": {
            "id": str(conn["_id"]),
            "channelId": str(conn["channelId"]),
            "compositionId": str(conn["compositionId"]),
        }
    }

@router.delete("/connection/{connection_id}")
async def connection_delete(request: Request, connection_id: str):
    profile = get_profile_from_request(request)
    if not profile:
        return {"success": False, "error": "Invalid Session"}

    conn = mongo.connections.find_one({
        "_id": ObjectId(connection_id),
        "profileId": profile["_id"]
    })
    if not conn:
        return {"success": False, "error": "Connection not found"}

    mongo.connections.delete_one({"_id": conn["_id"]})

    return {"success": True}
