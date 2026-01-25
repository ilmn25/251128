import os

import boto3
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

AWS_S3_BUCKET_ID = os.getenv("AWS_S3_BUCKET_ID")
AWS_REGION_ID = os.getenv("AWS_REGION_ID")
AWS_S3_BUCKET_URL = f"https://{AWS_S3_BUCKET_ID}.s3.{AWS_REGION_ID}.amazonaws.com/"

async def connect():
    global client, db, users, compositions, connections, channels, profiles, sessions

    print("MongoDB Connecting")

    mongo_uri = boto3.client("secretsmanager", region_name=os.getenv("AWS_REGION_ID")).get_secret_value(SecretId=os.getenv("MONGO_SECRET_ID") )["SecretString"]
    client = MongoClient(mongo_uri, server_api=ServerApi("1"))
    db = client["dev"]

    users = db["users"]
    compositions = db["compositions"]
    channels = db["channels"]
    profiles = db["profiles"]
    connections = db["connections"]
    sessions = db["sessions"]

    print("MongoDB Connected")
