'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ActionButtonsProps {
  onAction: (actionType: string) => void;
  canCheck: boolean;
  canCall: boolean;
  betToCall: number;
}
export function ActionButtons({ onAction, canCheck, canCall, betToCall }: ActionButtonsProps) {
  // Logic to manage bet/raise amount, disabled states, etc.

  return (
    <div className="space-y-2 p-4">
      <div className="flex space-x-2">
        <Button onClick={() => onAction('fold')}>Fold</Button>
        <Button onClick={() => onAction('check')} disabled={!canCheck}>Check</Button>
        <Button onClick={() => onAction('call')} disabled={!canCall}>Call ({betToCall})</Button>
      </div>
      {/* ... Bet/Raise/All-in buttons and amount input ... */}
    </div>
  );
}