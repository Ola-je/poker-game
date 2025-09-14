from dataclasses import dataclass
from typing import List, Dict, Optional
from datetime import datetime

@dataclass
class Action:
    player_seat: Optional[int]
    action: str
    amount: Optional[int] = None
    meta: Optional[Dict] = None
    ts: Optional[str] = None

@dataclass
class Hand:
    id: Optional[int]
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
    payoffs: Optional[Dict] = None
    created_at: Optional[datetime] = None
