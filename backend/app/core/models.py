from dataclasses import dataclass
import uuid
from typing import Dict, List, Any

@dataclass
class Hand:
    """
    Represents a single poker hand with all its details.
    """
    uuid: uuid.UUID
    starting_stacks: Dict[str, int]
    player_names: List[str]
    dealer_position: int
    small_blind_position: int
    big_blind_position: int
    player_cards: Dict[str, str]
    action_sequence: List[str]
    board_cards: List[str]
    payoffs: Dict[str, int]
    
    def to_dict(self) -> Dict[str, Any]:
        """
        Converts the dataclass to a dictionary.
        This is necessary for saving the object as a JSONB type in PostgreSQL.
        """
        return {
            "uuid": str(self.uuid),
            "starting_stacks": self.starting_stacks,
            "player_names": self.player_names,
            "dealer_position": self.dealer_position,
            "small_blind_position": self.small_blind_position,
            "big_blind_position": self.big_blind_position,
            "player_cards": self.player_cards,
            "action_sequence": self.action_sequence,
            "board_cards": self.board_cards,
            "payoffs": self.payoffs,
        }