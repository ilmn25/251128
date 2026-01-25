import io, os, discord, aiohttp ,asyncio
from discord.ext import commands
from bson import ObjectId
import services, session


class Main(commands.Bot):
    def __init__(self):
        super().__init__(
            command_prefix=">",
            self_bot=True,
            help_command=None
        )

    async def post(self, channel_id, attachments, message):
        try:
            channel = await self.fetch_channel(int(channel_id))

            files = []
            async with aiohttp.ClientSession() as session_http:
                for attachment in attachments:
                    url = f"{attachment['url']}"
                    async with session_http.get(url) as resp:
                        if resp.status != 200:
                            raise Exception(f"Failed to fetch {url}")
                        data = await resp.read()
                        files.append(discord.File(io.BytesIO(data), filename=attachment["name"]))

            await channel.send(message, files=files)
            await asyncio.sleep(2)
            return {"success": True}

        except discord.Forbidden:
            return {"success": False, "error": "Permission denied"}
        except discord.HTTPException:
            return {"success": False, "error": "HTTP error occurred"}
        except Exception as e:
            print(e)
            return {"success": False, "error": "Unexpected error occurred"}


    async def validate_token(self, token):
        try:
            await self.login(token.strip())
            return True
        except discord.errors.LoginFailure:
            return False


bots = {}

async def get_bot(profileId):
    if profileId in bots:
        return bots[profileId]
    else:
        profile = services.profiles.find_one({"_id": ObjectId(profileId)})
        if not profile:
            return None
        bot = Main()
        token = session.cipher.decrypt(profile["token"].encode()).decode()
        if not await bot.validate_token(token):
            return None
            # remove profile from cookie and mark as expired
        asyncio.create_task(bot.start(token, reconnect=True))
        bots[profileId] = bot
        return bot
