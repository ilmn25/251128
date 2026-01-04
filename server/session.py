from datetime import datetime, timezone
from bson import ObjectId
from fastapi import Request
import mongo

cipher = None

def get_user_from_request(request: Request):
    session_token = request.cookies.get("session")
    if not session_token:
        return None

    session = mongo.sessions.find_one({"token": session_token})
    if not session or session["expires_at"].replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
        return None

    user = mongo.users.find_one({"_id": session["user_id"]})
    return user

def get_profile_from_request(request: Request):
    user = get_user_from_request(request)
    if not user:
        return None

    profile_id = request.cookies.get("profile")
    if not profile_id:
        return None

    # Verify that the profile belongs to the authenticated user
    profile = mongo.profiles.find_one({
        "_id": ObjectId(profile_id),
        "userId": user["_id"]
    })
    return profile
