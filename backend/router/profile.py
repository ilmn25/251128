import asyncio
from fastapi import APIRouter, Request
from bson.objectid import ObjectId
from pydantic import BaseModel
import mongo
import utility
from selfbot import selfbot

router = APIRouter()

class ProfileData(BaseModel):
    id: str | None = None
    token: str

@router.post("/profile")
async def profile_post(data: ProfileData, request: Request):
    session_id = request.cookies.get("session")
    if not session_id:
        return {"success": False, "error": "Not Logged In"}

    user = mongo.users.find_one({"_id": ObjectId(session_id)})
    if not user:
        return {"success": False, "error": "Invalid session"}

    if data.token in utility.bots:
        bot = utility.bots[data.token]
    else:
        bot = selfbot.Main()
        if not await bot.validate_token(data.token):
            return {"success": False, "error": "The Token is Invalid"}

        asyncio.create_task(bot.start(data.token, reconnect=True))
        utility.bots[data.token] = bot

    # If id is provided and matches → update
    if data.id:
        profile = mongo.profiles.find_one({"_id": ObjectId(data.id), "userId": user["_id"]})
        if profile:
            mongo.profiles.update_one(
                {"_id": profile["_id"]},
                {"$set": {
                    "token": data.token,
                    "username": bot.user.name,
                }}
            )
            return {"success": True}

    # Otherwise → insert new
    mongo.profiles.insert_one({
        "_id": bot.user.id,
        "userId": user["_id"],
        "token": data.token,
        "username": bot.user.name,
    })
    return {"success": True}



@router.get("/profile")
async def profiles_get(request: Request):
    session_id = request.cookies.get("session")
    if not session_id:
        return {"success": False, "error": "Not logged in"}

    user = mongo.users.find_one({"_id": ObjectId(session_id)})
    if not user:
        return {"success": False, "error": "Invalid session"}

    profiles = mongo.profiles.find({"userId": user["_id"]})
    data = []
    for profile in profiles:
        data.append({
            "id": str(profile["_id"]),
            "username": profile["username"],
        })

    return {"success": True, "items": data}
