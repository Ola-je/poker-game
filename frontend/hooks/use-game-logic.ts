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
  const [handHistory, setHandHistory] = useState<any[]>([]);

  const addLog = useCallback((message: string) => {
    setLog((prevLog) => [...prevLog, message]);
  }, []);

  const resetHand = useCallback(async (numPlayers: number = 6) => {
    try {
      const res = await fetch("http://localhost:8000/hands", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          players: Array.from({ length: numPlayers }, (_, i) => `Player ${i + 1}`),
          stacks: Array(numPlayers).fill(1000),
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Backend error ${res.status}: ${errorText}`);
      }

      const data = await res.json();
      setState((prev) => ({ ...prev, ...data }));
      setLog(["New hand started."]);
      setHandHistory((prev) => [...prev, data]);
    } catch (err: any) {
      addLog(`Error: Could not reset hand. ${err.message || err}`);
    }
  }, [addLog]);

  const handlePlayerAction = useCallback(
    async (action: string, betAmount: number = 0) => {
      try {
        const res = await fetch("http://localhost:8000/hands/1/action", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action, betAmount }),
        });

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`Backend error ${res.status}: ${errorText}`);
        }

        const data = await res.json();
        setState((prev) => ({ ...prev, ...data }));
        addLog(`Action: ${action}${betAmount ? ` $${betAmount}` : ""}`);
      } catch (err: any) {
        addLog(`Error: Action failed. ${err.message || err}`);
      }
    },
    [addLog]
  );

  return { state, log, handHistory, resetHand, handlePlayerAction };
};
