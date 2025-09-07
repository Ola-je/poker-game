from pokerkit import Automation, NoLimitTexasHoldem
from typing import Dict, List, Any, Optional

def _process_action(state: NoLimitTexasHoldem, action: str, board_cards: List[str]):
    """Parses an action string and applies it to the pokerkit state."""
    
    if action == 'f':
        state.fold()
    elif action == 'c' or action == 'x':
        state.check_or_call()
    elif action.startswith('b'):
        amount = int(action[1:])
        state.complete_bet_or_raise_to(amount)
    elif action.startswith('r'):
        amount = int(action[1:])
        state.complete_bet_or_raise_to(amount)
    elif action == 'allin':
        state.complete_bet_or_raise_to(state.stacks[state.actor_index])
    elif action == 'Flop':
        state.deal_board(board_cards[0], board_cards[1], board_cards[2])
    elif action == 'Turn':
        state.deal_board(board_cards[3])
    elif action == 'River':
        state.deal_board(board_cards[4])
    else:
        # For our purposes, we can assume the action is valid.
        # In a real app, you would handle unknown actions.
        pass

def calculate_payoffs(
    starting_stacks: Dict[str, int], 
    action_sequence: List[str], 
    hole_cards: Dict[str, str],
    board_cards: Optional[List[str]] = None,
    small_blind: int = 20,
    big_blind: int = 40
) -> Dict[str, int]:
    """
    Replays a poker hand using pokerkit to calculate final payoffs.
    """
    player_names = list(starting_stacks.keys())
    starting_stack_values = list(starting_stacks.values())
    
    state = NoLimitTexasHoldem.create_state(
        (
            Automation.ANTE_POSTING,
            Automation.BET_COLLECTION,
            Automation.BLIND_OR_STRADDLE_POSTING,
            Automation.HOLE_CARDS_SHOWING_OR_MUCKING,
            Automation.HAND_KILLING,
            Automation.CHIPS_PUSHING,
            Automation.CHIPS_PULLING,
        ),
        False, 
        0, 
        (small_blind, big_blind),
        big_blind, 
        starting_stack_values,
        len(player_names),
    )
    
    try:
        for name, cards in hole_cards.items():
            state.deal_hole(cards)

        board_card_index = 0
        for action in action_sequence:
            if action in ['Flop', 'Turn', 'River']:
                if action == 'Flop':
                    state.deal_board(board_cards[board_card_index], board_cards[board_card_index + 1], board_cards[board_card_index + 2])
                    board_card_index += 3
                elif action == 'Turn':
                    state.deal_board(board_cards[board_card_index])
                    board_card_index += 1
                elif action == 'River':
                    state.deal_board(board_cards[board_card_index])
                    board_card_index += 1
            else:
                # Process betting action
                if action.startswith('b'):
                    amount = int(action[1:])
                    state.complete_bet_or_raise_to(amount)
                elif action.startswith('r'):
                    amount = int(action[1:])
                    state.complete_bet_or_raise_to(amount)
                elif action == 'f':
                    state.fold()
                elif action == 'c' or action == 'x':
                    state.check_or_call()
        
        final_payoffs = dict(zip(player_names, state.payoffs))
        return final_payoffs
    except Exception as e:
        print(f"Error processing action sequence: {e}")
        return {}