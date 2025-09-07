import { useState, useReducer, useCallback, useEffect } from 'react';
import { produce } from 'immer';

// Define the shape of a Player
export type Player = {
  name: string;
  stack: number;
  cards: string[];
  isFolded: boolean;
  betThisRound: number;
  betTotal: number;
};

// Define the shape of your GameState
export type GameState = {
  players: Player[];
  pot: number;
  currentBet: number;
  currentPlayerIndex: number;
  communityCards: string[];
  actionSequence: string[];
  deck: string[];
  handStarted: boolean;
  handEnded: boolean;
  gameStage: 'preflop' | 'flop' | 'turn' | 'river' | 'showdown';
  lastAggressorIndex: number | null;
};

// Define actions for the reducer
export type GameAction =
  | { type: 'RESET'; players: Player[] }
  | { type: 'DEAL_HOLE_CARDS' }
  | { type: 'DEAL_FLOP' }
  | { type: 'DEAL_TURN' }
  | { type: 'DEAL_RIVER' }
  | { type: 'FOLD' }
  | { type: 'CHECK' }
  | { type: 'CALL' }
  | { type: 'BET'; amount: number }
  | { type: 'RAISE'; amount: number }
  | { type: 'NEXT_PLAYER' }
  | { type: 'END_HAND' }
  | { type: 'ADVANCE_STREET' }
  | { type: 'ADVANCE_STAGE'; stage: GameState['gameStage'] }
  | { type: 'SET_LAST_AGGRESSOR'; playerIndex: number | null };

// Initial state for a new hand
const initialState: GameState = {
  players: [],
  pot: 0,
  currentBet: 0,
  currentPlayerIndex: 0,
  communityCards: [],
  actionSequence: [],
  deck: [],
  handStarted: false,
  handEnded: false,
  gameStage: 'preflop',
  lastAggressorIndex: null,
};

// Card constants for the deck
const suits = ['c', 'd', 'h', 's'];
const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];

function createDeck(): string[] {
  const deck: string[] = [];
  for (const suit of suits) {
    for (const rank of ranks) {
      deck.push(`${rank}${suit}`);
    }
  }
  return deck;
}

function shuffleDeck(deck: string[]): string[] {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

function gameReducer(currentState: GameState, action: GameAction): GameState {
  return produce(currentState, (draft: GameState) => {
    switch (action.type) {
      case 'RESET':
        draft.players = action.players;
        draft.pot = 0;
        draft.currentBet = 0;
        draft.currentPlayerIndex = 0;
        draft.communityCards = [];
        draft.actionSequence = [];
        draft.deck = shuffleDeck(createDeck());
        draft.handStarted = true;
        draft.handEnded = false;
        draft.gameStage = 'preflop';
        draft.lastAggressorIndex = null;
        break;
      case 'DEAL_HOLE_CARDS':
        draft.deck.pop(); // Burn card
        draft.players.forEach(player => {
          player.cards = [draft.deck.pop()!, draft.deck.pop()!];
        });
        break;
      case 'DEAL_FLOP':
        draft.deck.pop(); // Burn card
        draft.communityCards = [draft.deck.pop()!, draft.deck.pop()!, draft.deck.pop()!];
        draft.actionSequence.push('Flop');
        draft.gameStage = 'flop';
        break;
      case 'DEAL_TURN':
        draft.deck.pop(); // Burn card
        draft.communityCards.push(draft.deck.pop()!);
        draft.actionSequence.push('Turn');
        draft.gameStage = 'turn';
        break;
      case 'DEAL_RIVER':
        draft.deck.pop(); // Burn card
        draft.communityCards.push(draft.deck.pop()!);
        draft.actionSequence.push('River');
        draft.gameStage = 'river';
        break;
      case 'FOLD':
        draft.players[draft.currentPlayerIndex].isFolded = true;
        draft.actionSequence.push('f');
        break;
      case 'CHECK':
        draft.actionSequence.push('x');
        break;
      case 'CALL':
        const callAmount = draft.currentBet - draft.players[draft.currentPlayerIndex].betThisRound;
        draft.players[draft.currentPlayerIndex].stack -= callAmount;
        draft.players[draft.currentPlayerIndex].betThisRound += callAmount;
        draft.pot += callAmount;
        draft.actionSequence.push('c');
        break;
      case 'BET':
        const betAmount = action.amount;
        draft.players[draft.currentPlayerIndex].stack -= betAmount;
        draft.players[draft.currentPlayerIndex].betThisRound += betAmount;
        draft.pot += betAmount;
        draft.currentBet = betAmount;
        draft.actionSequence.push(`b${betAmount}`);
        draft.lastAggressorIndex = draft.currentPlayerIndex;
        break;
      case 'RAISE':
        const raiseAmount = action.amount;
        const totalBet = raiseAmount;
        draft.players[draft.currentPlayerIndex].stack -= totalBet;
        draft.players[draft.currentPlayerIndex].betThisRound = totalBet;
        draft.pot += totalBet;
        draft.currentBet = totalBet;
        draft.actionSequence.push(`r${raiseAmount}`);
        draft.lastAggressorIndex = draft.currentPlayerIndex;
        break;
      case 'NEXT_PLAYER':
        let nextPlayerIndex = draft.currentPlayerIndex;
        let activePlayers = draft.players.filter(p => !p.isFolded);
        
        if (activePlayers.length <= 1) {
          draft.handEnded = true;
          return;
        }

        do {
          nextPlayerIndex = (nextPlayerIndex + 1) % draft.players.length;
        } while (draft.players[nextPlayerIndex].isFolded);

        draft.currentPlayerIndex = nextPlayerIndex;
        break;

      case 'ADVANCE_STREET':
        // Reset betting for the new street
        draft.players.forEach(p => p.betThisRound = 0);
        draft.currentBet = 0;
        // The betting starts with the first player after the dealer
        const firstActivePlayerIndex = draft.players.findIndex(p => !p.isFolded);
        draft.currentPlayerIndex = firstActivePlayerIndex !== -1 ? firstActivePlayerIndex : 0;
        draft.lastAggressorIndex = null;
        break;
      case 'ADVANCE_STAGE':
        draft.gameStage = action.stage;
        break;
      case 'SET_LAST_AGGRESSOR':
        draft.lastAggressorIndex = action.playerIndex;
        break;
      case 'END_HAND':
        draft.handEnded = true;
        break;
      default:
        return draft;
    }
    return draft;
  });
}

export function useGameLogic() {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const [log, setLog] = useState<string[]>([]);
  const [handHistory, setHandHistory] = useState<any[]>([]);
  const bigBlind = 40;

  const fetchHandHistory = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:8000/hands');
      if (!response.ok) {
        throw new Error('Failed to fetch hand history');
      }
      const data = await response.json();
      setHandHistory(data);
    } catch (error) {
      console.error('Error fetching hand history:', error);
    }
  }, []);

  const saveHand = useCallback(async () => {
    // Collect all dynamic data from state
    const handData = {
      starting_stacks: state.players.reduce((acc: {[key: string]: number}, player: Player) => ({ ...acc, [player.name]: player.stack }), {}),
      player_names: state.players.map(p => p.name),
      dealer_position: 0,
      small_blind_position: 1,
      big_blind_position: 2,
      player_cards: state.players.reduce((acc: {[key: string]: string}, player: Player) => ({ ...acc, [player.name]: player.cards.join('') }), {}),
      action_sequence: state.actionSequence,
      board_cards: state.communityCards,
    };
    
    try {
      const response = await fetch('http://localhost:8000/hands', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(handData),
      });

      if (!response.ok) {
        throw new Error('Failed to save hand to backend');
      }

      const result = await response.json();
      console.log('Hand saved successfully:', result);
      setLog((prev) => [...prev, 'Hand completed and saved.']);
      fetchHandHistory();
    } catch (error: unknown) {
      let errorMessage = 'An unknown error occurred.';
      if (error instanceof Error) {
        errorMessage = `Error: ${error.message}`;
      } else if (typeof error === 'string') {
        errorMessage = `Error: ${error}`;
      }
      console.error('Error saving hand:', errorMessage);
      setLog((prev) => [...prev, errorMessage]);
    }
  }, [state.actionSequence, state.communityCards, state.players, fetchHandHistory]);

  const resetHand = useCallback((numPlayers: number) => {
    const newPlayers: Player[] = Array.from({ length: numPlayers }, (_, i) => ({
      name: `Player ${i + 1}`,
      stack: 1000,
      cards: [],
      isFolded: false,
      betThisRound: 0,
      betTotal: 0,
    }));
    dispatch({ type: 'RESET', players: newPlayers });
    dispatch({ type: 'DEAL_HOLE_CARDS' });
    setLog(['New hand started.', 'Hole cards dealt.']);
  }, []);

  const simulateOpponentAction = useCallback(() => {
    const currentPlayer = state.players[state.currentPlayerIndex];
    if (currentPlayer.name === "Player 1") {
      // It's the human player's turn, do nothing
      return;
    }

    // Simplified AI logic:
    const randomAction = Math.random();
    if (state.currentBet === currentPlayer.betThisRound) {
      // Check or Bet
      if (randomAction < 0.7) {
        dispatch({ type: 'CHECK' });
        setLog(prev => [...prev, `${currentPlayer.name} checks.`]);
      } else {
        const betAmount = bigBlind;
        dispatch({ type: 'BET', amount: betAmount });
        setLog(prev => [...prev, `${currentPlayer.name} bets ${betAmount}.`]);
      }
    } else {
      // Fold, Call, or Raise
      const betToCall = state.currentBet - currentPlayer.betThisRound;
      if (randomAction < 0.4) {
        dispatch({ type: 'FOLD' });
        setLog(prev => [...prev, `${currentPlayer.name} folds.`]);
      } else if (randomAction < 0.8 || betToCall > currentPlayer.stack) {
        dispatch({ type: 'CALL' });
        setLog(prev => [...prev, `${currentPlayer.name} calls.`]);
      } else {
        const raiseAmount = state.currentBet + bigBlind;
        dispatch({ type: 'RAISE', amount: raiseAmount });
        setLog(prev => [...prev, `${currentPlayer.name} raises to ${raiseAmount}.`]);
      }
    }
    dispatch({ type: 'NEXT_PLAYER' });
  }, [state, dispatch, bigBlind, setLog]);

  const endHandAndAwardPot = useCallback(() => {
    // For now, we'll just log and save the hand.
    // The backend logic to determine the winner and distribute the pot would go here.
    setLog(prev => [...prev, 'All players have acted. Hand has ended.']);
    saveHand();
    dispatch({ type: 'END_HAND' });
  }, [saveHand, dispatch]);

  const advanceStreet = useCallback(() => {
    setLog(prev => [...prev, `Betting round on the ${state.gameStage} is over.`]);
    dispatch({ type: 'ADVANCE_STREET' });
    switch (state.gameStage) {
      case 'preflop':
        dispatch({ type: 'DEAL_FLOP' });
        break;
      case 'flop':
        dispatch({ type: 'DEAL_TURN' });
        break;
      case 'turn':
        dispatch({ type: 'DEAL_RIVER' });
        break;
      case 'river':
        endHandAndAwardPot();
        break;
    }
  }, [state.gameStage, dispatch, endHandAndAwardPot]);

  // The main game loop effect
  useEffect(() => {
    if (!state.handStarted || state.handEnded) return;

    const activePlayers = state.players.filter(p => !p.isFolded);
    const hasBet = activePlayers.some(p => p.betThisRound > 0);
    const allCalled = activePlayers.every(p => p.betThisRound === state.currentBet);

    // End the betting round if all active players have acted and the bet is matched, or all but one player has folded.
    if (activePlayers.length <= 1 || (hasBet && allCalled && state.lastAggressorIndex !== null && state.currentPlayerIndex === state.lastAggressorIndex)) {
        advanceStreet();
    } else if (!hasBet && activePlayers.length > 1 && state.currentPlayerIndex === activePlayers.length -1) {
        advanceStreet();
    } else if (state.players[state.currentPlayerIndex].name !== 'Player 1') {
      // Simulate opponent action
      const timer = setTimeout(() => {
        simulateOpponentAction();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [
    state.currentPlayerIndex,
    state.handEnded,
    state.handStarted,
    state.players,
    state.gameStage,
    state.currentBet,
    state.lastAggressorIndex,
    advanceStreet,
    simulateOpponentAction,
  ]);
  
  const handlePlayerAction = useCallback((actionType: string, amount?: number) => {
    // Only allow actions if the hand is in progress and it's the human player's turn
    if (!state.handStarted || state.handEnded || state.players[state.currentPlayerIndex]?.name !== "Player 1") {
      return;
    }
    
    switch (actionType) {
      case 'fold':
        dispatch({ type: 'FOLD' });
        break;
      case 'call':
        dispatch({ type: 'CALL' });
        break;
      case 'bet':
        if (amount) {
          dispatch({ type: 'BET', amount });
        }
        break;
      case 'raise':
        if (amount) {
          dispatch({ type: 'RAISE', amount });
        }
        break;
      case 'check':
        dispatch({ type: 'CHECK' });
        break;
      default:
        console.warn(`Unknown action type: ${actionType}`);
    }
    
    // Advance to the next player after a human action
    dispatch({ type: 'NEXT_PLAYER' });
  }, [dispatch, state]);

  return { state, log, handHistory, resetHand, handlePlayerAction };
}