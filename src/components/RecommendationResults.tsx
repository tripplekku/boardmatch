import React from 'react';
import { ArrowLeft, CheckCircle2, Sparkles, Star, Users, Clock, Bookmark, ArrowUpRight, RotateCcw } from 'lucide-react';
import { BoardGame, RecommendationPreferences, RecommendationResult } from '../types/game';
import { GameCard } from './GameCard';
import { playDiceClick } from '../utils/sound';

interface RecommendationResultsProps {
  results: RecommendationResult[];
  preferences: RecommendationPreferences;
  favorites: string[];
  onToggleFavorite: (gameId: string) => void;
  onOpenDetails: (game: BoardGame) => void;
  onBackToWizard: () => void;
}

export const RecommendationResults: React.FC<RecommendationResultsProps> = ({
  results,
  preferences,
  favorites,
  onToggleFavorite,
  onOpenDetails,
  onBackToWizard,
}) => {
  if (results.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16 bg-slate-900 border border-slate-800 rounded-2xl p-8">
        <Sparkles className="w-10 h-10 text-amber-400 mx-auto mb-3 opacity-60" />
        <h2 className="text-xl font-bold text-white mb-2">Не знайдено точних збігів</h2>
        <p className="text-sm text-slate-400 mb-6 max-w-md mx-auto">
          Спробуйте розширити діапазон часу або увімкнути гнучкий пошук кількості гравців.
        </p>
        <button
          onClick={onBackToWizard}
          className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-900 font-semibold rounded-lg text-xs transition-colors inline-flex items-center gap-2"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Змінити критерії пошуку</span>
        </button>
      </div>
    );
  }

  const topMatch = results[0];
  const otherMatches = results.slice(1);
  const isTopFavorite = favorites.includes(topMatch.game.id);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Top Header & Query Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <button
            onClick={onBackToWizard}
            className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Повернутися до налаштувань підбору</span>
          </button>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Рекомендації для вашої гри
          </h1>
          <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
            <span>{preferences.playerCount} гравців</span>
            <span aria-hidden="true">·</span>
            <span>
              {preferences.playtimePreference === 'quick' && 'до 30 хв'}
              {preferences.playtimePreference === 'medium' && '30–60 хв'}
              {preferences.playtimePreference === 'long' && '60–120 хв'}
              {preferences.playtimePreference === 'epic' && '120+ хв'}
              {preferences.playtimePreference === 'any' && 'будь-який час'}
            </span>
            <span aria-hidden="true">·</span>
            <span>Знайдено {results.length} відповідних ігор</span>
          </div>
        </div>

        <button
          onClick={onBackToWizard}
          className="self-start sm:self-auto px-4 py-2 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Змінити параметри</span>
        </button>
      </div>

      {/* Hero Spotlight: Top Recommendation */}
      <section className="bg-slate-900 border border-amber-500/30 rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-2xl shadow-amber-500/5">
        <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 items-start">
          {/* Cover image */}
          <div className="w-full lg:w-72 aspect-[4/3] rounded-xl overflow-hidden bg-slate-800 shrink-0 relative group">
            <img
              src={topMatch.game.imageUrl}
              alt={topMatch.game.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute top-3 left-3 px-3 py-1 bg-amber-400 text-slate-950 font-bold text-xs rounded-md shadow-md flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Топ рекомендація №1</span>
            </div>
          </div>

          {/* Details & Rationale */}
          <div className="flex-1 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-amber-400 font-semibold uppercase tracking-wider">
                    {topMatch.matchPercentage}% ідеальний збіг
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  {topMatch.game.title}
                </h2>
                {topMatch.game.originalTitle && topMatch.game.originalTitle !== topMatch.game.title && (
                  <p className="text-xs text-slate-400">{topMatch.game.originalTitle}</p>
                )}
              </div>

              <div className="flex items-center gap-1 text-sm text-amber-400 font-mono tabular-nums font-semibold px-2.5 py-1 bg-slate-800 rounded-lg border border-slate-700">
                <Star className="w-4 h-4 fill-amber-400" />
                <span>{topMatch.game.rating.toFixed(1)}</span>
              </div>
            </div>

            {/* Unboxed Metadata */}
            <div className="flex items-center flex-wrap gap-2 text-xs text-slate-300 py-1">
              <div className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-mono tabular-nums">{topMatch.game.minPlayers}–{topMatch.game.maxPlayers} гравців</span>
                <span className="text-amber-400/90 font-medium">(ідеально {topMatch.game.bestPlayers})</span>
              </div>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-mono tabular-nums">{topMatch.game.minPlaytime}–{topMatch.game.maxPlaytime} хв</span>
              </div>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span>Складність: {topMatch.game.complexity === 'light' ? 'Легка' : topMatch.game.complexity === 'medium' ? 'Середня' : 'Складна'}</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span>Вік: {topMatch.game.age}+</span>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed">
              {topMatch.game.description}
            </p>

            {/* Why This Game Matches Rationale Box */}
            <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800/80 space-y-2">
              <span className="text-xs font-semibold text-slate-200 block">
                Чому ця гра рекомендована для вас:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {topMatch.reasons.map((r, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{r.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => onOpenDetails(topMatch.game)}
                className="px-5 py-2.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold text-xs transition-colors flex items-center gap-1.5"
              >
                <span>Повні правила та деталі</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => {
                  playDiceClick();
                  onToggleFavorite(topMatch.game.id);
                }}
                className={`px-4 py-2.5 rounded-lg border text-xs font-medium transition-colors flex items-center gap-1.5 ${
                  isTopFavorite
                    ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                }`}
              >
                <Bookmark className={`w-3.5 h-3.5 ${isTopFavorite ? 'fill-current' : ''}`} />
                <span>{isTopFavorite ? 'В улюблених' : 'Зберегти в улюблені'}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Runner Up Recommendations */}
      {otherMatches.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white tracking-tight">
              Інші чудові варіанти для цього складу
            </h3>
            <span className="text-xs text-slate-400 font-mono tabular-nums">
              {otherMatches.length} варіантів
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {otherMatches.map(res => (
              <GameCard
                key={res.game.id}
                game={res.game}
                isFavorite={favorites.includes(res.game.id)}
                onToggleFavorite={onToggleFavorite}
                onOpenDetails={onOpenDetails}
                matchScore={res.matchPercentage}
                highlightBestPlayer={res.isBestPlayerCount}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
