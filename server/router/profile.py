from bson import ObjectId
from session import get_user_from_request
from fastapi import APIRouter, Request
from pydantic import BaseModel

import services, selfbot, session
router = APIRouter()

class ProfileData(BaseModel):
    accountId: str | None = None
    token: str

@router.post("/profile")
async def profile_post(data: ProfileData, request: Request):
    user = get_user_from_request(request)
    if not user:
        return {"success": False, "error": "Invalid session"}

    bot = selfbot.Main()
    if not await bot.validate_token(data.token):
        return {"success": False, "error": "Invalid token"}

    avatar = str(bot.user.display_avatar.url) if bot.user and bot.user.display_avatar else None

    # If id is provided and matches → update
    if data.accountId:
        profile = services.profiles.find_one({"accountId": data.accountId, "userId": user["_id"]})
        if profile:
            services.profiles.update_one(
                {"_id": profile["_id"]},
                {"$set": {
                    "token": session.cipher.encrypt(data.token.encode()).decode(),
                    "username": bot.user.name,
                    "avatar": avatar
                }}
            )
            return {"success": True}

    # Otherwise → insert new
    services.profiles.insert_one({
        "accountId": str(bot.user.id),
        "userId": user["_id"],
        "token": session.cipher.encrypt(data.token.encode()).decode(),
        "username": bot.user.name,
        "avatar": avatar
    })
    return {"success": True}


@router.get("/profile")
async def profiles_get(request: Request):
    user = get_user_from_request(request)
    if not user:
        return {"success": False, "error": "Invalid session"}

    profiles = list(services.profiles.find({"userId": user["_id"]}))
    profile_ids = [p["_id"] for p in profiles]
    
    # Fetch all channels for all these profiles in one query
    all_channels = list(services.channels.find({"profileId": {"$in": profile_ids}}))
    
    data = []
    for profile in profiles:
        # Filter channels belonging to this profile
        profile_channels = [
            {
                "id": str(ch["_id"]),
                "channelId": ch["channelId"],
                "name": ch["name"]
            }
            for ch in all_channels if ch["profileId"] == profile["_id"]
        ]
        
        data.append({
            "id": str(profile["_id"]),
            "accountId": profile["accountId"],
            "username": profile["username"],
            "avatar": profile.get("avatar"),
            "channels": profile_channels
        })

    return {"success": True, "items": data}

@router.delete("/profile/{profile_id}")
async def profile_delete(request: Request, profile_id: str):
    user = get_user_from_request(request)
    if not user:
        return {"success": False, "error": "Invalid session"}

    # Find the profile belonging to this user (check both internal _id and accountId)
    query = {"userId": user["_id"]}
    try:
        # Try as internal _id first
        query["_id"] = ObjectId(profile_id)
    except:
        # Otherwise treat as accountId (Discord ID)
        query["accountId"] = profile_id

    profile = services.profiles.find_one(query)
    if not profile:
        return {"success": False, "error": "Profile not found"}

    # Delete it
    services.profiles.delete_one({"_id": profile["_id"]})

    return {"success": True}

@router.post("/profile/refresh/{profile_id}")
async def profile_refresh(request: Request, profile_id: str):
    user = session.get_user_from_request(request)
    if not user:
        return {"success": False, "error": "Invalid session"}

    profile = services.profiles.find_one({
        "_id": ObjectId(profile_id),
        "userId": user["_id"]
    })
    if not profile:
        return {"success": False, "error": "Profile not found"}

    token = session.cipher.decrypt(profile["token"].encode()).decode()
    bot = selfbot.Main()
    if not await bot.validate_token(token):
        return {"success": False, "error": "Invalid token"}

    avatar = str(bot.user.display_avatar.url) if bot.user and bot.user.display_avatar else None
    
    services.profiles.update_one(
        {"_id": profile["_id"]},
        {"$set": {
            "username": bot.user.name,
            "avatar": avatar
        }}
    )

    return {
        "success": True, 
        "username": bot.user.name, 
        "avatar": avatar
    }
