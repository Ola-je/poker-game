import pytest
from app.services.hand_service import HandService
from app.models import Hand

class FakeRepo:
    def __init__(self):
        self._id = 1
        self.store = {}

    async def create_hand(self, uuid, players, stacks, dealer, sb, bb, big_blind, hole_cards):
        hand = Hand(id=self._id, uuid=uuid, players=players, stacks=stacks, dealer=dealer,
                    sb=sb, bb=bb, big_blind=big_blind, hole_cards=hole_cards, board="", action_history=[])
        self.store[self._id] = hand
        self._id += 1
        return hand

    async def get_hand(self, hand_id):
        return self.store.get(hand_id)

    async def append_action(self, hand_id, action):
        self.store[hand_id].action_history.append(action)

@pytest.mark.asyncio
async def test_start_hand_and_submit_action():
    repo = FakeRepo()
    service = HandService(repo)
    players = ["A","B","C"]
    stacks = [1000,1000,1000]
    hand = await service.start_hand(players, stacks, dealer=0, big_blind=40)
    assert hand is not None
    updated = await service.submit_action(hand.id, {"player_seat":0, "action":"bet", "amount":40})
    got = await repo.get_hand(hand.id)
    assert len(got.action_history) == 1
