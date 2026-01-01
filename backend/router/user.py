from fastapi import APIRouter, Request, Response
from passlib.context import CryptContext
from bson.objectid import ObjectId
from pydantic import BaseModel
import mongo

router = APIRouter()

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

class UserCredentials(BaseModel):
    email: str
    password: str

@router.post("/user/register")
async def user_register(data: UserCredentials, response: Response):
    if mongo.users.find_one({"email": data.email}):
        return {"success": False, "error": "User already exists"}

    result = mongo.users.insert_one({"email": data.email, "password": pwd_context.hash(data.password)})

    response.set_cookie("session", str(result.inserted_id), httponly=True, max_age=90000)
    return {"success": True}

@router.post("/user/login")
async def user_login(data: UserCredentials, response: Response):
    if not data.password.strip():
        return {"success": False, "error": "Empty password"}
    user = mongo.users.find_one({"email": data.email})
    if not user or not pwd_context.verify(data.password, user["password"]):
        return {"success": False, "error": "Invalid credentials"}

    response.set_cookie("session", str(user["_id"]), httponly=True, max_age=90000)
    return {"success": True}

@router.get("/user/info")
async def user_info(request: Request):
    session_id = request.cookies.get("session")
    if not session_id:
        return {"success": False, "error": "Not authenticated"}

    user = mongo.users.find_one({"_id": ObjectId(session_id)})
    if not user:
        return {"success": False, "error": "Invalid session"}

    return {"success": True, "email": user["email"], "id": str(user["_id"])}

@router.post("/user/logout")
async def user_logout(response: Response):
    response.delete_cookie("session")
    return {"success": True}
