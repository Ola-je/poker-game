import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface ActionButtonsProps {
  onAction: (actionType: string, amount?: number) => void;
  canCheck: boolean;
  canCall: boolean;
  betToCall: number;
  bigBlind: number;
  playerStack: number;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  onAction,
  canCheck,
  canCall,
  betToCall,
  bigBlind,
  playerStack,
}) => {
  const [betAmount, setBetAmount] = useState<number>(bigBlind);

  const handleBetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value)) {
      setBetAmount(value);
    }
  };

  const isAllIn = betToCall >= playerStack;

  return (
    <div className="flex items-center space-x-2">
      <Button onClick={() => onAction('fold')}>Fold</Button>
      {canCheck ? (
        <Button onClick={() => onAction('check')}>Check</Button>
      ) : (
        <Button onClick={() => onAction('call')}>
          Call {isAllIn ? '(All-In)' : `$${betToCall}`}
        </Button>
      )}
      <div className="flex space-x-2">
        <Input
          type="number"
          value={betAmount}
          onChange={handleBetChange}
          min={bigBlind}
          max={playerStack}
          step={bigBlind}
          className="w-24"
        />
        <Button onClick={() => onAction('bet', betAmount)}>Bet</Button>
      </div>
      <Button onClick={() => onAction('raise', betToCall * 2)}>Raise</Button>
    </div>
  );
};