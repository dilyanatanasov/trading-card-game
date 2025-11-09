interface DeckDisplayProps {
  deckSize: number;
  label: string;
  isOpponent?: boolean;
}

export default function DeckDisplay({ deckSize, label, isOpponent = false }: DeckDisplayProps) {
  return (
    <div className="flex flex-col items-center">
      <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
        {label}
      </div>
      <div className="relative w-16 h-24">
        {/* Card back design */}
        <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-purple-600 via-purple-700 to-purple-900 dark:from-purple-700 dark:via-purple-800 dark:to-purple-950 border-4 border-purple-400 dark:border-purple-600 shadow-lg flex flex-col items-center justify-center">
          {/* Decorative pattern */}
          <div className="absolute inset-2 border-2 border-purple-300 dark:border-purple-500 rounded opacity-50"></div>
          <div className="absolute inset-4 border border-purple-200 dark:border-purple-400 rounded opacity-30"></div>

          {/* Center symbol */}
          <div className="relative z-10 text-3xl text-purple-200 dark:text-purple-300 font-bold">
            ⚔️
          </div>

          {/* Deck count */}
          <div className="relative z-10 mt-1 text-xs font-bold text-white bg-purple-800/80 dark:bg-purple-900/80 px-2 py-0.5 rounded">
            {deckSize}
          </div>
        </div>

        {/* Stacked card effect */}
        {deckSize > 0 && (
          <>
            <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-purple-600 via-purple-700 to-purple-900 border-4 border-purple-400 dark:border-purple-600 transform translate-x-0.5 translate-y-0.5 -z-10 opacity-80"></div>
            {deckSize > 1 && (
              <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-purple-600 via-purple-700 to-purple-900 border-4 border-purple-400 dark:border-purple-600 transform translate-x-1 translate-y-1 -z-20 opacity-60"></div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
