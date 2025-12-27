from fastapi import APIRouter, Request
from bson.objectid import ObjectId
from pydantic import BaseModel
import mongo

router = APIRouter()

class CompositionData(BaseModel):
    id: str | None = None
    messages: list[str]
    attachments: list[dict]
    randomize: bool
    count: int


@router.post("/composition/submit")
async def composition_submit(data: CompositionData, request: Request):
    session_id = request.cookies.get("session")
    if not session_id:
        return {"success": False, "error": "Not authenticated"}

    user = mongo.users.find_one({"_id": ObjectId(session_id)})
    if not user:
        return {"success": False, "error": "Invalid session"}

    # If id is provided and matches an existing composition → update
    if data.id:
        comp = mongo.compositions.find_one({"_id": ObjectId(data.id), "userId": user["_id"]})
        if comp:
            mongo.compositions.update_one(
                {"_id": comp["_id"]},
                {"$set": {
                    "messages": data.messages,
                    "attachments": data.attachments,
                    "randomize": data.randomize,
                    "count": data.count
                }}
            )
            return {"success": True, "id": str(comp["_id"]), "updated": True}

    # Otherwise → insert new
    new_comp = {
        "userId": user["_id"],
        "messages": data.messages,
        "attachments": data.attachments,
        "randomize": data.randomize,
        "count": data.count
    }
    result = mongo.compositions.insert_one(new_comp)
    return {"success": True, "id": str(result.inserted_id), "created": True}



@router.get("/composition/list")
async def composition_list(request: Request):
    session_id = request.cookies.get("session")
    if not session_id:
        return {"success": False, "error": "Not authenticated"}

    user = mongo.users.find_one({"_id": ObjectId(session_id)})
    if not user:
        return {"success": False, "error": "Invalid session"}

    comps = mongo.compositions.find({"userId": user["_id"]})
    data = []
    for c in comps:
        data.append({
            "id": str(c["_id"]),
            "messages": c.get("messages", []),
            "attachments": c.get("attachments", []),
            "randomize": c.get("randomize", False),
            "count": c.get("count", 1)
        })

    return {"success": True, "items": data}
