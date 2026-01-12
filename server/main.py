import os, uvicorn

import boto3
from cryptography.fernet import Fernet
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

# ==================== DATABASE & ENCRYPTION ====================
import mongo, session
@asynccontextmanager
async def lifespan(app: FastAPI):
    await mongo.connect()

    client = boto3.client("secretsmanager", region_name=os.getenv("AWS_REGION_ID"))
    try:
        fernet_key = client.get_secret_value(SecretId=os.getenv("FERNET_SECRET_ID"))["SecretString"]
    except client.exceptions.ResourceNotFoundException:
        fernet_key = Fernet.generate_key().decode()
        client.create_secret(Name=os.getenv("FERNET_SECRET_ID"), SecretString=fernet_key)

    session.cipher = Fernet(fernet_key.encode())
    yield
    mongo.client.close()

# ==================== API ====================
from router import attachment, user, composition, profile, channel, connection, send
import static

app = FastAPI(lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(attachment.router, prefix="/api")
app.include_router(user.router, prefix="/api")
app.include_router(composition.router, prefix="/api")
app.include_router(profile.router, prefix="/api")
app.include_router(channel.router, prefix="/api")
app.include_router(connection.router, prefix="/api")
app.include_router(send.router, prefix="/api")
app.include_router(static.router)

# ==================== MAIN ====================
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000)
