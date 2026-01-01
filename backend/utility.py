import asyncio
from bson import ObjectId
import mongo
from selfbot import selfbot

bots = {}

async def get_bot(profileId):
    if profileId in bots:
        return bots[profileId]
    else:
        profile = mongo.profiles.find_one({"_id": ObjectId(profileId)})
        if not profile:
            return None
        bot = selfbot.Main()
        token = profile["token"]
        if not await bot.validate_token(token):
            return None
            # remove profile from cookie and mark as expired
        asyncio.create_task(bot.start(token, reconnect=True))
        bots[profileId] = bot
        return bot
