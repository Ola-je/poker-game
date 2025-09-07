// components/game-log.tsx
interface GameLogProps {
  log: string[];
}

export function GameLog({ log }: GameLogProps) {
  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="text-xl font-semibold mb-2">Game Log</h2>
      <div className="h-96 overflow-y-scroll text-sm">
        {log.map((entry, index) => (
          <p key={index}>{entry}</p>
        ))}
      </div>
    </div>
  );
}