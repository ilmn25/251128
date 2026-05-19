import os, uvicorn

from cryptography.fernet import Fernet
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from starlette.staticfiles import StaticFiles

# ==================== DATABASE & ENCRYPTION ====================
import services, session


def load_fernet_key() -> str:
    key = os.getenv("FERNET_KEY")
    if key:
        return key

    key_path = os.getenv("FERNET_KEY_PATH", os.path.join(os.path.dirname(__file__), "data", "fernet.key"))
    key_dir = os.path.dirname(key_path)
    if key_dir:
        os.makedirs(key_dir, exist_ok=True)

    if os.path.exists(key_path):
        with open(key_path, "r", encoding="utf-8") as file:
            return file.read().strip()

    key = Fernet.generate_key().decode()
    with open(key_path, "w", encoding="utf-8") as file:
        file.write(key)
    return key


@asynccontextmanager
async def lifespan(app: FastAPI):
    await services.connect()

    fernet_key = load_fernet_key()
    session.cipher = Fernet(fernet_key.encode())
    yield
    services.client.close()

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

app.mount("/static", StaticFiles(directory=os.path.join(os.path.dirname(__file__), "static")), name="static")
app.include_router(static.router)

# ==================== MAIN ====================
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000)
