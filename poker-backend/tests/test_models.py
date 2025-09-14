from app.models import Hand

def test_hand_dataclass_creation():
    h = Hand(
        id=None,
        uuid="abc",
        players=["A","B","C"],
        stacks=[1000,1000,1000],
        dealer=0, sb=1, bb=2, big_blind=40,
        hole_cards={},
        board="",
        action_history=[]
    )
    assert h.uuid == "abc"
    assert len(h.players) == 3
