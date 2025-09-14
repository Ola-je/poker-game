from fastapi import APIRouter, HTTPException
from app.schemas import StartHandRequest, ActionRequest
from app.repository.hand_repository import HandRepository
from app.services.hand_service import HandService
from app.db.connection import _pool
from app.utils.deck import make_deck, deal_hole_cards

router = APIRouter(prefix="/game")

# Start a new hand
@router.post("/start-hand")
async def start_hand(req: StartHandRequest):
    repo = HandRepository(_pool)
    svc = HandService(repo)
    stacks = req.stacks or [1000] * len(req.players)
    hand = await svc.start_hand(req.players, stacks, dealer=req.dealer, big_blind=req.big_blind)

    state = {
        "handId": hand.id,
        "players": [{"id": i, "name": p, "stack": stacks[i], "cards": []} for i, p in enumerate(req.players)],
        "communityCards": [],
        "pot": 0,
        "currentBet": 0,
        "currentPlayerIndex": 0,
        "dealerIndex": req.dealer,
        "smallBlindIndex": (req.dealer + 1) % len(req.players),
        "bigBlindIndex": (req.dealer + 2) % len(req.players),
        "bettingRound": "preflop",
        "handOver": False,
        "gameStarted": True,
        "winner": None
    }
    log = ["New hand started."]
    return {"state": state, "log": log}

# Deal hole cards
@router.post("/deal")
async def deal_cards(hand_id: int):
    repo = HandRepository(_pool)
    svc = HandService(repo)
    hand = await repo.get_hand(hand_id)
    if not hand:
        raise HTTPException(404, "Hand not found")

    # Deal cards only if not already dealt
    if not hand.hole_cards:
        hole_cards_list, deck = deal_hole_cards(make_deck(), len(hand.players))
        hole_cards_dict = {str(i): cards for i, cards in enumerate(hole_cards_list)}
        hand.hole_cards = hole_cards_dict
        await repo.update_hole_cards(hand.id, hole_cards_dict)

    state = {
        "handId": hand.id,
        "players": [{"id": i, "name": name, "stack": 0, "cards": hand.hole_cards.get(str(i), [])} 
                    for i, name in enumerate(hand.players)],
        "communityCards": [],
        "pot": 0,
        "currentBet": 0,
        "currentPlayerIndex": 0,
        "bettingRound": "preflop",
        "handOver": False,
        "gameStarted": True,
        "winner": None
    }
    log = ["Hole cards dealt."]
    return {"state": state, "log": log}

# Submit player action
@router.post("/action")
async def submit_action(action_req: ActionRequest):
    repo = HandRepository(_pool)
    svc = HandService(repo)
    updated_hand = await svc.submit_action(action_req.hand_id, action_req.dict())

    state = {
        "handId": updated_hand.id,
        "players": [{"id": i, "name": name, "stack": 0, "cards": updated_hand.hole_cards.get(str(i), [])} 
                    for i, name in enumerate(updated_hand.players)],
        "communityCards": getattr(updated_hand, "community_cards", []),
        "pot": getattr(updated_hand, "pot", 0),
        "currentBet": getattr(updated_hand, "current_bet", 0),
        "currentPlayerIndex": 0,  # implement turn logic later
        "bettingRound": getattr(updated_hand, "betting_round", "preflop"),
        "handOver": getattr(updated_hand, "hand_over", False),
        "gameStarted": True,
        "winner": getattr(updated_hand, "winner", None)
    }
    log = [f"Player action: {action_req.action}"]
    return {"state": state, "log": log}
