import asyncio
import os

from pymongo.mongo_client import MongoClient

client = None
db = None
users = None
compositions = None
profiles = None
channels = None
connections = None
sessions = None
media = None

BASE_DIR = os.path.dirname(__file__)
UPLOADS_DIR = os.getenv("UPLOADS_DIR", os.path.join(BASE_DIR, "static", "uploads"))
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/dev")
MONGO_DB_NAME = os.getenv("MONGO_DB_NAME", "dev")

os.makedirs(UPLOADS_DIR, exist_ok=True)

async def connect():
    global client, db, users, compositions, connections, channels, profiles, sessions, media

    print("MongoDB Connecting")

    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=2000)
    for _ in range(10):
        try:
            client.admin.command("ping")
            break
        except Exception:
            await asyncio.sleep(1)
    else:
        raise RuntimeError(f"Unable to connect to MongoDB at {MONGO_URI}")

    db = client[MONGO_DB_NAME]

    users = db["users"]
    compositions = db["compositions"]
    channels = db["channels"]
    profiles = db["profiles"]
    connections = db["connections"]
    sessions = db["sessions"]
    media = db["media"]

    print("MongoDB Connected")
