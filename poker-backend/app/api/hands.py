from fastapi import APIRouter, HTTPException
from app.schemas import StartHandRequest, ActionRequest, HandResponse
from app.repository.hand_repository import HandRepository
from app.services.hand_service import HandService
from app.db.connection import _pool

router = APIRouter(prefix="/hands")

@router.post("", status_code=201, response_model=HandResponse)
async def start_hand(req: StartHandRequest):
    repo = HandRepository(_pool)
    svc = HandService(repo)
    stacks = req.stacks or [1000]*len(req.players)
    hand = await svc.start_hand(req.players, stacks, dealer=req.dealer, big_blind=req.big_blind)
    return hand

@router.get("/{hand_id}", response_model=HandResponse)
async def get_hand(hand_id: int):
    repo = HandRepository(_pool)
    hand = await repo.get_hand(hand_id)
    if not hand:
        raise HTTPException(404, "Hand not found")
    return hand

@router.post("/{hand_id}/action", response_model=HandResponse)
async def submit_action(hand_id: int, action: ActionRequest):
    repo = HandRepository(_pool)
    svc = HandService(repo)
    updated_hand = await svc.submit_action(hand_id, action.dict())
    return updated_hand
