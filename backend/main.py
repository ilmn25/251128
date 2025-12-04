import os, uvicorn
from fastapi import FastAPI
from pathlib import Path
from fastapi.middleware.cors import CORSMiddleware
from starlette.responses import FileResponse
from starlette.staticfiles import StaticFiles

from utility import ROOT
os.makedirs(ROOT, exist_ok=True)
from router import token, channel, message, attachment, task

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(token.router)
app.include_router(channel.router)
app.include_router(message.router)
app.include_router(attachment.router)
app.include_router(task.router)

# ==================== WEBPAGE ====================
BASE_DIR = Path(__file__).resolve().parent
DIST_PATH = BASE_DIR.parent / "web" / "dist"
app.mount("/", StaticFiles(directory=DIST_PATH, html=True), name="frontend")
@app.get("/")
def serve_index():
    return FileResponse(DIST_PATH / "index.html")
# ==================== ENTRY POINT ====================
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
