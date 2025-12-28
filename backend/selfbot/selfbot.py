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
        self.channel_id = None
        self.selected_message = ""
        self.selected_images = []


    async def post(self):
        try:
            channel = await self.fetch_channel(int(self.channel_id))

            files = [
                discord.File(
                    os.path.join(ATTACHMENT_PATH, image),
                    filename=os.path.basename(image)
                )
                for image in self.selected_images
            ]

            await channel.send(
                self.selected_message,
                files=files
            )

            await asyncio.sleep(4)
            return {"success": True}

        except discord.Forbidden:
            return {
                "success": False,
                "error": "forbidden",
                "message": f"No permission in {self.channel_id}"
            }

        except discord.HTTPException as e:
            return {
                "success": False,
                "error": "http_error",
                "message": f"HTTP error in {self.channel_id}",
                "details": str(e)
            }

        except Exception as e:
            return {
                "success": False,
                "error": "unexpected",
                "message": f"Unexpected error in {self.channel_id}",
                "details": str(e)
            }

    async def validate_token(self, token):
        try:
            await self.login(token.strip())
            return True
        except discord.errors.LoginFailure:
            return False

