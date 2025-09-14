import React from 'react';
import { HandHistoryItem } from '@/components/hand-history-item';

// Define a proper Hand interface to replace 'any'
interface Hand {
  id: string;
  starting_stacks: { [key: string]: number };
  player_names: string[];
  player_cards: { [key: string]: string };
  action_sequence: string[];
  board_cards: string[];
  payoffs: { [key: string]: number };
}

interface HandHistoryProps {
  history: Hand[];
}

export const HandHistory: React.FC<HandHistoryProps> = ({ history }) => {
  return (
    <div className="p-4 bg-black rounded-md shadow-md">
      <h2 className="text-xl font-semibold mb-2">Hand History</h2>
      <ul className="space-y-2 max-h-96 overflow-y-auto">
        {history.length > 0 ? (
          history.map((hand) => (
            <li key={hand.id}>
              <HandHistoryItem hand={hand} />
            </li>
          ))
        ) : (
          <p>No hands saved yet.</p>
        )}
      </ul>
    </div>
  );
};