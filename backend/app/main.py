import uuid
import json
import datetime
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, List, Optional
from pydantic import BaseModel, Field
from contextlib import asynccontextmanager
import psycopg2

from app.core.poker_logic import calculate_payoffs
from app.repository.poker_repository import PokerRepository, Hand
from app.db.database import get_db_connection, create_hands_table_if_not_exists

# Define data models for request/response bodies
class HandRequest(BaseModel):
    starting_stacks: Dict[str, int]
    player_names: List[str]
    player_cards: Dict[str, str]
    action_sequence: List[str]
    board_cards: Optional[List[str]] = Field(default_factory=list)
    
class HandResponse(BaseModel):
    id: uuid.UUID
    starting_stacks: Dict[str, int]
    player_names: List[str]
    player_cards: Dict[str, str]
    action_sequence: List[str]
    board_cards: Optional[List[str]]
    payoffs: Dict[str, int]
    created_at: datetime.datetime

class HandHistoryResponse(BaseModel):
    id: uuid.UUID
    starting_stacks: Dict[str, int]
    player_names: List[str]
    player_cards: Dict[str, str]
    action_sequence: List[str]
    board_cards: Optional[List[str]]
    payoffs: Dict[str, int]
    created_at: datetime.datetime


def get_repository():
    """Dependency injection function to get a repository instance."""
    conn = get_db_connection()
    try:
        yield PokerRepository(conn)
    finally:
        conn.close()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # This function runs on application startup
    print("Application starting up, creating hands table...")
    create_hands_table_if_not_exists()
    yield
    # This function runs on application shutdown
    print("Application shutting down.")

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/hands", response_model=HandResponse, status_code=201)
def create_hand(hand_request: HandRequest, repo: PokerRepository = Depends(get_repository)):
    try:
        payoffs = calculate_payoffs(
            starting_stacks=hand_request.starting_stacks,
            action_sequence=hand_request.action_sequence,
            hole_cards=hand_request.player_cards,
            board_cards=hand_request.board_cards,
        )

        new_hand = Hand(
            id=uuid.uuid4(),
            starting_stacks=hand_request.starting_stacks,
            player_names=hand_request.player_names,
            player_cards=hand_request.player_cards,
            action_sequence=hand_request.action_sequence,
            board_cards=hand_request.board_cards,
            payoffs=payoffs,
            created_at=datetime.datetime.now(datetime.timezone.utc),
        )
        
        saved_hand = repo.save_hand(new_hand)
        
        return saved_hand
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/hands", response_model=List[HandHistoryResponse])
def read_hands(repo: PokerRepository = Depends(get_repository)):
    try:
        hands = repo.get_all_hands()
        return hands
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
