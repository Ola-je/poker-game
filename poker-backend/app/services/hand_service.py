import uuid
import datetime
from typing import List, Dict, Any
from app.repository.hand_repository import HandRepository
from app.models import Hand
from app.utils.deck import shuffle_deck, deal_hole_cards
from pokerkit import Automation, NoLimitTexasHoldem

USER_SEAT_INDEX = 0  # first player in list is the user

class HandService:
    def __init__(self, repo: HandRepository):
        self.repo = repo
        self._in_memory_states: Dict[int, Any] = {}  # store PokerKit states

    async def start_hand(
        self, players: List[str], stacks: List[int], dealer: int = 0, big_blind: int = 40
    ) -> Hand:
        n = len(players)
        uuid_str = str(uuid.uuid4())
        deck = shuffle_deck()
        hole_cards_list, deck = deal_hole_cards(deck, n)
        hole_cards = {str(i): hole_cards_list[i] for i in range(n)}

        sb = (dealer + 1) % n
        bb = (dealer + 2) % n

        # Create DB record
        hand = await self.repo.create_hand(uuid_str, players, stacks, dealer, sb, bb, big_blind, hole_cards)

        # Initialize PokerKit state
        state = self._create_poker_state(n, stacks, big_blind)
        for hc in hole_cards_list:
            state.deal_hole(hc)
        state._deck = deck

        self._in_memory_states[hand.id] = state
        return hand

    def _create_poker_state(self, num_players: int, starting_stacks: List[int], big_blind: int):
        automations = (
            Automation.ANTE_POSTING,
            Automation.BET_COLLECTION,
            Automation.BLIND_OR_STRADDLE_POSTING,
            Automation.CARD_BURNING,
            Automation.HOLE_CARDS_SHOWING_OR_MUCKING,
            Automation.HAND_KILLING,
            Automation.CHIPS_PUSHING,
            Automation.CHIPS_PULLING,
        )
        small_blind = big_blind // 2
        state = NoLimitTexasHoldem.create_state(
            automations,
            verbose=False,
            ante=0,
            blinds=(small_blind, big_blind),
            default_bet=big_blind,
            stacks=tuple(starting_stacks),
            num_players=num_players
        )
        return state

    async def submit_action(self, hand_id: int, action: Dict[str, Any]):
        hand = await self.repo.get_hand(hand_id)
        if not hand:
            raise ValueError("Hand not found")

        state = self._in_memory_states.get(hand_id)
        if not state:
            raise ValueError("In-memory state not found")

        # Apply user action
        action_seat = action.get("player_seat", USER_SEAT_INDEX)
        act = action["action"]
        amt = action.get("amount")
        NoLimitTexasHoldem.apply_action(state, action_seat, act, amt)

        # Save user action to DB
        action["ts"] = datetime.datetime.utcnow().isoformat()
        await self.repo.append_action(hand_id, action)

        # Loop through bots until it's the user's turn or hand is over
        while not state.hand_over and state.current_player_index != USER_SEAT_INDEX:
            bot_action = self._choose_bot_action(state)
            NoLimitTexasHoldem.apply_action(
                state, bot_action["player_seat"], bot_action["action"], bot_action.get("amount")
            )
            bot_action["ts"] = datetime.datetime.utcnow().isoformat()
            await self.repo.append_action(hand_id, bot_action)

        # Update DB with current stacks, board, payoffs
        await self.repo.update_stacks(hand_id, list(state.stacks))
        await self.repo.update_board(hand_id, state.board)
        if state.hand_over:
            await self.repo.update_payoffs(hand_id, state.payoffs)

        return await self.repo.get_hand(hand_id)

    def _choose_bot_action(self, state: Any) -> Dict[str, Any]:
        """Simple bot strategy placeholder. Replace this with Gemini LLM later."""
        seat = state.current_player_index
        stack = state.stacks[seat]

        possible_actions = NoLimitTexasHoldem.available_actions(state)
        if "call" in possible_actions:
            return {"player_seat": seat, "action": "call", "amount": state.current_bet}
        elif "check" in possible_actions:
            return {"player_seat": seat, "action": "check"}
        else:
            return {"player_seat": seat, "action": "fold"}
