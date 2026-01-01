import os
import discord
from discord.ext import commands
import asyncio
from env import ATTACHMENT_PATH

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
            await channel.send(
                message,
                files=[
                    discord.File(
                        os.path.join(ATTACHMENT_PATH, attachment["url"]),
                        filename=os.path.basename(attachment["name"])
                    )
                    for attachment in attachments
                ]
            )

            await asyncio.sleep(4)
            return {"success": True}

        except discord.Forbidden:
            return {
                "success": False,
                "error": "Permission denied",
            }

        except discord.HTTPException as e:
            return {
                "success": False,
                "error": "HTTP error occured",
            }

        except Exception as e:
            return {
                "success": False,
                "error": "Unexpected error occured",
            }

    async def validate_token(self, token):
        try:
            await self.login(token.strip())
            return True
        except discord.errors.LoginFailure:
            return False

