import React, { useState } from 'react';
import { Bookmark, Users, Clock, Star, ArrowUpRight } from 'lucide-react';
import { BoardGame } from '../types/game';
import { playDiceClick } from '../utils/sound';

interface GameCardProps {
  game: BoardGame;
  isFavorite: boolean;
  onToggleFavorite: (gameId: string) => void;
  onOpenDetails: (game: BoardGame) => void;
  matchScore?: number;
  highlightBestPlayer?: boolean;
}

export const GameCard: React.FC<GameCardProps> = ({
  game,
  isFavorite,
  onToggleFavorite,
  onOpenDetails,
  matchScore,
  highlightBestPlayer,
}) => {
  const [imageError, setImageError] = useState(false);

  const complexityLabels: Record<string, string> = {
    light: 'Легка',
    medium: 'Середня',
    heavy: 'Складна',
  };

  const categoryLabels: Record<string, string> = {
    strategy: 'Стратегія',
    party: 'Для вечірок',
    cooperative: 'Кооперативна',
    family: 'Сімейна',
    thematic: 'Пригоди',
    abstract: 'Абстрактна',
    deckbuilding: 'Колодобудування',
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    playDiceClick();
    onToggleFavorite(game.id);
  };

  return (
    <div
      onClick={() => onOpenDetails(game)}
      className="group relative flex flex-col bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-slate-700 transition-all duration-200 cursor-pointer hover:shadow-xl hover:shadow-amber-500/5"
    >
      {/* Cover Image & Fallback */}
      <div className="relative aspect-[16/10] w-full bg-slate-800 overflow-hidden">
        {!imageError ? (
          <img
            src={game.imageUrl}
            alt={game.title}
            onError={() => setImageError(true)}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-slate-800 to-slate-900 text-slate-400">
            <span className="text-2xl font-bold text-amber-500/60 mb-1">{game.title.charAt(0)}</span>
            <span className="text-xs text-slate-500 text-center font-medium">{game.title}</span>
          </div>
        )}

        {/* Measured scrim overlay for text contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-black/30 pointer-events-none" />

        {/* Favorite Bookmark Button */}
        <button
          onClick={handleFavoriteClick}
          aria-label={isFavorite ? 'Видалити з улюблених' : 'Додати в улюблені'}
          className={`absolute top-2.5 right-2.5 p-2 rounded-lg backdrop-blur-md transition-all ${
            isFavorite
              ? 'bg-amber-400 text-slate-900 shadow-md'
              : 'bg-slate-900/70 text-slate-300 hover:text-white hover:bg-slate-900/90'
          }`}
        >
          <Bookmark className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
        </button>

        {/* Optional Recommendation Score */}
        {matchScore !== undefined && (
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1 px-2.5 py-1 bg-slate-900/90 backdrop-blur-md rounded-md border border-amber-500/30 text-amber-400 text-xs font-semibold">
            <span className="font-mono tabular-nums">{matchScore}%</span>
            <span className="text-[11px] font-normal text-slate-300">збіг</span>
          </div>
        )}

        {/* Subtle Category Marker at bottom of image */}
        <div className="absolute bottom-2 left-3 text-xs text-slate-300 font-medium drop-shadow-sm">
          {categoryLabels[game.category] || game.category}
        </div>
      </div>

      {/* Card Content Area */}
      <div className="flex-1 flex flex-col p-4">
        {/* Title and Rating */}
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <h3 className="text-base font-semibold text-slate-100 group-hover:text-amber-400 transition-colors line-clamp-1">
            {game.title}
          </h3>
          <div className="flex items-center gap-1 text-xs text-amber-400 font-mono tabular-nums shrink-0 pt-0.5">
            <Star className="w-3.5 h-3.5 fill-amber-400" />
            <span>{game.rating.toFixed(1)}</span>
          </div>
        </div>

        {/* Original English Title if different */}
        {game.originalTitle && game.originalTitle !== game.title && (
          <div className="text-xs text-slate-400 mb-2 truncate">
            {game.originalTitle}
          </div>
        )}

        {/* Zero-Pill Unboxed Metadata with · separator */}
        <div className="flex items-center flex-wrap gap-2 text-xs text-slate-400 mb-3 pt-0.5 border-t border-slate-800/80">
          <div className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-mono tabular-nums">
              {game.minPlayers === game.maxPlayers ? game.minPlayers : `${game.minPlayers}–${game.maxPlayers}`}
            </span>
            <span>гравців</span>
            {highlightBestPlayer && (
              <span className="text-[11px] text-amber-400/90 font-medium">({game.bestPlayers})</span>
            )}
          </div>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-mono tabular-nums">
              {game.minPlaytime === game.maxPlaytime ? `${game.minPlaytime}` : `${game.minPlaytime}–${game.maxPlaytime}`} хв
            </span>
          </div>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span>{complexityLabels[game.complexity] || game.complexity}</span>
        </div>

        {/* Short Summary */}
        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4 flex-1">
          {game.description}
        </p>

        {/* Bottom Action Footer */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
          <span className="text-slate-400 text-[11px] truncate max-w-[170px]">
            {game.mechanics.slice(0, 2).join(' · ')}
          </span>
          <span className="text-amber-400/90 group-hover:text-amber-300 font-medium flex items-center gap-0.5">
            Детальніше
            <ArrowUpRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </div>
  );
};
