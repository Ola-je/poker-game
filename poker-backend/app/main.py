import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from app.db.connection import init_db_pool, close_db_pool
from app.api.hands import router as hands_router
from app.api.game import router as game_router  # game endpoints

# Load environment variables from .env
load_dotenv()  # this will load both .env or .env.example if .env exists

# DB and Gemini API key
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/poker_dev")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise RuntimeError("⚠️ GEMINI_API_KEY not set! Please configure it in .env")

app = FastAPI(title="Poker Backend")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # adjust to frontend domain in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup event: initialize DB pool
@app.on_event("startup")
async def on_startup():
    await init_db_pool(DATABASE_URL)
    print("✅ DB pool initialized on startup")

# Shutdown event: close DB pool
@app.on_event("shutdown")
async def on_shutdown():
    await close_db_pool()
    print("✅ DB pool closed on shutdown")

# Include API routers
app.include_router(hands_router, prefix="/hands")
app.include_router(game_router, prefix="/game")
