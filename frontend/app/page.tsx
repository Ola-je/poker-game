'use client';

import { useGameLogic } from '@/hooks/use-game-logic';
import { PlayerSetup } from '@/components/player-setup';
import { ActionButtons } from '@/components/action-buttons';
import { GameLog } from '@/components/game-log';
import { HandHistory } from '@/components/hand-history';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  const { state, log, handHistory, resetHand, handlePlayerAction } = useGameLogic();
  const bigBlind = 40;
  const currentPlayer = state.players[state.currentPlayerIndex];
  const canCheck = currentPlayer ? state.currentBet === currentPlayer.betThisRound : false;
  const canCall = currentPlayer ? state.currentBet > currentPlayer.betThisRound : false;
  const betToCall = currentPlayer ? state.currentBet - currentPlayer.betThisRound : 0;

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      <div className="w-1/4 p-4">
        <GameLog log={log} />
      </div>
      <div className="flex-1 p-4 flex flex-col justify-between">
        <div className="text-center text-4xl font-bold mb-4 text-gray-800">
          Poker Table
        </div>
        
        {/* Community Cards */}
        <div className="text-center my-4">
          <p className="text-gray-600">Community Cards:</p>
          <div className="flex justify-center space-x-2">
            {state.communityCards.map((card, index) => (
              <span key={index} className="text-2xl font-bold border rounded-md p-2 bg-white">
                {card}
              </span>
            ))}
          </div>
        </div>

        {/* Player Info (Simplified) */}
        <div className="text-center my-4">
          <p className="text-gray-600">Current Player: {currentPlayer?.name}</p>
          <p className="text-gray-600">Cards: {currentPlayer?.cards.join(', ') || '??'}</p>
        </div>

        <div className="my-auto text-center text-xl text-gray-600">
          <p>Pot: ${state.pot}</p>
          <p>Current Bet: ${state.currentBet}</p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col items-center">
          <ActionButtons
            onAction={handlePlayerAction}
            canCheck={canCheck}
            canCall={canCall}
            betToCall={betToCall}
            bigBlind={bigBlind}
            playerStack={currentPlayer?.stack || 0}
          />
        </div>
      </div>
      <div className="w-1/4 p-4">
        <PlayerSetup onReset={() => resetHand(6)} />
        <HandHistory history={handHistory} />
      </div>
    </div>
  );
}