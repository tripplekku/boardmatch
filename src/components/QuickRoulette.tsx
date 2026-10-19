import React, { useState } from 'react';
import { Dices, Sparkles, RotateCcw, ArrowUpRight, Users, Clock, Star } from 'lucide-react';
import { BoardGame } from '../types/game';
import { playDiceClick, playSuccessChime } from '../utils/sound';

interface QuickRouletteProps {
  games: BoardGame[];
  onOpenDetails: (game: BoardGame) => void;
}

export const QuickRoulette: React.FC<QuickRouletteProps> = ({
  games,
  onOpenDetails,
}) => {
  const [playerCount, setPlayerCount] = useState<number | 'any'>('any');
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedGame, setSelectedGame] = useState<BoardGame | null>(null);

  const eligibleGames = games.filter(g => {
    if (playerCount === 'any') return true;
    return playerCount >= g.minPlayers && playerCount <= g.maxPlayers;
  });

  const handleSpin = () => {
    if (eligibleGames.length === 0 || isSpinning) return;
    setIsSpinning(true);
    setSelectedGame(null);

    let counter = 0;
    const maxCycles = 18;
    const interval = setInterval(() => {
      counter++;
      playDiceClick();
      const randomIndex = Math.floor(Math.random() * eligibleGames.length);
      setSelectedGame(eligibleGames[randomIndex]);

      if (counter >= maxCycles) {
        clearInterval(interval);
        setIsSpinning(false);
        playSuccessChime();
      }
    }, 90);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
          <Dices className="w-3.5 h-3.5" />
          <span>Швидкий вибір для компанії</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Ігрова рулетка: не знаєте, що обрати?
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
          Дозвольте випадку обрати настілку для вашого вечора. Вкажіть склад гравців і натисніть кнопку жеребу!
        </p>
      </div>

      {/* Settings bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-300 font-medium">Склад гравців:</span>
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            {['any', 2, 3, 4, 5, 6].map(count => (
              <button
                key={count}
                onClick={() => {
                  playDiceClick();
                  setPlayerCount(count as any);
                }}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  playerCount === count
                    ? 'bg-amber-400 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {count === 'any' ? 'Будь-який' : `${count}`}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleSpin}
          disabled={isSpinning || eligibleGames.length === 0}
          className="w-full sm:w-auto px-6 py-2.5 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 font-semibold text-xs rounded-lg transition-all shadow-md shadow-amber-500/10 flex items-center justify-center gap-2 active:scale-95"
        >
          <Dices className={`w-4 h-4 ${isSpinning ? 'animate-spin' : ''}`} />
          <span>{isSpinning ? 'Обираємо настілку...' : 'Кинути жереб!'}</span>
        </button>
      </div>

      {/* Roulette Result Showcase */}
      {selectedGame && (
        <div
          className={`bg-slate-900 border ${
            isSpinning ? 'border-slate-800 opacity-70' : 'border-amber-500/50 shadow-2xl shadow-amber-500/10'
          } rounded-2xl p-6 sm:p-8 transition-all duration-200`}
        >
          <div className="flex flex-col sm:flex-row gap-6 items-center">
            <div className="w-48 aspect-[4/3] rounded-xl overflow-hidden bg-slate-800 shrink-0">
              <img
                src={selectedGame.imageUrl}
                alt={selectedGame.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex-1 text-center sm:text-left space-y-3">
              <div>
                {!isSpinning && (
                  <div className="text-xs text-amber-400 font-semibold mb-1 flex items-center justify-center sm:justify-start gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Вибір рулетки для сьогоднішнього вечора!</span>
                  </div>
                )}
                <h2 className="text-2xl font-bold text-white tracking-tight">
                  {selectedGame.title}
                </h2>
                {selectedGame.originalTitle && (
                  <p className="text-xs text-slate-400">{selectedGame.originalTitle}</p>
                )}
              </div>

              {/* Unboxed Metadata */}
              <div className="flex items-center justify-center sm:justify-start flex-wrap gap-2 text-xs text-slate-300">
                <div className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-mono tabular-nums">{selectedGame.minPlayers}–{selectedGame.maxPlayers} гравців</span>
                </div>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-mono tabular-nums">{selectedGame.minPlaytime}–{selectedGame.maxPlaytime} хв</span>
                </div>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <div className="flex items-center gap-1 text-amber-400 font-mono">
                  <Star className="w-3 h-3 fill-amber-400" />
                  <span>{selectedGame.rating.toFixed(1)}</span>
                </div>
              </div>

              <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                {selectedGame.description}
              </p>

              {!isSpinning && (
                <div className="flex items-center justify-center sm:justify-start gap-3 pt-2">
                  <button
                    onClick={() => onOpenDetails(selectedGame)}
                    className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold text-xs rounded-lg transition-colors flex items-center gap-1"
                  >
                    <span>Відкрити опис і правила</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={handleSpin}
                    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition-colors flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Спробувати ще раз</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
