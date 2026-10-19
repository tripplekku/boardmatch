import React, { useState, useMemo } from 'react';
import { Search, Filter, SlidersHorizontal, RotateCcw, Plus, Star } from 'lucide-react';
import { BoardGame, Complexity, GameCategory } from '../types/game';
import { GameCard } from './GameCard';
import { playDiceClick } from '../utils/sound';

interface CatalogViewProps {
  games: BoardGame[];
  favorites: string[];
  onToggleFavorite: (gameId: string) => void;
  onOpenDetails: (game: BoardGame) => void;
  onOpenAddModal: () => void;
}

export const CatalogView: React.FC<CatalogViewProps> = ({
  games,
  favorites,
  onToggleFavorite,
  onOpenDetails,
  onOpenAddModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPlayers, setFilterPlayers] = useState<number | 'all'>('all');
  const [filterPlaytime, setFilterPlaytime] = useState<'all' | 'quick' | 'medium' | 'long' | 'epic'>('all');
  const [filterComplexity, setFilterComplexity] = useState<Complexity | 'all'>('all');
  const [filterCategory, setFilterCategory] = useState<GameCategory | 'all'>('all');
  const [sortBy, setSortBy] = useState<'rating' | 'title' | 'playtime' | 'players'>('rating');

  const filteredGames = useMemo(() => {
    return games
      .filter(game => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = game.title.toLowerCase().includes(q);
          const matchOriginal = game.originalTitle?.toLowerCase().includes(q);
          const matchTags = game.tags.some(t => t.toLowerCase().includes(q));
          const matchMechanics = game.mechanics.some(m => m.toLowerCase().includes(q));
          if (!matchTitle && !matchOriginal && !matchTags && !matchMechanics) {
            return false;
          }
        }

        // Players filter
        if (filterPlayers !== 'all') {
          if (filterPlayers < game.minPlayers || filterPlayers > game.maxPlayers) {
            return false;
          }
        }

        // Playtime filter
        if (filterPlaytime === 'quick' && game.maxPlaytime > 35) return false;
        if (filterPlaytime === 'medium' && (game.maxPlaytime < 30 || game.minPlaytime > 65)) return false;
        if (filterPlaytime === 'long' && (game.maxPlaytime < 60 || game.minPlaytime > 120)) return false;
        if (filterPlaytime === 'epic' && game.maxPlaytime < 100) return false;

        // Complexity filter
        if (filterComplexity !== 'all' && game.complexity !== filterComplexity) {
          return false;
        }

        // Category filter
        if (filterCategory !== 'all' && game.category !== filterCategory) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'rating') return b.rating - a.rating;
        if (sortBy === 'title') return a.title.localeCompare(b.title, 'uk');
        if (sortBy === 'playtime') return a.minPlaytime - b.minPlaytime;
        if (sortBy === 'players') return b.maxPlayers - a.maxPlayers;
        return 0;
      });
  }, [games, searchQuery, filterPlayers, filterPlaytime, filterComplexity, filterCategory, sortBy]);

  const handleResetFilters = () => {
    playDiceClick();
    setSearchQuery('');
    setFilterPlayers('all');
    setFilterPlaytime('all');
    setFilterComplexity('all');
    setFilterCategory('all');
    setSortBy('rating');
  };

  const hasActiveFilters =
    searchQuery !== '' ||
    filterPlayers !== 'all' ||
    filterPlaytime !== 'all' ||
    filterComplexity !== 'all' ||
    filterCategory !== 'all';

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Catalog Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Каталог настільних ігор
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Повна база верифікованих ігор з детальними характеристиками та відгуками
          </p>
        </div>

        <button
          onClick={onOpenAddModal}
          className="self-start md:self-auto px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5 text-amber-400" />
          <span>Додати власну гру в базу</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Пошук за назвою (напр. Катан, Wingspan), механікою чи тегом..."
              className="w-full bg-slate-950/80 border border-slate-800 rounded-lg pl-9.5 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
            />
          </div>

          {/* Sort selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 whitespace-nowrap hidden sm:inline">Сортувати:</span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500/50"
            >
              <option value="rating">Рейтинг (від найвищого)</option>
              <option value="title">Назва (А - Я)</option>
              <option value="playtime">Тривалість (від найкоротших)</option>
              <option value="players">Максимум гравців</option>
            </select>
          </div>
        </div>

        {/* Multi-Filters Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-slate-800/80 text-xs">
          {/* Players */}
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Кількість гравців</label>
            <select
              value={filterPlayers}
              onChange={e => setFilterPlayers(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="w-full bg-slate-950/60 border border-slate-800 rounded-md px-2.5 py-1.5 text-slate-200 focus:outline-none"
            >
              <option value="all">Усі склади</option>
              <option value="1">1 гравець (Соло)</option>
              <option value="2">2 гравці (Дуель)</option>
              <option value="3">3 гравці</option>
              <option value="4">4 гравці</option>
              <option value="5">5 гравців</option>
              <option value="6">6 гравців</option>
              <option value="7">7+ гравців</option>
            </select>
          </div>

          {/* Playtime */}
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Тривалість партії</label>
            <select
              value={filterPlaytime}
              onChange={e => setFilterPlaytime(e.target.value as any)}
              className="w-full bg-slate-950/60 border border-slate-800 rounded-md px-2.5 py-1.5 text-slate-200 focus:outline-none"
            >
              <option value="all">Будь-яка</option>
              <option value="quick">До 30 хв</option>
              <option value="medium">30 – 60 хв</option>
              <option value="long">60 – 120 хв</option>
              <option value="epic">120+ хв</option>
            </select>
          </div>

          {/* Complexity */}
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Рівень складності</label>
            <select
              value={filterComplexity}
              onChange={e => setFilterComplexity(e.target.value as any)}
              className="w-full bg-slate-950/60 border border-slate-800 rounded-md px-2.5 py-1.5 text-slate-200 focus:outline-none"
            >
              <option value="all">Усі рівні</option>
              <option value="light">Легка (Light)</option>
              <option value="medium">Середня (Medium)</option>
              <option value="heavy">Складна (Heavy)</option>
            </select>
          </div>

          {/* Category */}
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Жанрова категорія</label>
            <select
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value as any)}
              className="w-full bg-slate-950/60 border border-slate-800 rounded-md px-2.5 py-1.5 text-slate-200 focus:outline-none"
            >
              <option value="all">Усі жанри</option>
              <option value="strategy">Стратегія</option>
              <option value="family">Сімейна</option>
              <option value="party">Для вечірок</option>
              <option value="cooperative">Кооперативна</option>
              <option value="deckbuilding">Колодобудування</option>
              <option value="abstract">Абстрактна</option>
              <option value="thematic">Пригоди / Тематична</option>
            </select>
          </div>
        </div>

        {/* Filter status & clear button */}
        <div className="flex items-center justify-between pt-1 text-xs">
          <span className="text-slate-400">
            Відображено <span className="font-mono tabular-nums text-white font-semibold">{filteredGames.length}</span> з {games.length} ігор
          </span>
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1 font-medium"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Очистити фільтри</span>
            </button>
          )}
        </div>
      </div>

      {/* Games Grid */}
      {filteredGames.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredGames.map(game => (
            <GameCard
              key={game.id}
              game={game}
              isFavorite={favorites.includes(game.id)}
              onToggleFavorite={onToggleFavorite}
              onOpenDetails={onOpenDetails}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-slate-900 border border-slate-800 rounded-2xl p-8">
          <Filter className="w-8 h-8 text-slate-500 mx-auto mb-2" />
          <h3 className="text-base font-semibold text-white mb-1">Ігор не знайдено</h3>
          <p className="text-xs text-slate-400 mb-4">Жодна гра не відповідає заданій комбінації фільтрів.</p>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-900 font-semibold rounded-lg text-xs transition-colors"
          >
            Скинути фільтри
          </button>
        </div>
      )}
    </div>
  );
};
