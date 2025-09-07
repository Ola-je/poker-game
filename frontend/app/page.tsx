'use client';

import { useGameLogic } from '@/hooks/use-game-logic';
import { PlayerSetup } from '@/components/player-setup';
import { ActionButtons } from '@/components/action-buttons';
import { GameLog } from '@/components/game-log';
import { HandHistory } from '@/components/hand-history';

export default function HomePage() {
  const { state, log, resetHand, handlePlayerAction } = useGameLogic();

  // Replace comments with valid expressions
  const canCheck = true; // Placeholder for now
  const canCall = true; // Placeholder for now
  const betToCall = 40; // Placeholder for now

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-1/4 p-4">
        {/* Game Log */}
        <GameLog log={log} />
      </div>
      <div className="flex-1 p-4 flex flex-col justify-between">
        {/* Game Area */}
        <div className="text-center text-2xl font-bold">Poker Table</div>
        {/* Player Cards & Community Cards */}
        {/* ... */}
        {/* Action Controls */}
        <div className="flex justify-center">
          <ActionButtons
            onAction={handlePlayerAction}
            canCheck={canCheck}
            canCall={canCall}
            betToCall={betToCall}
          />
        </div>
      </div>
      <div className="w-1/4 p-4">
        {/* Player Setup and Hand History */}
        <PlayerSetup onReset={resetHand} />
        <HandHistory />
      </div>
    </div>
  );
}