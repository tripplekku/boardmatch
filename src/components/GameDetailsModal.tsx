import React, { useEffect } from 'react';
import { X, Star, Users, Clock, ShieldAlert, Bookmark, Sparkles, BookOpen, Layers, Tag, ArrowRight } from 'lucide-react';
import { BoardGame } from '../types/game';
import { findSimilarGames } from '../services/recommendationEngine';
import { playDiceClick } from '../utils/sound';

interface GameDetailsModalProps {
  game: BoardGame | null;
  allGames: BoardGame[];
  isFavorite: boolean;
  onToggleFavorite: (gameId: string) => void;
  onSelectGame: (game: BoardGame) => void;
  onClose: () => void;
}

export const GameDetailsModal: React.FC<GameDetailsModalProps> = ({
  game,
  allGames,
  isFavorite,
  onToggleFavorite,
  onSelectGame,
  onClose,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!game) return null;

  const similarGames = findSimilarGames(game, allGames, 3);

  const complexityLabels: Record<string, { label: string; desc: string }> = {
    light: { label: 'Легка (Light)', desc: 'Прості правила, пояснюються за 5–10 хв' },
    medium: { label: 'Середня (Medium)', desc: 'Збалансована глибина, підходить для більшості' },
    heavy: { label: 'Складна (Heavy)', desc: 'Багато нюансів, стратегічне планування' },
  };

  const categoryLabels: Record<string, string> = {
    strategy: 'Стратегія',
    party: 'Для вечірок',
    cooperative: 'Кооперативна',
    family: 'Сімейна',
    thematic: 'Пригоди та Тематична',
    abstract: 'Абстрактна',
    deckbuilding: 'Колодобудування',
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm overflow-y-auto"
    >
      <div
        onClick={e => e.stopPropagation()}
        className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl my-8 text-slate-100 flex flex-col max-h-[90vh]"
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-800 bg-slate-900/90 sticky top-0 z-20 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="text-xs text-amber-400 font-semibold uppercase tracking-wider">
              {categoryLabels[game.category] || game.category}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                playDiceClick();
                onToggleFavorite(game.id);
              }}
              className={`p-2 rounded-lg border text-xs transition-colors flex items-center gap-1.5 ${
                isFavorite
                  ? 'bg-amber-400 text-slate-950 border-amber-400 font-semibold'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
              <span className="hidden sm:inline">{isFavorite ? 'В улюблених' : 'Зберегти'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Main Hero & Info */}
          <div className="flex flex-col sm:flex-row gap-5">
            <div className="w-full sm:w-64 aspect-[16/11] rounded-xl overflow-hidden bg-slate-800 shrink-0 border border-slate-800">
              <img
                src={game.imageUrl}
                alt={game.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex-1 space-y-3">
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">
                  {game.title}
                </h2>
                {game.originalTitle && (
                  <p className="text-xs text-slate-400">{game.originalTitle}</p>
                )}
              </div>

              {/* BGG Rating */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-xs font-mono font-bold text-amber-400 px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded-md">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>{game.rating.toFixed(1)} / 10</span>
                </div>
                <span className="text-xs text-slate-400">Рейтинг спільноти BGG</span>
              </div>

              {/* Unboxed Spec Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs">
                <div className="p-2.5 bg-slate-800/50 rounded-lg border border-slate-800">
                  <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                    <Users className="w-3.5 h-3.5" />
                    <span>Гравці</span>
                  </div>
                  <div className="font-semibold text-white font-mono tabular-nums">
                    {game.minPlayers}–{game.maxPlayers} осіб
                  </div>
                  <div className="text-[11px] text-amber-400/90">
                    Найкраще: {game.bestPlayers}
                  </div>
                </div>

                <div className="p-2.5 bg-slate-800/50 rounded-lg border border-slate-800">
                  <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Тривалість</span>
                  </div>
                  <div className="font-semibold text-white font-mono tabular-nums">
                    {game.minPlaytime}–{game.maxPlaytime} хв
                  </div>
                  <div className="text-[11px] text-slate-400">
                    На партію
                  </div>
                </div>

                <div className="p-2.5 bg-slate-800/50 rounded-lg border border-slate-800 col-span-2 sm:col-span-1">
                  <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Складність / Вік</span>
                  </div>
                  <div className="font-semibold text-white">
                    {complexityLabels[game.complexity]?.label || game.complexity}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Рекомендовано від {game.age}+ років
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
              <span>Про що ця гра</span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              {game.description}
            </p>
          </div>

          {/* Rules Summary */}
          {game.ruleSummary && (
            <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800 space-y-2">
              <h3 className="text-xs font-semibold text-amber-400 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Короткі правила та перебіг раунду</span>
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {game.ruleSummary}
              </p>
            </div>
          )}

          {/* Mechanics & Tags */}
          <div className="space-y-3">
            <div>
              <span className="text-xs font-medium text-slate-400 block mb-1.5 flex items-center gap-1">
                <Layers className="w-3 h-3" />
                <span>Ігрові механіки</span>
              </span>
              <div className="flex flex-wrap gap-1.5 text-xs">
                {game.mechanics.map((m, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 bg-slate-800/80 border border-slate-700/60 rounded-md text-slate-300 text-[11px]"
                  >
                    {m}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <span className="text-xs font-medium text-slate-400 block mb-1.5 flex items-center gap-1">
                <Tag className="w-3 h-3" />
                <span>Тематичні теги</span>
              </span>
              <div className="flex flex-wrap gap-1.5 text-xs">
                {game.tags.map((t, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 bg-slate-800/40 border border-slate-700/40 rounded-md text-slate-400 text-[11px]"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Similar Games Section */}
          {similarGames.length > 0 && (
            <div className="pt-4 border-t border-slate-800 space-y-3">
              <h3 className="text-xs font-semibold text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Схожі настільні ігри за механіками та настроєм</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {similarGames.map(sim => (
                  <div
                    key={sim.id}
                    onClick={() => onSelectGame(sim)}
                    className="p-3 bg-slate-800/50 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-xl transition-all cursor-pointer group"
                  >
                    <div className="aspect-[16/9] w-full rounded-lg overflow-hidden bg-slate-900 mb-2">
                      <img
                        src={sim.imageUrl}
                        alt={sim.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    </div>
                    <h4 className="text-xs font-semibold text-slate-200 group-hover:text-amber-400 transition-colors truncate">
                      {sim.title}
                    </h4>
                    <div className="text-[11px] text-slate-400 font-mono tabular-nums">
                      {sim.minPlayers}–{sim.maxPlayers} гравців · {sim.minPlaytime} хв
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
