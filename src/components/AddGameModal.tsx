import React, { useState } from 'react';
import { X, Plus, AlertCircle, Check } from 'lucide-react';
import { BoardGame, Complexity, GameCategory } from '../types/game';
import { addCustomGame } from '../services/gamesService';
import { playSuccessChime } from '../utils/sound';

interface AddGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGameAdded: (newGame: BoardGame) => void;
}

export const AddGameModal: React.FC<AddGameModalProps> = ({
  isOpen,
  onClose,
  onGameAdded,
}) => {
  const [title, setTitle] = useState('');
  const [originalTitle, setOriginalTitle] = useState('');
  const [description, setDescription] = useState('');
  const [minPlayers, setMinPlayers] = useState(2);
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [bestPlayers, setBestPlayers] = useState('4');
  const [minPlaytime, setMinPlaytime] = useState(30);
  const [maxPlaytime, setMaxPlaytime] = useState(60);
  const [complexity, setComplexity] = useState<Complexity>('medium');
  const [category, setCategory] = useState<GameCategory>('strategy');
  const [age, setAge] = useState(10);
  const [rating, setRating] = useState(7.5);
  const [mechanicsStr, setMechanicsStr] = useState('Розміщення робітників, Драфт карт');
  const [tagsStr, setTagsStr] = useState('Стратегія, Будівництво, Єврогра');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError('Будь ласка, заповніть назву та опис гри.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const slug = title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9а-яіїєґ]+/g, '-')
      .replace(/^-|-$/g, '') || `game-${Date.now()}`;

    const newGame: BoardGame = {
      id: slug,
      title: title.trim(),
      originalTitle: originalTitle.trim() || title.trim(),
      description: description.trim(),
      minPlayers: Number(minPlayers),
      maxPlayers: Number(maxPlayers),
      bestPlayers: bestPlayers.trim() || `${minPlayers}-${maxPlayers}`,
      minPlaytime: Number(minPlaytime),
      maxPlaytime: Number(maxPlaytime),
      complexity,
      category,
      age: Number(age),
      rating: Number(rating),
      imageUrl: '/images/boardgame_strategy.jpg',
      mechanics: mechanicsStr.split(',').map(s => s.trim()).filter(Boolean),
      tags: tagsStr.split(',').map(s => s.trim()).filter(Boolean),
      createdAt: new Date().toISOString(),
    };

    try {
      await addCustomGame(newGame);
      onGameAdded(newGame);
      playSuccessChime();
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Не вдалося зберегти гру');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto"
    >
      <div
        onClick={e => e.stopPropagation()}
        className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl p-6 text-slate-100 my-8 max-h-[90vh] flex flex-col"
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-white">Додати нову настільну гру в базу</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="overflow-y-auto py-4 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 mb-1 font-medium">Назва гри (українською) *</label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="напр. Розкіш"
                className="w-full bg-slate-950/70 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-1 font-medium">Оригінальна назва (English)</label>
              <input
                type="text"
                value={originalTitle}
                onChange={e => setOriginalTitle(e.target.value)}
                placeholder="напр. Splendor"
                className="w-full bg-slate-950/70 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 mb-1 font-medium">Короткий опис та сюжет *</label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Про що ця гра, як перемагати..."
              className="w-full bg-slate-950/70 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-400 leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-300 mb-1 font-medium">Мін. гравців</label>
              <input
                type="number"
                min={1}
                max={20}
                value={minPlayers}
                onChange={e => setMinPlayers(Number(e.target.value))}
                className="w-full bg-slate-950/70 border border-slate-800 rounded-lg p-2 text-white"
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-1 font-medium">Макс. гравців</label>
              <input
                type="number"
                min={1}
                max={30}
                value={maxPlayers}
                onChange={e => setMaxPlayers(Number(e.target.value))}
                className="w-full bg-slate-950/70 border border-slate-800 rounded-lg p-2 text-white"
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-1 font-medium">Найкращий склад</label>
              <input
                type="text"
                value={bestPlayers}
                onChange={e => setBestPlayers(e.target.value)}
                placeholder="напр. 3-4"
                className="w-full bg-slate-950/70 border border-slate-800 rounded-lg p-2 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 mb-1 font-medium">Тривалість від (хв)</label>
              <input
                type="number"
                min={5}
                value={minPlaytime}
                onChange={e => setMinPlaytime(Number(e.target.value))}
                className="w-full bg-slate-950/70 border border-slate-800 rounded-lg p-2 text-white"
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-1 font-medium">Тривалість до (хв)</label>
              <input
                type="number"
                min={5}
                value={maxPlaytime}
                onChange={e => setMaxPlaytime(Number(e.target.value))}
                className="w-full bg-slate-950/70 border border-slate-800 rounded-lg p-2 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-300 mb-1 font-medium">Категорія</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as any)}
                className="w-full bg-slate-950/70 border border-slate-800 rounded-lg p-2 text-white"
              >
                <option value="strategy">Стратегія</option>
                <option value="family">Сімейна</option>
                <option value="party">Для вечірок</option>
                <option value="cooperative">Кооперативна</option>
                <option value="deckbuilding">Колодобудування</option>
                <option value="abstract">Абстрактна</option>
                <option value="thematic">Пригоди / Тематична</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-300 mb-1 font-medium">Складність</label>
              <select
                value={complexity}
                onChange={e => setComplexity(e.target.value as any)}
                className="w-full bg-slate-950/70 border border-slate-800 rounded-lg p-2 text-white"
              >
                <option value="light">Легка</option>
                <option value="medium">Середня</option>
                <option value="heavy">Складна</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-300 mb-1 font-medium">Рейтинг (BGG)</label>
              <input
                type="number"
                step="0.1"
                min={1}
                max={10}
                value={rating}
                onChange={e => setRating(Number(e.target.value))}
                className="w-full bg-slate-950/70 border border-slate-800 rounded-lg p-2 text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 mb-1 font-medium">Механіки (через кому)</label>
            <input
              type="text"
              value={mechanicsStr}
              onChange={e => setMechanicsStr(e.target.value)}
              placeholder="напр. Драфт карт, Розміщення плиток"
              className="w-full bg-slate-950/70 border border-slate-800 rounded-lg p-2 text-white"
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-1 font-medium">Теги (через кому)</label>
            <input
              type="text"
              value={tagsStr}
              onChange={e => setTagsStr(e.target.value)}
              placeholder="напр. Космос, Будівництво, Для двох"
              className="w-full bg-slate-950/70 border border-slate-800 rounded-lg p-2 text-white"
            />
          </div>

          <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
            >
              Скасувати
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 font-semibold rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{isSubmitting ? 'Збереження...' : 'Зберегти в базу'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
