import React from 'react';

interface HandHistoryItemProps {
  hand: {
    id: string;
    starting_stacks: { [key: string]: number };
    player_names: string[];
    player_cards: { [key: string]: string };
    action_sequence: string[];
    board_cards: string[];
    payoffs: { [key: string]: number };
  };
}

export const HandHistoryItem: React.FC<HandHistoryItemProps> = ({ hand }) => {
  const formatPayoffs = (payoffs: { [key: string]: number }) => {
    return Object.entries(payoffs)
      .map(([player, payoff]) => `${player}: ${payoff > 0 ? `+${payoff}` : payoff}`)
      .join(', ');
  };

  const formatStacks = (stacks: { [key: string]: number }) => {
    return Object.entries(stacks)
      .map(([player, stack]) => `${player} (${stack})`)
      .join(', ');
  };

  return (
    <div className="bg-gray-100 p-2 rounded-md border border-gray-300">
      <p className="text-sm font-mono break-all mb-1">
        <span className="font-semibold">Hand ID:</span> {hand.id}
      </p>
      <p className="text-sm font-mono mb-1">
        <span className="font-semibold">Starting Stacks:</span> {formatStacks(hand.starting_stacks)}
      </p>
      <p className="text-sm font-mono mb-1">
        <span className="font-semibold">Player Cards:</span> {Object.entries(hand.player_cards).map(([name, cards]) => `${name}: ${cards}`).join(', ')}
      </p>
      <p className="text-sm font-mono mb-1">
        <span className="font-semibold">Action Sequence:</span> {hand.action_sequence.join(', ')}
      </p>
      <p className="text-sm font-mono mb-1">
        <span className="font-semibold">Board Cards:</span> {hand.board_cards.join(', ') || 'N/A'}
      </p>
      <p className="text-sm font-mono">
        <span className="font-semibold">Winnings/Losses:</span> {formatPayoffs(hand.payoffs)}
      </p>
    </div>
  );
};
