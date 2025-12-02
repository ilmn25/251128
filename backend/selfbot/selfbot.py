import os
import discord
from discord.ext import commands
import asyncio
import random

# from temp.data import IMAGE_PATHS, CHANNEL_IDS, MESSAGES
#
# def get_random():
#     return random.choice(MESSAGES)

class Main(commands.Bot):
    def __init__(self):
        super().__init__(
            command_prefix=">",
            self_bot=True,
            help_command=None
        )
    #
    # async def send(self):
    #     for channel_id in CHANNEL_IDS:
    #         print("==================================================================")
    #         channel = self.get_channel(channel_id)
    #         server_name = channel.guild.name if channel.guild else "DM"
    #         if not channel:
    #             print(f"Channel not accessible: {server_name} | {channel_id}")
    #             continue
    #
    #         try:
    #             selected_images = random.sample(IMAGE_PATHS, 9)
    #             files = [discord.File(img_path, filename=os.path.basename(img_path))
    #                      for img_path in selected_images]
    #
    #             names = ", ".join(os.path.basename(p) for p in selected_images)
    #             print(f"Ready to send → {server_name} | #{getattr(channel, 'name', 'DM')} ({channel_id}) | {names}")
    #             print("""
    #             Enter - send
    #             1 - skip
    #             """)
    #
    #             choice = input("> ").strip().lower()
    #
    #             if choice != "":
    #                 print("Skipped.")
    #                 continue
    #
    #             await channel.send(
    #                 get_random(),
    #                 files=files
    #             )
    #
    #             print(f"Sent → {server_name} | #{getattr(channel, 'name', 'DM')} ({channel_id})")
    #             await asyncio.sleep(4)
    #
    #         except discord.Forbidden:
    #             print(f"No permission in {server_name} | {channel_id}")
    #         except discord.HTTPException as e:
    #             print(f"HTTP error {server_name} | {channel_id}: {e}")
    #         except Exception as e:
    #             print(f"Unexpected error {server_name} | {channel_id}: {e}")
