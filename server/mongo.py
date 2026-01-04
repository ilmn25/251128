import os

from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi

client = None
db = None
users = None
compositions = None
profiles = None
channels = None
connections = None
sessions = None

async def connect():
    global client, db, users, compositions, connections, channels, profiles, sessions

    print("MongoDB Connecting")

    client = MongoClient(os.getenv("MONGO_URI"), server_api=ServerApi("1"))
    db = client["dev"]

    users = db["users"]
    compositions = db["compositions"]
    channels = db["channels"]
    profiles = db["profiles"]
    connections = db["connections"]
    sessions = db["sessions"]

    print("MongoDB Connected")
