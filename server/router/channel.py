import discord, asyncio
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
    dead: bool

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
                "dead": data.dead,
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
        guild_id = str(channel.guild.id)
        cooldown = channel.slowmode_delay
        perms = channel.permissions_for(channel.guild.me)
        attachment_perm = perms.attach_files

    elif isinstance(channel, discord.VoiceChannel):
        name = f"#{channel.name} in {channel.guild.name}"
        guild_id = str(channel.guild.id)
        cooldown = 0
        perms = channel.permissions_for(channel.guild.me)
        attachment_perm = perms.attach_files

    elif isinstance(channel, discord.DMChannel):
        name = f"@{channel.recipient.name} in DMs"
        guild_id = "@me"
        cooldown = 0
        attachment_perm = True

    elif isinstance(channel, discord.GroupChannel):
        name = f"{channel.name} in Group DM"
        guild_id = "@me"
        cooldown = 0
        attachment_perm = True

    else:
        return {"success": False, "error": "Channel invalid"}

    res = services.channels.insert_one({
        "channelId": data.id,
        "profileId": profile["_id"],
        "name": name,
        "guildId": guild_id,
        "cooldown": cooldown,
        "attachmentPerm": attachment_perm,
        "mediaFilter": True,
        "linkFilter": True,
        "dead": False,
    })

    return {"success": True, "id": str(res.inserted_id)}



@router.get("/channel")
async def channel_get(request: Request):
    profile = get_profile_from_request(request)
    if not profile:
        return {"success": False, "error": "Invalid Session"}

    channels = services.channels.find({"profileId": profile["_id"]})
    data = []
    
    bot = await selfbot.get_bot(profile["_id"])
    
    for channel in channels:
        guild_id = channel.get("guildId")
        icon = None
        
        # Fallback for old records or if missing
        if bot:
            if guild_id and guild_id != "@me":
                guild = bot.get_guild(int(guild_id))
                if guild and guild.icon:
                    icon = str(guild.icon.url)
            
            if not guild_id:
                discord_ch = bot.get_channel(int(channel["channelId"]))
                if discord_ch and hasattr(discord_ch, "guild") and discord_ch.guild:
                    guild_id = str(discord_ch.guild.id)
                    if discord_ch.guild.icon:
                        icon = str(discord_ch.guild.icon.url)
                elif discord_ch and isinstance(discord_ch, (discord.DMChannel, discord.GroupChannel)):
                    guild_id = "@me"

        data.append({
            "id": str(channel["_id"]),
            "channelId": channel["channelId"],
            "name": channel["name"],
            "guildId": guild_id,
            "icon": icon,
            "linkFilter": channel.get("linkFilter", True),
            "mediaFilter": channel.get("mediaFilter", True),
            "attachmentPerm": channel.get("attachmentPerm", True),
            "dead": channel.get("dead", False),
        })

    return {"success": True, "items": data}


@router.get("/channel/available")
async def channel_available(request: Request):
    profile = get_profile_from_request(request)
    if not profile:
        return {"success": False, "error": "Invalid Session"}

    bot = await selfbot.get_bot(profile["_id"])
    if not bot:
        return {"success": False, "error": "Bot not found"}

    if not bot.is_ready():
        # Wait up to 5 seconds for bot to be ready
        for _ in range(50):
            if bot.is_ready():
                break
            await asyncio.sleep(0.1)

    guilds = []

    # DMs/Groups
    dms = []
    for channel in bot.private_channels:
        if isinstance(channel, discord.DMChannel):
            name = channel.recipient.name if channel.recipient else "Unknown DM"
            avatar = str(channel.recipient.avatar.url) if channel.recipient and channel.recipient.avatar else None
            dms.append({"id": str(channel.id), "name": name, "icon": avatar})
        elif isinstance(channel, discord.GroupChannel):
            dms.append({"id": str(channel.id), "name": channel.name or "Unnamed Group", "icon": str(channel.icon.url) if channel.icon else None})
    
    # Direct Messages always first
    if dms:
        guilds.append({"id": "dms", "name": "Direct Messages", "channels": dms, "icon": None})

    # Sort guilds by their position in the user's guild list
    # For selfbots, discord.py handles the guild order from the READY payload
    for guild in bot.guilds:
        channels = []
        # Sort channels by position to match Discord's sidebar order
        sorted_channels = sorted(guild.channels, key=lambda c: (c.position, c.id))
        
        for channel in sorted_channels:
            if isinstance(channel, (discord.TextChannel, discord.VoiceChannel, discord.StageChannel)):
                slowmode = 0
                if hasattr(channel, "slowmode_delay"):
                    slowmode = channel.slowmode_delay
                channels.append({
                    "id": str(channel.id), 
                    "name": channel.name,
                    "slowmode": slowmode
                })
        
        if channels:
            guilds.append({
                "id": str(guild.id), 
                "name": guild.name, 
                "channels": channels,
                "memberCount": guild.member_count,
                "icon": str(guild.icon.url) if guild.icon else None
            })

    return {"success": True, "guilds": guilds}


@router.get("/channel/{channel_id}")
async def channel_get_one(request: Request, channel_id: str):
    profile = get_profile_from_request(request)
    if not profile:
        return {"success": False, "error": "Invalid Session"}

    channel = services.channels.find_one({
        "profileId": profile["_id"],
        "_id": ObjectId(channel_id)
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
        "dead": channel.get("dead", False),
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
