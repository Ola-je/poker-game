import React from 'react';

interface GameLogProps {
  log: string[];
}

export const GameLog: React.FC<GameLogProps> = ({ log }) => {
  return (
    <div className="p-4 bg-black rounded-md shadow-md h-full flex flex-col">
      <h2 className="text-xl font-semibold mb-2 text-white">Game Log</h2>
      <div className="flex-1 overflow-y-auto space-y-1 text-sm text-white">
        {log.map((entry, index) => (
          <p key={index}>{entry}</p>
        ))}
      </div>
    </div>
  );
};
