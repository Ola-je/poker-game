'use client';

import { useGameLogic } from '@/hooks/use-game-logic';
import { PlayerSetup } from '@/components/player-setup';
import { ActionButtons } from '@/components/action-buttons';
import { GameLog } from '@/components/game-log';
import { HandHistory } from '@/components/hand-history';

export default function HomePage() {
  const {
    state,
    log,
    handHistory,
    resetHand,
    handlePlayerAction,
  } = useGameLogic();

  const bigBlind = 40;
  const currentPlayer = state.players[state.currentPlayerIndex];

  const canCheck = currentPlayer
    ? state.currentBet === currentPlayer.betThisRound
    : false;
  const canCall = currentPlayer
    ? state.currentBet > currentPlayer.betThisRound
    : false;
  const betToCall = currentPlayer
    ? state.currentBet - currentPlayer.betThisRound
    : 0;

  return (
    <div className="flex h-screen bg-black font-sans text-white">
      {/* Left Panel: Game Log */}
      <div className="w-1/4 p-4 bg-black">
        <GameLog log={log} />
      </div>

      {/* Center Panel: Poker Table */}
      <div className="flex-1 p-4 flex flex-col justify-between bg-black">
        <div className="text-center text-4xl font-bold mb-4">
          Poker Table
        </div>

        {/* Community Cards */}
        <div className="text-center my-4">
          <p className="text-gray-300">Community Cards:</p>
          <div className="flex justify-center space-x-2">
            {state.communityCards.map((card, index) => (
              <span
                key={index}
                className="text-2xl font-bold border rounded-md p-2 bg-gray-800"
              >
                {card}
              </span>
            ))}
          </div>
        </div>

        {/* Current Player Info */}
        <div className="text-center my-4">
          <p className="text-gray-300">
            Current Player: {currentPlayer?.name || 'N/A'}
          </p>
          <p className="text-gray-300">
            User Cards:{' '}
            {currentPlayer?.cards.length
              ? currentPlayer.cards.join(', ')
              : '??'}
          </p>
        </div>

        {/* Pot & Current Bet */}
        <div className="my-auto text-center text-xl">
          <p>
            Pot: <span className="font-bold">${state.pot}</span>
          </p>
          <p>
            Current Bet:{' '}
            <span className="font-bold">${state.currentBet}</span>
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col items-center mt-6">
          <ActionButtons
            onAction={handlePlayerAction}
            canCheck={canCheck}
            canCall={canCall}
            betToCall={betToCall}
            bigBlind={bigBlind}
            playerStack={currentPlayer?.stack || 0}
            resetHand={resetHand}
          />
        </div>
      </div>

      {/* Right Panel: Player Setup & Hand History */}
      <div className="w-1/4 p-4 bg-black">
        {/* <PlayerSetup onReset={() => resetHand(6)} /> */}
        <HandHistory history={handHistory} />
      </div>
    </div>
  );
}
