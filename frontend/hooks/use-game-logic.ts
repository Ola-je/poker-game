import { useState, useReducer, useEffect } from 'react';

// Define the shape of your game state (more details will be added here)
export type GameState = {
  players: any[]; // You'll create a Player type later
  pot: number;
  currentBet: number;
  currentPlayerIndex: number;
  communityCards: string[]; // e.g., ['Ac', '7d', '2s']
  // ... other state properties like dealer, blinds, etc.
};

// Define actions for the reducer
export type GameAction =
  | { type: 'RESET'; initialStacks: number }
  | { type: 'FOLD' }
  | { type: 'CALL' }
  | { type: 'BET'; amount: number }
  | { type: 'RAISE'; amount: number }
  | { type: 'ALL_IN' }
  | { type: 'NEXT_PLAYER' }
  | { type: 'DEAL_FLOP'; cards: string[] }
  | { type: 'DEAL_TURN'; card: string }
  | { type: 'DEAL_RIVER'; card: string }
  | { type: 'END_HAND' };

// Initial state for a new hand
const initialState: GameState = {
  players: [],
  pot: 0,
  currentBet: 0,
  currentPlayerIndex: 0,
  communityCards: [],
};

// The custom hook
export function useGameLogic() {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const [log, setLog] = useState<string[]>([]);
  const [isHandInProgress, setIsHandInProgress] = useState(false);

  // A local, internal function to handle API calls
  const saveHand = async (handData: any) => {
    try {
      const response = await fetch('http://localhost:8000/hands', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(handData),
      });

      if (!response.ok) {
        throw new Error('Failed to save hand');
      }

      const result = await response.json();
      console.log('Hand saved successfully:', result);

      // You can update the log or a state variable to signal that the hand is over
      setLog((prev) => [...prev, 'Hand completed and saved.']);

    } catch (error) {
      console.error('Error saving hand:', error);
    }
  };

  // The reducer logic
  function gameReducer(currentState: GameState, action: GameAction): GameState {
    switch (action.type) {
      case 'RESET':
        // Logic to create 6 new players with initialStacks, deal cards, and reset the state
        setLog([]); // Clear log on reset
        setIsHandInProgress(true);
        return {
          ...initialState,
          players: [], // Create player objects with initialStacks
          // ... deal initial cards and set dealer/blinds
        };
      case 'FOLD':
        // Logic to update player status and log the action
        setLog((prev) => [...prev, `Player ${currentState.currentPlayerIndex} folds.`]);
        return { ...currentState, /* update player status */ };
      case 'CALL':
        // Logic to update pot and player stack
        setLog((prev) => [...prev, `Player ${currentState.currentPlayerIndex} calls.`]);
        return { ...currentState, /* update pot and stack */ };
      case 'BET':
        // Logic to update pot, currentBet, and player stack
        setLog((prev) => [...prev, `Player ${currentState.currentPlayerIndex} bets ${action.amount}.`]);
        return { ...currentState, /* update pot and stack */ };
      // ... handle other actions (RAISE, ALL_IN, etc.)
      case 'END_HAND':
        // Logic to determine winner and then call the saveHand function
        // You'll need to prepare the handData object here
        saveHand(currentState);
        setIsHandInProgress(false);
        return { ...currentState, /* e.g., set status to 'complete' */ };
      default:
        return currentState;
    }
  }

  // Exposed functions for the components to use
  const resetHand = (initialStacks: number) => {
    dispatch({ type: 'RESET', initialStacks });
  };

  const handlePlayerAction = (actionType: string, amount?: number) => {
    // A mapping from string actions to reducer actions
    if (actionType === 'fold') {
      dispatch({ type: 'FOLD' });
    } else if (actionType === 'call') {
      dispatch({ type: 'CALL' });
    } else if (actionType === 'bet' && amount !== undefined) {
      dispatch({ type: 'BET', amount });
    }
  };
  
  return { state, log, resetHand, handlePlayerAction };
}