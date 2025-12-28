from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
import env

client = None
db = None
users = None
compositions = None
profiles = None
connections = None

async def connect():
    global client, db, users, compositions, connections, profiles

    print("MongoDB Connecting")

    client = MongoClient(env.MONGO_URI, server_api=ServerApi("1"))
    db = client["dev"]

    users = db["users"]
    compositions = db["compositions"]
    profiles = db["profiles"]
    connections = db["connections"]

    print("MongoDB Connected")
