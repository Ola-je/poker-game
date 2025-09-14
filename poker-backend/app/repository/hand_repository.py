import json
from typing import List, Optional, Dict, Any
import asyncpg
from app.models import Hand
from app.db.connection import get_db_pool


class HandRepository:
    def __init__(self, pool: asyncpg.pool.Pool):
        # Use the pool passed in instead of always calling get_db_pool()
        self.pool = pool

    async def create_hand(
        self,
        uuid: str,
        players: List[str],
        stacks: List[int],
        dealer: int,
        sb: int,
        bb: int,
        big_blind: int,
        hole_cards: Dict[str, str]
    ) -> Hand:
        async with self.pool.acquire() as conn:
            row = await conn.fetchrow(
                """
                INSERT INTO hands (
                    uuid, players, stacks, dealer, sb, bb, big_blind, hole_cards, board, action_history
                )
                VALUES (
                    $1, $2::jsonb, $3::jsonb, $4, $5, $6, $7, $8::jsonb, $9::jsonb, $10::jsonb
                )
                RETURNING
                    id, uuid, players, stacks, dealer, sb, bb, big_blind,
                    hole_cards, board, action_history, payoffs, created_at
                """,
                uuid,
                json.dumps(players),       # JSON encode list
                json.dumps(stacks),        # JSON encode list
                dealer,
                sb,
                bb,
                big_blind,
                json.dumps(hole_cards),    # JSON encode dict
                json.dumps([]),            # board should start as empty JSON array
                json.dumps([])             # action_history should start as empty JSON array
            )
            return self._row_to_hand(row)

    async def get_hand(self, hand_id: int) -> Optional[Hand]:
        async with self.pool.acquire() as conn:
            row = await conn.fetchrow(
                """
                SELECT
                    id, uuid, players, stacks, dealer, sb, bb, big_blind,
                    hole_cards, board, action_history, payoffs, created_at
                FROM hands
                WHERE id = $1
                """,
                hand_id
            )
            return self._row_to_hand(row) if row else None

    async def append_action(self, hand_id: int, action: Dict[str, Any]):
        async with self.pool.acquire() as conn:
            async with conn.transaction():
                # fetch current actions
                row = await conn.fetchrow(
                    "SELECT action_history FROM hands WHERE id = $1 FOR UPDATE", hand_id
                )
                actions = row["action_history"] or []

                # parse if it's accidentally a string
                if isinstance(actions, str):
                    actions = json.loads(actions)

                # append new action
                actions.append(action)

                # save back to DB
                await conn.execute(
                    "UPDATE hands SET action_history = $1::jsonb WHERE id = $2",
                    json.dumps(actions),
                    hand_id
                )

    async def update_board(self, hand_id: int, board_str: str):
        """Update board with a JSON array of community cards."""
        async with self.pool.acquire() as conn:
            await conn.execute(
                "UPDATE hands SET board = $1::jsonb WHERE id = $2",
                json.dumps(board_str if isinstance(board_str, list) else []),
                hand_id
            )

    async def update_payoffs(self, hand_id: int, payoffs: Dict[int, int]):
        async with self.pool.acquire() as conn:
            await conn.execute(
                "UPDATE hands SET payoffs = $1::jsonb WHERE id = $2",
                json.dumps(payoffs),
                hand_id
            )

    async def update_hole_cards(self, hand_id: int, hole_cards: Dict[str, str]):
        async with self.pool.acquire() as conn:
            await conn.execute(
                "UPDATE hands SET hole_cards = $1::jsonb WHERE id = $2",
                json.dumps(hole_cards),
                hand_id
            )

    def _row_to_hand(self, row) -> Hand:
        if row is None:
            return None
        return Hand(
            id=row["id"],
            uuid=row["uuid"],
            players=json.loads(row["players"]) if isinstance(row["players"], str) else row["players"],
            stacks=json.loads(row["stacks"]) if isinstance(row["stacks"], str) else row["stacks"],
            dealer=row["dealer"],
            sb=row["sb"],
            bb=row["bb"],
            big_blind=row["big_blind"],
            hole_cards=json.loads(row["hole_cards"]) if isinstance(row["hole_cards"], str) else row["hole_cards"],
            board=json.loads(row["board"]) if isinstance(row["board"], str) else row["board"],
            action_history=json.loads(row["action_history"]) if isinstance(row["action_history"], str) else row["action_history"],
            payoffs=row["payoffs"],
            created_at=row["created_at"]
        )

    async def update_stacks(self, hand_id: int, stacks: List[int]):
        async with self.pool.acquire() as conn:
            await conn.execute(
                "UPDATE hands SET stacks = $1::jsonb WHERE id = $2",
                json.dumps(stacks),
                hand_id
            )
