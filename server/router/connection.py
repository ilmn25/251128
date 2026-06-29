from fastapi import APIRouter, Request
from bson.objectid import ObjectId
from pydantic import BaseModel
import services, selfbot, discord
from session import get_profile_from_request

router = APIRouter()

class ConnectionData(BaseModel):
    id: str | None = None
    channelId: str
    compositionId: str

class ConnectionBulkData(BaseModel):
    channelIds: list[str] # These can be either ObjectId strings or Discord numeric IDs
    compositionId: str


@router.post("/connection")
async def connection_submit(data: ConnectionData, request: Request):
    profile = get_profile_from_request(request)
    if not profile:
        return {"success": False, "error": "Invalid Session"}

    # If id is provided and matches → update
    if data.id:
        connection = services.connections.find_one({"_id": ObjectId(data.id)})
        if connection:
            services.connections.update_one(
                {"_id": connection["_id"]},
                {"$set": {
                    "channelId": ObjectId(data.channelId),
                    "compositionId": ObjectId(data.compositionId),
                }}
            )
            return {"success": True}

    # Otherwise → insert new
    services.connections.insert_one({
        "profileId": profile["_id"],
        "channelId": ObjectId(data.channelId),
        "compositionId": ObjectId(data.compositionId),
    })
    return {"success": True}


@router.post("/connection/bulk")
async def connection_bulk(data: ConnectionBulkData, request: Request):
    profile = get_profile_from_request(request)
    if not profile:
        return {"success": False, "error": "Invalid Session"}

    bot = await selfbot.get_bot(profile["_id"])
    
    for ch_id in data.channelIds:
        # Check if it's already a registered channel (ObjectId)
        if len(ch_id) == 24: # Primitive ObjectId check
            try:
                channel = services.channels.find_one({"_id": ObjectId(ch_id), "profileId": profile["_id"]})
                if channel:
                    # Check if connection already exists
                    if not services.connections.find_one({"channelId": channel["_id"], "compositionId": ObjectId(data.compositionId)}):
                        services.connections.insert_one({
                            "profileId": profile["_id"],
                            "channelId": channel["_id"],
                            "compositionId": ObjectId(data.compositionId),
                        })
                    continue
            except:
                pass

        # If not ObjectId (or not found), treat as Discord numeric ID
        if bot:
            discord_ch = bot.get_channel(int(ch_id))
            if discord_ch:
                # Find if already registered by Discord ID
                channel = services.channels.find_one({"channelId": ch_id, "profileId": profile["_id"]})
                if not channel:
                    # Register it (logic copied/adapted from channel_new)
                    name = ""
                    guild_id = None
                    cooldown = 0
                    attachment_perm = True

                    if isinstance(discord_ch, discord.TextChannel):
                        name = f"#{discord_ch.name} in {discord_ch.guild.name}"
                        guild_id = str(discord_ch.guild.id)
                        cooldown = discord_ch.slowmode_delay
                        perms = discord_ch.permissions_for(discord_ch.guild.me)
                        attachment_perm = perms.attach_files
                    elif isinstance(discord_ch, discord.VoiceChannel):
                        name = f"#{discord_ch.name} in {discord_ch.guild.name}"
                        guild_id = str(discord_ch.guild.id)
                        perms = discord_ch.permissions_for(discord_ch.guild.me)
                        attachment_perm = perms.attach_files
                    elif isinstance(discord_ch, discord.DMChannel):
                        name = f"@{discord_ch.recipient.name} in DMs"
                        guild_id = "@me"
                    elif isinstance(discord_ch, discord.GroupChannel):
                        name = f"{discord_ch.name} in Group DM"
                        guild_id = "@me"

                    res = services.channels.insert_one({
                        "channelId": ch_id,
                        "profileId": profile["_id"],
                        "name": name,
                        "guildId": guild_id,
                        "cooldown": cooldown,
                        "attachmentPerm": attachment_perm,
                        "mediaFilter": True,
                        "linkFilter": True,
                        "dead": False,
                    })
                    channel_oid = res.inserted_id
                else:
                    channel_oid = channel["_id"]

                # Create connection if not exists
                if not services.connections.find_one({"channelId": channel_oid, "compositionId": ObjectId(data.compositionId)}):
                    services.connections.insert_one({
                        "profileId": profile["_id"],
                        "channelId": channel_oid,
                        "compositionId": ObjectId(data.compositionId),
                    })

    return {"success": True}


@router.get("/connection")
async def connection_list(request: Request):
    profile = get_profile_from_request(request)
    if not profile:
        return {"success": False, "error": "Invalid Session"}

    items = []
    for conn in services.connections.find({"profileId": profile["_id"]}):
        channel = services.channels.find_one({"_id": ObjectId(conn["channelId"])})
        composition = services.compositions.find_one({"_id": ObjectId(conn["compositionId"])})
        items.append({
            "id": str(conn["_id"]),
            "channelId": str(conn["channelId"]),
            "channel": channel["name"],
            "linkFilter": channel.get("linkFilter", True),
            "mediaFilter": channel.get("mediaFilter", True),
            "attachmentPerm": channel.get("attachmentPerm", True),
            "dead": channel.get("dead", False),
            "compositionId": str(conn["compositionId"]),
            "message": composition["messages"][0] if composition["messages"] else "",
            "profileName": profile.get("username", "User"),
            "profileAvatar": profile.get("avatar"),
            "lastSentAt": conn.get("lastSentAt").isoformat() if conn.get("lastSentAt") else None
        })

    return {"success": True, "items": items}

@router.get("/connection/{connection_id}")
async def connection_get_one(request: Request, connection_id: str):
    profile = get_profile_from_request(request)
    if not profile:
        return {"success": False, "error": "Invalid Session"}

    conn = services.connections.find_one({
        "_id": ObjectId(connection_id),
        "profileId": profile["_id"]
    })
    if not conn:
        return {"success": False, "error": "Connection not found"}

    return {
        "success": True,
        "item": {
            "id": str(conn["_id"]),
            "channelId": str(conn["channelId"]),
            "compositionId": str(conn["compositionId"]),
        }
    }

@router.delete("/connection/{connection_id}")
async def connection_delete(request: Request, connection_id: str):
    profile = get_profile_from_request(request)
    if not profile:
        return {"success": False, "error": "Invalid Session"}

    conn = services.connections.find_one({
        "_id": ObjectId(connection_id),
        "profileId": profile["_id"]
    })
    if not conn:
        return {"success": False, "error": "Connection not found"}

    services.connections.delete_one({"_id": conn["_id"]})

    return {"success": True}
