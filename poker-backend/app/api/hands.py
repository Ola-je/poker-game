from fastapi import APIRouter, HTTPException, Depends
from app.schemas import StartHandRequest, ActionRequest, HandResponse
from app.repository.hand_repository import HandRepository
from app.services.hand_service import HandService
from app.db.connection import get_db_pool

router = APIRouter()

# Dependency to get HandService after DB pool is ready
async def get_hand_service() -> HandService:
    pool = get_db_pool()  # raises error if pool not initialized
    repo = HandRepository(pool)
    return HandService(repo)

@router.post("/hands", status_code=201, response_model=HandResponse)
async def start_hand(req: StartHandRequest, svc: HandService = Depends(get_hand_service)):
    stacks = req.stacks or [1000]*len(req.players)
    hand = await svc.start_hand(req.players, stacks, dealer=req.dealer, big_blind=req.big_blind)
    return hand

@router.get("/hands/{hand_id}", response_model=HandResponse)
async def get_hand(hand_id: int, svc: HandService = Depends(get_hand_service)):
    hand = await svc.repo.get_hand(hand_id)
    if not hand:
        raise HTTPException(404, "Hand not found")
    return hand

@router.post("/hands/{hand_id}/action", response_model=HandResponse)
async def submit_action(hand_id: int, action: ActionRequest, svc: HandService = Depends(get_hand_service)):
    updated_hand = await svc.submit_action(hand_id, action.dict())
    return updated_hand
