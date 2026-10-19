import React, { useState } from 'react';
import { X, Database, Check, RefreshCw, AlertCircle, Plus, Layers, ShieldCheck } from 'lucide-react';
import { BoardGame } from '../types/game';
import { seedDatabase } from '../services/gamesService';
import { INITIAL_GAMES } from '../data/seedGames';
import { playSuccessChime } from '../utils/sound';

interface DatabaseAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  games: BoardGame[];
  onRefreshGames: () => Promise<void>;
  onOpenAddModal: () => void;
}

export const DatabaseAdminModal: React.FC<DatabaseAdminModalProps> = ({
  isOpen,
  onClose,
  games,
  onRefreshGames,
  onOpenAddModal,
}) => {
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedSuccess, setSeedSuccess] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSeed = async () => {
    setIsSeeding(true);
    setErrorMsg(null);
    setSeedSuccess(null);
    try {
      const count = await seedDatabase(INITIAL_GAMES);
      await onRefreshGames();
      playSuccessChime();
      setSeedSuccess(`Успішно завантажено ${count} тестових ігор у базу даних Firestore!`);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Помилка запису в Firestore');
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
    >
      <div
        onClick={e => e.stopPropagation()}
        className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl p-6 text-slate-100 space-y-6"
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Керування базою даних (MVP)</h2>
              <p className="text-xs text-slate-400">Статус Firestore та синхронізація тестових даних</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Database Status Cards */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
            <span className="text-slate-400 block mb-1">Статус підключення</span>
            <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>Firestore Online</span>
            </div>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
            <span className="text-slate-400 block mb-1">Ігор у каталозі</span>
            <div className="text-amber-400 font-mono tabular-nums font-bold text-base">
              {games.length} настілок
            </div>
          </div>
        </div>

        {/* Messages */}
        {seedSuccess && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{seedSuccess}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3 pt-2 border-t border-slate-800 text-xs">
          <div>
            <h4 className="font-semibold text-slate-200 mb-1">Синхронізація тестових даних</h4>
            <p className="text-slate-400 mb-3 leading-relaxed">
              Ініціалізувати базу Firestore 24 верифікованими іграми з повними українськими описами, механіками та оптимальним складом гравців.
            </p>
            <button
              onClick={handleSeed}
              disabled={isSeeding}
              className="w-full py-2.5 px-4 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSeeding ? 'animate-spin' : ''}`} />
              <span>{isSeeding ? 'Завантаження в Firestore...' : 'Завантажити тестові дані (24 гри)'}</span>
            </button>
          </div>

          <div className="pt-3 border-t border-slate-800/80">
            <button
              onClick={() => {
                onClose();
                onOpenAddModal();
              }}
              className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-3.5 h-3.5 text-amber-400" />
              <span>Додати нову настільну гру вручну</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
