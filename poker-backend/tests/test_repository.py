import os
import pytest
import asyncpg
import pytest_asyncio
import uuid
from app.repository.hand_repository import HandRepository

DATABASE_URL = os.environ.get("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/poker_dev")

@pytest_asyncio.fixture(autouse=True)
async def clean_hands_table(pool):
    async with pool.acquire() as conn:
        await conn.execute("DELETE FROM hands")
    yield

@pytest_asyncio.fixture
async def pool():
    pool = await asyncpg.create_pool(
        user="postgres",
        password="postgres",
        database="pokerdb_test",
        host="localhost",
        port=5432,
    )
    yield pool
    await pool.close()

@pytest.mark.asyncio
async def test_create_and_get_hand(pool):
    repo = HandRepository(pool)
    hand_uuid = str(uuid.uuid4())  # <-- dynamically generated
    players = ["A","B","C"]
    stacks = [1000,1000,1000]
    hole_cards = {"0":"AhKd", "1":"7c7d", "2":"TsJh"}
    
    hand = await repo.create_hand(
        hand_uuid, players, stacks, dealer=0, sb=1, bb=2, big_blind=40, hole_cards=hole_cards
    )
    
    assert hand.uuid == hand_uuid
    got = await repo.get_hand(hand.id)
    assert got.uuid == hand_uuid
    await repo.append_action(hand.id, {"player_seat": 0, "action":"bet", "amount":40})
    got2 = await repo.get_hand(hand.id)
    assert len(got2.action_history) == 1
