import React, { useState } from 'react';
import { Users, Clock, Compass, Sparkles, SlidersHorizontal, ChevronRight, RotateCcw } from 'lucide-react';
import { BoardGame, Complexity, GameCategory, RecommendationPreferences } from '../types/game';
import { playSuccessChime, playDiceClick } from '../utils/sound';

interface RecommendationWizardProps {
  games: BoardGame[];
  onFindRecommendations: (prefs: RecommendationPreferences) => void;
}

export const RecommendationWizard: React.FC<RecommendationWizardProps> = ({
  games,
  onFindRecommendations,
}) => {
  const [playerCount, setPlayerCount] = useState<number>(4);
  const [exactPlayerCount, setExactPlayerCount] = useState<boolean>(true);
  const [playtimePreference, setPlaytimePreference] = useState<'quick' | 'medium' | 'long' | 'epic' | 'any'>('medium');
  const [complexityPreference, setComplexityPreference] = useState<Complexity | 'any'>('medium');
  const [selectedCategories, setSelectedCategories] = useState<GameCategory[]>(['strategy', 'family']);
  const [interactionStyle, setInteractionStyle] = useState<'cooperative' | 'competitive' | 'friendly' | 'bluff' | 'any'>('friendly');
  const [playerExperience, setPlayerExperience] = useState<'beginner' | 'casual' | 'geek' | 'any'>('casual');

  // Calculate live matching candidate count for instant feedback
  const matchingCandidatesCount = games.filter(g => {
    const playerFit = playerCount >= g.minPlayers && playerCount <= g.maxPlayers;
    return exactPlayerCount ? playerFit : true;
  }).length;

  const toggleCategory = (cat: GameCategory) => {
    playDiceClick();
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const handleReset = () => {
    playDiceClick();
    setPlayerCount(4);
    setExactPlayerCount(true);
    setPlaytimePreference('medium');
    setComplexityPreference('medium');
    setSelectedCategories(['strategy', 'family']);
    setInteractionStyle('friendly');
    setPlayerExperience('casual');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    playSuccessChime();
    onFindRecommendations({
      playerCount,
      exactPlayerCount,
      playtimePreference,
      complexityPreference,
      categories: selectedCategories,
      interactionStyle,
      playerExperience,
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Hero Intro Banner */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 mb-8 p-6 sm:p-8">
        <div className="relative z-10 max-w-2xl">
          <div className="text-xs font-semibold text-amber-400 mb-2 tracking-wide uppercase">
            Розумний підбір за 3 кроки
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight text-balance mb-3">
            Знайдіть ідеальну настільну гру для вашого вечора
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed max-w-xl">
            Вкажіть точну кількість гравців, бажаний час та настрій вашої компанії. Наша система зважить всі фактори і підбере найкращі ігри з поясненням кожного вибору.
          </p>
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-20 pointer-events-none hidden sm:block">
          <img
            src="/src/assets/images/hero_boardgame_table_1792406329685.jpg"
            alt="Tabletop board games"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Кількість гравців */}
        <section className="bg-slate-900 border border-slate-800 rounded-xl p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 text-xs font-mono font-bold">
                1
              </div>
              <div>
                <h2 className="text-base font-semibold text-white">Кількість гравців</h2>
                <p className="text-xs text-slate-400">Скільки людей сяде за ігровий стіл?</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-400 cursor-pointer flex items-center gap-1.5 select-none">
                <input
                  type="checkbox"
                  checked={exactPlayerCount}
                  onChange={e => setExactPlayerCount(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-800 text-amber-500 focus:ring-amber-500/20"
                />
                <span>Лише точний склад</span>
              </label>
            </div>
          </div>

          {/* Player Count Selectors */}
          <div className="grid grid-cols-3 sm:grid-cols-7 gap-2.5">
            {[
              { count: 1, label: '1 гравець', sub: 'Соло' },
              { count: 2, label: '2 гравці', sub: 'Дуель/Пара' },
              { count: 3, label: '3 гравці', sub: 'Тріо' },
              { count: 4, label: '4 гравці', sub: 'Класика' },
              { count: 5, label: '5 гравців', sub: 'Компанія' },
              { count: 6, label: '6 гравців', sub: 'Велика група' },
              { count: 7, label: '7+ гравців', sub: 'Паті-гурт' },
            ].map(item => {
              const active = playerCount === item.count;
              return (
                <button
                  key={item.count}
                  type="button"
                  onClick={() => {
                    playDiceClick();
                    setPlayerCount(item.count);
                  }}
                  className={`flex flex-col items-center justify-center py-3 px-2 rounded-xl border transition-all text-center ${
                    active
                      ? 'bg-amber-400 border-amber-400 text-slate-950 font-semibold shadow-lg shadow-amber-500/20'
                      : 'bg-slate-800/60 border-slate-700/80 text-slate-300 hover:bg-slate-800 hover:border-slate-600'
                  }`}
                >
                  <span className="text-lg font-mono tabular-nums leading-none mb-1 font-bold">
                    {item.count}
                  </span>
                  <span className={`text-[11px] leading-tight ${active ? 'text-slate-900' : 'text-slate-400'}`}>
                    {item.sub}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Step 2: Тривалість партії */}
        <section className="bg-slate-900 border border-slate-800 rounded-xl p-5 sm:p-6">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 text-xs font-mono font-bold">
              2
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Тривалість партії</h2>
              <p className="text-xs text-slate-400">Скільки вільного часу ви плануєте приділити?</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
            {[
              { id: 'quick', title: 'До 30 хв', desc: 'Швидкі філери й розминки' },
              { id: 'medium', title: '30 – 60 хв', desc: 'Стандартна партія' },
              { id: 'long', title: '60 – 120 хв', desc: 'Глибока стратегія' },
              { id: 'epic', title: '120+ хв', desc: 'Епічний вечір' },
              { id: 'any', title: 'Будь-який час', desc: 'Без обмежень' },
            ].map(item => {
              const active = playtimePreference === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    playDiceClick();
                    setPlaytimePreference(item.id as any);
                  }}
                  className={`flex flex-col text-left p-3.5 rounded-xl border transition-all ${
                    active
                      ? 'bg-amber-400/10 border-amber-400/80 text-white shadow-sm ring-1 ring-amber-400/50'
                      : 'bg-slate-800/60 border-slate-700/80 text-slate-300 hover:bg-slate-800 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-sm font-semibold ${active ? 'text-amber-400' : 'text-slate-200'}`}>
                      {item.title}
                    </span>
                    <Clock className={`w-3.5 h-3.5 ${active ? 'text-amber-400' : 'text-slate-500'}`} />
                  </div>
                  <span className="text-[11px] text-slate-400 leading-snug">
                    {item.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Step 3: Вподобання, Жанри та Складність */}
        <section className="bg-slate-900 border border-slate-800 rounded-xl p-5 sm:p-6 space-y-6">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 text-xs font-mono font-bold">
              3
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Вподобання та настрій</h2>
              <p className="text-xs text-slate-400">Оберіть бажані жанри, атмосферу та складність</p>
            </div>
          </div>

          {/* Categories Selector */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2.5">
              Улюблені жанри (оберіть один або декілька)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'strategy', label: 'Стратегія', desc: 'Розрахунок, розвиток' },
                { id: 'family', label: 'Сімейна', desc: 'Затишна для будь-кого' },
                { id: 'party', label: 'Для вечірок', desc: 'Сміх, дедукція, паті' },
                { id: 'cooperative', label: 'Кооперативна', desc: 'Разом проти гри' },
                { id: 'deckbuilding', label: 'Колодобудування', desc: 'Комбінації карт' },
                { id: 'abstract', label: 'Абстрактна', desc: 'Логічна головоломка' },
                { id: 'thematic', label: 'Пригоди / Тематична', desc: 'Атмосфера і сюжет' },
              ].map(cat => {
                const active = selectedCategories.includes(cat.id as GameCategory);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => toggleCategory(cat.id as GameCategory)}
                    className={`flex flex-col text-left p-3 rounded-lg border text-xs transition-all ${
                      active
                        ? 'bg-amber-400/10 border-amber-400/70 text-amber-300'
                        : 'bg-slate-800/60 border-slate-700/80 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span className="font-semibold mb-0.5">{cat.label}</span>
                    <span className="text-[11px] text-slate-400">{cat.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Complexity & Interaction Style Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2 border-t border-slate-800/80">
            {/* Complexity */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2">
                Бажана складність правил
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 bg-slate-950/60 rounded-lg border border-slate-800">
                {[
                  { id: 'light', label: 'Легка' },
                  { id: 'medium', label: 'Середня' },
                  { id: 'heavy', label: 'Складна' },
                  { id: 'any', label: 'Будь-яка' },
                ].map(item => {
                  const active = complexityPreference === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        playDiceClick();
                        setComplexityPreference(item.id as any);
                      }}
                      className={`py-2 px-2 text-xs font-medium rounded-md transition-colors ${
                        active
                          ? 'bg-slate-800 text-amber-400 font-semibold shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Interaction Style */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2">
                Стиль взаємодії між гравцями
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 bg-slate-950/60 rounded-lg border border-slate-800">
                {[
                  { id: 'friendly', label: 'Затишна' },
                  { id: 'cooperative', label: 'Команда' },
                  { id: 'competitive', label: 'Суперництво' },
                  { id: 'bluff', label: 'Блеф/Паті' },
                ].map(item => {
                  const active = interactionStyle === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        playDiceClick();
                        setInteractionStyle(item.id as any);
                      }}
                      className={`py-2 px-2 text-xs font-medium rounded-md transition-colors ${
                        active
                          ? 'bg-slate-800 text-amber-400 font-semibold shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="font-mono tabular-nums font-semibold text-slate-200">{matchingCandidatesCount}</span>
            <span>ігор з бази доступні для обраного складу гравців</span>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={handleReset}
              className="hover:text-amber-400 transition-colors flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Скинути</span>
            </button>
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto px-7 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold text-sm transition-all duration-150 flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-[0.98]"
          >
            <Sparkles className="w-4 h-4" />
            <span>Підібрати ігри</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
