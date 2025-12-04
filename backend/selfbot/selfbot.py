import os
import discord
from discord.ext import commands
import asyncio
import random
from utility import read, MESSAGE_FILE, CHANNEL_FILE, ATTACHMENT_PATH

class Main(commands.Bot):
    def __init__(self):
        super().__init__(
            command_prefix=">",
            self_bot=True,
            help_command=None
        )

    async def validate_token(self, token):
        try:
            await self.login(token.strip())
            return True
        except discord.errors.LoginFailure:
            return False

    async def begin(self, attachment_count):
        channel_data = await read(CHANNEL_FILE)
        message_data = await read(MESSAGE_FILE)
        attachment_ids = os.listdir(ATTACHMENT_PATH)

        for channel_id in channel_data:
            channel_id = channel_id["id"]
            try:
                channel = await self.fetch_channel(int(channel_id))
                selected_images = random.sample(attachment_ids, attachment_count)
                selected_message = random.choice(message_data)["text"]

                files = [
                    discord.File(
                        os.path.join(ATTACHMENT_PATH, image),
                        filename=os.path.basename(image)
                    )
                    for image in selected_images
                ]
                await channel.send(
                    selected_message,
                    files=files
                )

                await asyncio.sleep(4)

            except discord.Forbidden:
                print(f"No permission in {channel_id}")
            except discord.HTTPException as e:
                print(f"HTTP error {channel_id}: {e}")
            except Exception as e:
                print(f"Unexpected error {channel_id}: {e}")
