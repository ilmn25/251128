from fastapi import APIRouter, Request
from bson.objectid import ObjectId
from pydantic import BaseModel
import mongo
from session import get_user_from_request

router = APIRouter()

class CompositionData(BaseModel):
    compositionId: str | None = None
    messages: list[str]
    attachments: list[dict]
    randomize: bool
    count: int


@router.post("/composition")
async def composition_submit(data: CompositionData, request: Request):
    user = get_user_from_request(request)
    if not user:
        return {"success": False, "error": "Invalid session"}

    # If id is provided and matches → update
    if data.compositionId:
        composition = mongo.compositions.find_one({"_id": ObjectId(data.compositionId), "userId": user["_id"]})
        if composition:
            mongo.compositions.update_one(
                {"_id": composition["_id"]},
                {"$set": {
                    "messages": data.messages,
                    "attachments": data.attachments,
                    "randomize": data.randomize,
                    "count": data.count
                }}
            )
            return {"success": True}

    # Otherwise → insert new
    mongo.compositions.insert_one({
        "userId": user["_id"],
        "messages": data.messages,
        "attachments": data.attachments,
        "randomize": data.randomize,
        "count": data.count
    })
    return {"success": True}



@router.get("/composition")
async def composition_list(request: Request):
    user = get_user_from_request(request)
    if not user:
        return {"success": False, "error": "Invalid session"}

    compositions = mongo.compositions.find({"userId": user["_id"]})
    data = []
    for composition in compositions:
        data.append({
            "compositionId": str(composition["_id"]),
            "message": composition["messages"][0],
            "attachmentCount": len(composition["attachments"]),
            "randomize": composition["randomize"],
            "count": composition["count"]
        })

    return {"success": True, "items": data}



@router.get("/composition/{composition_id}")
async def get_composition(request: Request, composition_id: str):
    user = get_user_from_request(request)
    if not user:
        return {"success": False, "error": "Invalid session"}

    composition = mongo.compositions.find_one({
        "_id": ObjectId(composition_id),
        "userId": user["_id"]
    })

    if not composition:
        return {"success": False, "error": "Composition not found"}

    data = {
        "messages": composition["messages"],
        "attachments": composition["attachments"],
        "randomize": composition["randomize"],
        "count": composition["count"]
    }

    return {"success": True, "item": data}
