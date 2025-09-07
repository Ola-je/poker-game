import uuid
import datetime
from dataclasses import dataclass
from typing import Dict, List, Any

@dataclass
class Hand:
    id: uuid.UUID
    starting_stacks: Dict[str, int]
    player_names: List[str]
    player_cards: Dict[str, str]
    action_sequence: List[str]
    board_cards: List[str]
    payoffs: Dict[str, int]
    created_at: datetime.datetime

class PokerRepository:
    def __init__(self, conn):
        self.conn = conn

    def save_hand(self, hand: Hand) -> Hand:
        """Saves a Hand object to the database using raw SQL."""
        cursor = self.conn.cursor()
        cursor.execute(
            """
            INSERT INTO hands (id, starting_stacks, player_names, player_cards, action_sequence, board_cards, payoffs)
            VALUES (%s, %s, %s, %s, %s, %s, %s);
            """,
            (
                hand.id,
                hand.starting_stacks,
                hand.player_names,
                hand.player_cards,
                hand.action_sequence,
                hand.board_cards,
                hand.payoffs,
            ),
        )
        self.conn.commit()
        cursor.close()
        return hand

    def get_all_hands(self) -> List[Hand]:
        """Fetches all hands from the database using raw SQL."""
        cursor = self.conn.cursor()
        cursor.execute(
            """
            SELECT id, starting_stacks, player_names, player_cards, action_sequence, board_cards, payoffs, created_at
            FROM hands
            ORDER BY created_at DESC;
            """
        )
        rows = cursor.fetchall()
        cursor.close()
        
        hands = []
        for row in rows:
            hands.append(Hand(
                id=row[0],
                starting_stacks=row[1],
                player_names=row[2],
                player_cards=row[3],
                action_sequence=row[4],
                board_cards=row[5],
                payoffs=row[6],
                created_at=row[7]
            ))
        return hands
