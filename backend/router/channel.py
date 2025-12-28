import discord
from fastapi import APIRouter, Request
from bson.objectid import ObjectId
from pydantic import BaseModel
import mongo
import utility

router = APIRouter()

class ChannelEditData(BaseModel):
    channelId: str
    linkFilter: bool
    mediaFilter: bool

@router.post("/channel/edit")
async def channel_edit(data: ChannelEditData, request: Request):
    session_id = request.cookies.get("session")
    if not session_id:
        return {"success": False, "error": "Not Logged In"}

    profile_id = request.cookies.get("profile")
    if not profile_id:
        return {"success": False, "error": "Not Logged In"}


    # If id is provided and matches → update
    channel = mongo.channels.find_one({"channelId": data.channelId, "profileId": ObjectId(profile_id)})
    if channel:
        mongo.channels.update_one(
            {"_id": channel["_id"]},
            {"$set": {
                "channelId": data.channelId,
                "linkFilter": data.linkFilter,
                "mediaFilter": data.mediaFilter,
            }}
        )
        return {"success": True}
    return {"success": False, "error": "Channel not registered"}


class ChannelNewData(BaseModel):
    id: str

@router.post("/channel/new")
async def channel_new(data: ChannelNewData  , request: Request):
    session_id = request.cookies.get("session")
    if not session_id:
        return {"success": False, "error": "Not Logged In"}

    profile_id = request.cookies.get("profile")
    if not profile_id:
        return {"success": False, "error": "Invalid Session"}

    bot = await utility.get_bot(profile_id)
    if not bot:
        return {"success": False, "error": "Invalid Session"}

    channel = bot.get_channel(int(data.id))
    if not channel:
        return {"success": False, "error": "Channel not found"}

    if isinstance(channel, discord.TextChannel):
        name = f"#{channel.name} in {channel.guild.name}"
        cooldown = channel.slowmode_delay
        perms = channel.permissions_for(channel.guild.me)
        attachment_perm = perms.attach_files

    elif isinstance(channel, discord.VoiceChannel):
        name = f"#{channel.name} in {channel.guild.name}"
        cooldown = 0
        perms = channel.permissions_for(channel.guild.me)
        attachment_perm = perms.attach_files

    elif isinstance(channel, discord.DMChannel):
        name = f"@{channel.recipient.name} in DMs"
        cooldown = 0
        attachment_perm = True

    elif isinstance(channel, discord.GroupChannel):
        name = f"{channel.name} in Group DM"
        cooldown = 0
        attachment_perm = True

    else:
        return {"success": False, "error": "Channel invalid"}

    mongo.channels.insert_one({
        "channelId": data.id,
        "profileId": ObjectId(profile_id),
        "name": name,
        "cooldown": cooldown,
        "attachmentPerm": attachment_perm,
        "mediaFilter": True,
        "linkFilter": True,
    })

    return {"success": True}



@router.get("/channel")
async def channel_get(request: Request):
    session_id = request.cookies.get("session")
    if not session_id:
        return {"success": False, "error": "Not logged in"}

    profile_id = request.cookies.get("profile")
    if not profile_id:
        return {"success": False, "error": "Invalid Session"}

    channels = mongo.channels.find({"profileId": ObjectId(profile_id)})
    data = []
    for channel in channels:
        data.append({
            "channelId": channel["channelId"],
            "name": channel["name"]
        })

    return {"success": True, "items": data}



@router.get("/channel/{channel_id}")
async def channel_get_one(request: Request, channel_id: str):
    session_id = request.cookies.get("session")
    if not session_id:
        return {"success": False, "error": "Not logged in"}

    profile_id = request.cookies.get("profile")
    if not profile_id:
        return {"success": False, "error": "Invalid Session"}

    channel = mongo.channels.find_one({
        "profileId": ObjectId(profile_id),
        "channelId": channel_id
    })
    if not channel:
        return {"success": False, "error": "Channel not found"}

    data = {
        "channelId": channel["channelId"],
        "name": channel["name"],
        "cooldown": channel["cooldown"],
        "attachmentPerm": channel["attachmentPerm"],
        "mediaFilter": channel["mediaFilter"],
        "linkFilter": channel["linkFilter"],
    }

    return {"success": True, "item": data}

