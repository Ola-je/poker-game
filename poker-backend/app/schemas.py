from pydantic import BaseModel
from typing import List, Optional, Dict

class StartHandRequest(BaseModel):
    players: List[str]
    stacks: Optional[List[int]] = None
    dealer: Optional[int] = 0
    big_blind: Optional[int] = 40

class ActionRequest(BaseModel):
    hand_id: int
    player_seat: Optional[int] = None
    action: str
    amount: Optional[int] = None
    meta: Optional[dict] = None

class HandResponse(BaseModel):
    id: int
    uuid: str
    players: List[str]
    stacks: List[int]
    dealer: int
    sb: int
    bb: int
    big_blind: int
    hole_cards: Dict[str, str]
    board: str
    action_history: List[Dict]
    payoffs: Optional[Dict[int,int]] = None
    created_at: Optional[str] = None
