import React from 'react';
import { Bookmark, Sparkles, Compass } from 'lucide-react';
import { BoardGame } from '../types/game';
import { GameCard } from './GameCard';

interface FavoritesViewProps {
  favorites: string[];
  allGames: BoardGame[];
  onToggleFavorite: (gameId: string) => void;
  onOpenDetails: (game: BoardGame) => void;
  onNavigateToWizard: () => void;
  onNavigateToCatalog: () => void;
}

export const FavoritesView: React.FC<FavoritesViewProps> = ({
  favorites,
  allGames,
  onToggleFavorite,
  onOpenDetails,
  onNavigateToWizard,
  onNavigateToCatalog,
}) => {
  const favoriteGames = allGames.filter(g => favorites.includes(g.id));

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Bookmark className="w-6 h-6 text-amber-400 fill-amber-400/20" />
            <span>Ваша колекція улюблених настілок</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Збережені ігри для ваших найближчих ігрових вечорів
          </p>
        </div>

        <div className="text-xs text-slate-400 font-mono tabular-nums">
          Збережено: <span className="font-semibold text-white">{favoriteGames.length}</span>
        </div>
      </div>

      {favoriteGames.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {favoriteGames.map(game => (
            <GameCard
              key={game.id}
              game={game}
              isFavorite={true}
              onToggleFavorite={onToggleFavorite}
              onOpenDetails={onOpenDetails}
            />
          ))}
        </div>
      ) : (
        <div className="max-w-md mx-auto text-center py-16 bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-4">
          <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-500 mx-auto">
            <Bookmark className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white mb-1">
              У вас поки немає збережених ігор
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Натискайте іконку прапорця/закладки на будь-якій грі в рекомендаціях або каталозі, щоб додати її сюди.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={onNavigateToWizard}
              className="w-full sm:w-auto px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Пройти підбір гри</span>
            </button>
            <button
              onClick={onNavigateToCatalog}
              className="w-full sm:w-auto px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition-colors"
            >
              Переглянути каталог
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
