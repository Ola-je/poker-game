import React, { useState } from "react";
import { Button } from "./ui/button";

interface ActionButtonsProps {
  onAction: (action: string, betAmount?: number) => void;
  canCheck: boolean;
  canCall: boolean;
  betToCall: number;
  bigBlind: number;
  playerStack: number;
  resetHand: (numPlayers?: number) => void;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  onAction,
  canCheck,
  canCall,
  betToCall,
  bigBlind,
  playerStack,
  resetHand,
}) => {
  const [betAmount, setBetAmount] = useState(bigBlind);

  const buttonColors = {
    fold: "bg-red-600 hover:bg-red-700 text-white",
    call: "bg-yellow-600 hover:bg-yellow-700 text-white",
    bet: "bg-green-600 hover:bg-green-700 text-white",
    allIn: "bg-sky-600 hover:bg-sky-700 text-white",
    reset: "bg-gray-600 hover:bg-gray-700 text-white",
  };

  return (
    <div className="flex flex-wrap justify-center gap-2 mt-4">
      {/* Fold */}
      <Button onClick={() => onAction("fold")} className={buttonColors.fold}>
        Fold
      </Button>

      {/* Call / Check */}
      {canCall ? (
        <Button onClick={() => onAction("call")} className={buttonColors.call}>
          Call ${betToCall}
        </Button>
      ) : canCheck ? (
        <Button onClick={() => onAction("check")} className={buttonColors.call}>
          Check
        </Button>
      ) : null}

      {/* Bet controls */}
      {/* <div className="flex items-center gap-1 bg-gray-800 p-1 rounded-lg"> */}
        <Button
          onClick={() =>
            setBetAmount(Math.max(bigBlind, betAmount - bigBlind))
          }
          className={buttonColors.bet}
        >
          -
        </Button>

        {/* Middle button = bet amount & triggers bet */}
        <Button
          onClick={() => onAction("bet", betAmount)}
          className= {buttonColors.bet}
        >
          ${betAmount}
        </Button>

        <Button
          onClick={() =>
            setBetAmount(Math.min(playerStack, betAmount + bigBlind))
          }
          className={buttonColors.bet}
        >
          +
        </Button>
      {/* </div> */}

      {/* All In */}
      <Button onClick={() => onAction("all-in")} className={buttonColors.allIn}>
        All In
      </Button>

      {/* Reset / Start New Hand */}
      <Button onClick={() => resetHand(6)} className={buttonColors.reset}>
        Start a New Hand
      </Button>
    </div>
  );
};
