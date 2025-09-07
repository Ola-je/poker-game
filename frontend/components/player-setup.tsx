'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface PlayerSetupProps {
  onReset: (stack: number) => void;
}


export function PlayerSetup({ onReset }: PlayerSetupProps) {
  const [stack, setStack] = useState(1000); // Default stack

  const handleReset = () => {
    // You'll need to pass the stack value to a parent component or a hook
    onReset(stack);
  };

  return (
    <div className="flex items-center space-x-2 p-4">
      <Input
        type="number"
        value={stack}
        onChange={(e) => setStack(Number(e.target.value))}
        placeholder="Starting Stack"
        className="w-[200px]"
      />
      <Button onClick={handleReset}>Reset</Button>
    </div>
  );
}