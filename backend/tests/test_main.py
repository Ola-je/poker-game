import pytest
from fastapi.testclient import TestClient
from unittest.mock import MagicMock
from app.main import app, get_repository, HandResponse
from app.repository.poker_repository import Hand
import uuid

# Mock a repository instance to avoid hitting a real database during tests
@pytest.fixture
def mock_repo():
    mock = MagicMock()
    mock.save_hand.return_value = Hand(
        id=uuid.uuid4(),
        starting_stacks={"Player 1": 1000, "Player 2": 1000},
        player_names=["Player 1", "Player 2"],
        player_cards={"Player 1": "AsKd", "Player 2": "2h2s"},
        action_sequence=["b40", "r80", "c80"],
        board_cards=[],
        payoffs={"Player 1": 1200, "Player 2": 800},
        created_at="2024-01-01T12:00:00Z"
    )
    mock.get_all_hands.return_value = [mock.save_hand.return_value]
    app.dependency_overrides[get_repository] = lambda: mock
    yield mock
    app.dependency_overrides.clear()

def test_create_hand(mock_repo):
    """
    Tests the POST /hands endpoint to ensure a new hand is created and saved.
    """
    client = TestClient(app)
    hand_data = {
        "starting_stacks": {"Player 1": 1000, "Player 2": 1000},
        "player_names": ["Player 1", "Player 2"],
        "player_cards": {"Player 1": "AsKd", "Player 2": "2h2s"},
        "action_sequence": ["b40", "r80", "c80"],
        "board_cards": [],
    }
    
    response = client.post("/hands", json=hand_data)
    
    assert response.status_code == 201
    assert "id" in response.json()
    assert response.json()["payoffs"] == {"Player 1": 1200, "Player 2": 800}

    # Verify that the save_hand method was called on the mock repository
    mock_repo.save_hand.assert_called_once()
    
def test_get_hands(mock_repo):
    """
    Tests the GET /hands endpoint to ensure it returns a list of hands.
    """
    client = TestClient(app)
    response = client.get("/hands")
    
    assert response.status_code == 200
    hands = response.json()
    assert isinstance(hands, list)
    assert len(hands) == 1
    assert "id" in hands[0]