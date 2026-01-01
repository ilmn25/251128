import os, uvicorn
from fastapi import FastAPI
from pathlib import Path
from fastapi.middleware.cors import CORSMiddleware
from starlette.responses import FileResponse
from starlette.staticfiles import StaticFiles
from contextlib import asynccontextmanager

from env import ROOT
os.makedirs(ROOT, exist_ok=True)

# ==================== DATABASE ====================
import mongo
@asynccontextmanager
async def lifespan(app: FastAPI):
    await mongo.connect()
    yield
    mongo.client.close()

# ==================== API ====================
from router import attachment, user, composition, profile, channel, connection, send
app = FastAPI(lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(attachment.router)
app.include_router(user.router)
app.include_router(composition.router)
app.include_router(profile.router)
app.include_router(channel.router)
app.include_router(connection.router)
app.include_router(send.router)

# ==================== WEBPAGE ====================

BASE_DIR = Path(__file__).resolve().parent
DIST_PATH = BASE_DIR.parent / "web" / "dist"
app.mount("/", StaticFiles(directory=DIST_PATH, html=True), name="frontend")
@app.get("/")
def serve_index():
    return FileResponse(DIST_PATH / "index.html")

# ==================== MAIN ====================
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
