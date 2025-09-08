import React from 'react';

interface ActionButtonsProps {
  onAction: (action: string) => void;
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
  playerStack
}) => {
  return (
    <div className="flex space-x-2 mt-4">
      {canCheck && (
        <button
          onClick={() => onAction('check')}
          className="bg-gray-500 text-white px-4 py-2 rounded-md"
        >
          Check
        </button>
      )}
      {canCall && (
        <button
          onClick={() => onAction('call')}
          className="bg-blue-500 text-white px-4 py-2 rounded-md"
        >
          Call (${betToCall})
        </button>
      )}
      <button
        onClick={() => onAction('fold')}
        className="bg-red-500 text-white px-4 py-2 rounded-md"
      >
        Fold
      </button>
      <button
        onClick={() => onAction('bet')}
        className="bg-green-500 text-white px-4 py-2 rounded-md"
      >
        Bet
      </button>
    </div>
  );
};