import React from 'react';
import { Button } from './ui/button';

interface PlayerSetupProps {
  onReset: () => void;
}

export const PlayerSetup: React.FC<PlayerSetupProps> = ({ onReset }) => {
  return (
    <div className="p-4 bg-white rounded-md shadow-md text-center">
      <h2 className="text-xl font-semibold mb-2">Game Controls</h2>
      <Button onClick={onReset} className="w-full">
        Start a New Hand
      </Button>
    </div>
  );
};