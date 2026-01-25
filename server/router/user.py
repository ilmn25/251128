from session import get_user_from_request
from fastapi import APIRouter, Request, Response
from passlib.context import CryptContext
from pydantic import BaseModel
import services, secrets
from datetime import datetime, timedelta, timezone

router = APIRouter()
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

class UserCredentials(BaseModel):
    email: str
    password: str

@router.post("/user/register")
async def user_register(data: UserCredentials, response: Response):
    if services.users.find_one({"email": data.email}):
        return {"success": False, "error": "User already exists"}

    result = services.users.insert_one({"email": data.email, "password": pwd_context.hash(data.password)})

    response.set_cookie("session", str(result.inserted_id), httponly=True, max_age=90000)
    return {"success": True}


@router.post("/user/login")
async def user_login(data: UserCredentials, response: Response):
    user = services.users.find_one({"email": data.email})
    if not user or not pwd_context.verify(data.password, user["password"]):
        return {"success": False, "error": "Invalid credentials"}

    session = secrets.token_urlsafe(32)
    expires_at = datetime.now(timezone.utc) + timedelta(days=30)

    services.sessions.insert_one({
        "token": session,
        "user_id": user["_id"],
        "expires_at": expires_at
    })

    response.set_cookie("session", session, httponly=True, max_age=2592000)
    return {"success": True}

@router.get("/user/info")
async def user_info(request: Request):
    user = get_user_from_request(request)
    if not user:
        return {"success": False, "error": "Invalid session"}

    return {"success": True, "email": user["email"], "id": str(user["_id"])}

@router.post("/user/logout")
async def user_logout(request: Request, response: Response):
    session_token = request.cookies.get("session")
    if session_token:
        services.sessions.delete_one({"token": session_token})

    response.delete_cookie("session")
    return {"success": True}
