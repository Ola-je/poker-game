from fastapi.testclient import TestClient
from app.main import app
client = TestClient(app)

def test_start_hand_api(monkeypatch):
    async def fake_start(*args, **kwargs):
        class DummyHand:
            id = 1
            uuid = "u1"
            hole_cards = {"0":"AhKd", "1":"7c7d"}
        return DummyHand()

    from app.services.hand_service import HandService
    monkeypatch.setattr(HandService, "start_hand", fake_start)

    resp = client.post("/hands", json={"players":["A","B","C"], "stacks":[1000,1000,1000]})
    assert resp.status_code == 201
    data = resp.json()
    assert data["uuid"] == "u1"
