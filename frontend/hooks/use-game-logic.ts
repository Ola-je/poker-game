import { useState, useCallback } from "react";

// Card and Player types
type Card = string;
interface Player {
  id: string;
  name: string;
  stack: number;
  cards: Card[];
  betThisRound: number;
  status: "active" | "folded" | "all-in";
}

type BettingRound = "preflop" | "flop" | "turn" | "river" | "showdown";

interface GameState {
  players: Player[];
  communityCards: Card[];
  pot: number;
  currentBet: number;
  currentPlayerIndex: number;
  dealerIndex: number;
  smallBlindIndex: number;
  bigBlindIndex: number;
  bettingRound: BettingRound;
  handOver: boolean;
  gameStarted: boolean;
  winner: Player | null;
}

export const useGameLogic = () => {
  const [state, setState] = useState<GameState>({
    players: [],
    communityCards: [],
    pot: 0,
    currentBet: 0,
    currentPlayerIndex: 0,
    dealerIndex: -1,
    smallBlindIndex: -1,
    bigBlindIndex: -1,
    bettingRound: "preflop",
    handOver: true,
    gameStarted: false,
    winner: null,
  });

  const [log, setLog] = useState<string[]>([]);
  const [handHistory, setHandHistory] = useState<any[]>([]); // <-- Add this

  const addLog = useCallback((message: string) => {
    setLog((prevLog) => [...prevLog, message]);
  }, []);

  const resetHand = useCallback(async (numPlayers: number = 6) => {
    try {
      const res = await fetch("http://localhost:8000/hands", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          players: Array.from({ length: numPlayers }, (_, i) => `Player ${i+1}`),
          stacks: Array(numPlayers).fill(1000),
        }),
      });
      const data = await res.json();
      setState((prev) => ({ ...prev, ...data })); 
      setLog(["New hand started."]);
      setHandHistory((prev) => [...prev, data]); // <-- Save hand in history
    } catch (err) {
      addLog("Error: Could not reset hand.");
    }
  }, [addLog]);

  const handlePlayerAction = useCallback(
    async (action: string, betAmount: number = 0) => {
      try {
        const res = await fetch("http://localhost:8000/hands/1/action", { // Simplified: hand_id=1 for now
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action, betAmount }),
        });
        const data = await res.json();
        setState((prev) => ({ ...prev, ...data }));
        addLog(`Action: ${action}${betAmount ? ` $${betAmount}` : ""}`);
      } catch (err) {
        addLog("Error: Action failed.");
      }
    },
    [addLog]
  );

  return { state, log, handHistory, resetHand, handlePlayerAction };
};
