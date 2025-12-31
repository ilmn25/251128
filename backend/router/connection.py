from fastapi import APIRouter, Request
from bson.objectid import ObjectId
from pydantic import BaseModel
import mongo

router = APIRouter()

class ConnectionData(BaseModel):
    id: str | None = None
    channelId: str
    compositionId: str


@router.post("/connection")
async def connection_submit(data: ConnectionData, request: Request):
    session_id = request.cookies.get("session")
    if not session_id:
        return {"success": False, "error": "Not Logged In"}

    profile_id = request.cookies.get("profile")
    if not profile_id:
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
        "profileId": ObjectId(profile_id),
        "channelId": ObjectId(data.channelId),
        "compositionId": ObjectId(data.compositionId),
    })
    return {"success": True}


@router.get("/connection")
async def connection_list(request: Request):
    session_id = request.cookies.get("session")
    if not session_id:
        return {"success": False, "error": "Not logged in"}

    profile_id = request.cookies.get("profile")
    if not profile_id:
        return {"success": False, "error": "Invalid Session"}

    items = []
    for conn in mongo.connections.find({"profileId": ObjectId(profile_id)}):
        channel = mongo.channels.find_one({"_id": ObjectId(conn["channelId"])})
        composition = mongo.compositions.find_one({"_id": ObjectId(conn["compositionId"])})
        items.append({
            "id": str(conn["_id"]),
            "channelId": str(conn["channelId"]),
            "channel": channel["name"] if channel else None,
            "compositionId": str(conn["compositionId"]),
            "message": composition["messages"][0] if composition and composition.get("messages") else None,
        })

    return {"success": True, "items": items}

@router.get("/connection/{connection_id}")
async def connection_get_one(request: Request, connection_id: str):
    session_id = request.cookies.get("session")
    if not session_id:
        return {"success": False, "error": "Not logged in"}

    profile_id = request.cookies.get("profile")
    if not profile_id:
        return {"success": False, "error": "Invalid Session"}

    conn = mongo.connections.find_one({
        "_id": ObjectId(connection_id),
        "profileId": ObjectId(profile_id)
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