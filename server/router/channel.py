import discord
from fastapi import APIRouter, Request
from bson.objectid import ObjectId
from pydantic import BaseModel
import services, selfbot
from session import get_profile_from_request
router = APIRouter()

class ChannelEditData(BaseModel):
    id: str
    linkFilter: bool
    mediaFilter: bool

@router.post("/channel/edit")
async def channel_edit(data: ChannelEditData, request: Request):
    profile = get_profile_from_request(request)
    if not profile:
        return {"success": False, "error": "Invalid Session"}

    # If id is provided and matches → update
    channel = services.channels.find_one({"_id": ObjectId(data.id), "profileId": profile["_id"]})
    if channel:
        services.channels.update_one(
            {"_id": channel["_id"]},
            {"$set": {
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
    profile = get_profile_from_request(request)
    if not profile:
        return {"success": False, "error": "Invalid Session"}

    bot = await selfbot.get_bot(profile["_id"])
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

    services.channels.insert_one({
        "channelId": data.id,
        "profileId": profile["_id"],
        "name": name,
        "cooldown": cooldown,
        "attachmentPerm": attachment_perm,
        "mediaFilter": True,
        "linkFilter": True,
    })

    return {"success": True}



@router.get("/channel")
async def channel_get(request: Request):
    profile = get_profile_from_request(request)
    if not profile:
        return {"success": False, "error": "Invalid Session"}

    channels = services.channels.find({"profileId": profile["_id"]})
    data = []
    for channel in channels:
        data.append({
            "id": str(channel["_id"]),
            "channelId": channel["channelId"],
            "name": channel["name"]
        })

    return {"success": True, "items": data}



@router.get("/channel/{channel_id}")
async def channel_get_one(request: Request, channel_id: str):
    profile = get_profile_from_request(request)
    if not profile:
        return {"success": False, "error": "Invalid Session"}

    channel = services.channels.find_one({
        "profileId": profile["_id"],
        "channelId": channel_id
    })
    if not channel:
        return {"success": False, "error": "Channel not found"}

    data = {
        "id": str(channel["_id"]),
        "name": channel["name"],
        "cooldown": channel["cooldown"],
        "attachmentPerm": channel["attachmentPerm"],
        "mediaFilter": channel["mediaFilter"],
        "linkFilter": channel["linkFilter"],
    }

    return {"success": True, "item": data}

@router.delete("/channel/{channel_id}")
async def channel_delete(request: Request, channel_id: str):
    profile = get_profile_from_request(request)
    if not profile:
        return {"success": False, "error": "Invalid Session"}

    channel = services.channels.find_one({
        "_id": ObjectId(channel_id),
        "profileId": profile["_id"]
    })
    if not channel:
        return {"success": False, "error": "Channel not found"}

    services.channels.delete_one({"_id": channel["_id"]})
    return {"success": True}
