from session import get_user_from_request
from fastapi import APIRouter, Request
from pydantic import BaseModel

import mongo, selfbot, session
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

    # If id is provided and matches → update
    if data.accountId:
        print(data.accountId)
        profile = mongo.profiles.find_one({"accountId": data.accountId, "userId": user["_id"]})
        if profile:
            mongo.profiles.update_one(
                {"_id": profile["_id"]},
                {"$set": {
                    "token": session.cipher.encrypt(data.token.encode()).decode(),
                    "username": bot.user.name,
                }}
            )
            return {"success": True}

    # Otherwise → insert new
    mongo.profiles.insert_one({
        "accountId": str(bot.user.id),
        "userId": user["_id"],
        "token": session.cipher.encrypt(data.token.encode()).decode(),
        "username": bot.user.name,
    })
    return {"success": True}


@router.get("/profile")
async def profiles_get(request: Request):
    user = get_user_from_request(request)
    if not user:
        return {"success": False, "error": "Invalid session"}

    profiles = mongo.profiles.find({"userId": user["_id"]})
    data = []
    for profile in profiles:
        data.append({
            "id": str(profile["_id"]),
            "accountId": profile["accountId"],
            "username": profile["username"],
        })

    return {"success": True, "items": data}
