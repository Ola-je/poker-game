import React from 'react';
import { HandHistoryItem } from './hand-history-item';

interface HandHistoryProps {
  history: any[];
}

export const HandHistory: React.FC<HandHistoryProps> = ({ history }) => {
  return (
    <div className="p-4 bg-white rounded-md shadow-md">
      <h2 className="text-xl font-semibold mb-2">Hand History</h2>
      <ul className="space-y-2 max-h-96 overflow-y-auto">
        {history.length > 0 ? (
          history.map((hand, index) => (
            <li key={hand.id || index}>
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
