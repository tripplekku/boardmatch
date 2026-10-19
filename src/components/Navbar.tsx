import React from 'react';
import { Sparkles, Dices, Bookmark, Database, User, LogIn, LogOut, Share2 } from 'lucide-react';
import { auth } from '../firebase';
import { signOut, User as FirebaseUser } from 'firebase/auth';

interface NavbarProps {
  activeTab: 'wizard' | 'catalog' | 'favorites' | 'roulette';
  setActiveTab: (tab: 'wizard' | 'catalog' | 'favorites' | 'roulette') => void;
  favoritesCount: number;
  user: FirebaseUser | null;
  onOpenAdmin: () => void;
  onOpenAuth: () => void;
  onOpenShare: () => void;
  gamesCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  favoritesCount,
  user,
  onOpenAdmin,
  onOpenAuth,
  onOpenShare,
  gamesCount,
}) => {
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Sign out error', err);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-slate-100">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-4 sm:px-6 py-3.5">
        
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={() => setActiveTab('wizard')}
          className="flex items-center gap-2.5 text-left text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0 hover:opacity-90 transition-opacity"
        >
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Dices className="w-5 h-5" />
          </div>
          <span>BoardMatch</span>
        </button>

        {/* Zone 2: 4-5 concise single-line nav links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
          <button
            onClick={() => setActiveTab('wizard')}
            className={`flex items-center gap-2 hover:text-white transition-colors whitespace-nowrap shrink-0 pb-0.5 border-b-2 ${
              activeTab === 'wizard' ? 'text-amber-400 border-amber-400' : 'border-transparent text-slate-300'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Підбір гри</span>
          </button>

          <button
            onClick={() => setActiveTab('catalog')}
            className={`flex items-center gap-2 hover:text-white transition-colors whitespace-nowrap shrink-0 pb-0.5 border-b-2 ${
              activeTab === 'catalog' ? 'text-amber-400 border-amber-400' : 'border-transparent text-slate-300'
            }`}
          >
            <span>Каталог</span>
            <span className="text-xs text-slate-400 font-mono tabular-nums">({gamesCount})</span>
          </button>

          <button
            onClick={() => setActiveTab('favorites')}
            className={`flex items-center gap-2 hover:text-white transition-colors whitespace-nowrap shrink-0 pb-0.5 border-b-2 ${
              activeTab === 'favorites' ? 'text-amber-400 border-amber-400' : 'border-transparent text-slate-300'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span>Улюблені</span>
            {favoritesCount > 0 && (
              <span className="text-xs text-amber-400 font-mono tabular-nums font-semibold">({favoritesCount})</span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('roulette')}
            className={`flex items-center gap-2 hover:text-white transition-colors whitespace-nowrap shrink-0 pb-0.5 border-b-2 ${
              activeTab === 'roulette' ? 'text-amber-400 border-amber-400' : 'border-transparent text-slate-300'
            }`}
          >
            <Dices className="w-4 h-4" />
            <span>Випадковий вибір</span>
          </button>

          <button
            onClick={onOpenAdmin}
            className="flex items-center gap-1.5 hover:text-white transition-colors whitespace-nowrap shrink-0 text-slate-400 text-xs"
            title="Керування тестовими даними та базою"
          >
            <Database className="w-3.5 h-3.5" />
            <span>База</span>
          </button>
        </nav>

        {/* Zone 3: 1 primary action cluster */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Share Button */}
          <button
            onClick={onOpenShare}
            className="p-2 sm:px-3 sm:py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
            title="Отримати публічне посилання на сайт"
          >
            <Share2 className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Поділитися</span>
          </button>

          {/* User Account / Auth */}
          {user ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-2.5 py-1 bg-slate-800/80 border border-slate-700/70 rounded-lg">
                <div className="w-6 h-6 rounded-full bg-amber-400/20 text-amber-400 font-bold text-xs flex items-center justify-center">
                  {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-medium text-slate-200 truncate max-w-[110px]">
                    {user.displayName || user.email?.split('@')[0]}
                  </span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-rose-400 transition-colors"
                title="Вийти з акаунта"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors whitespace-nowrap shadow-sm shadow-amber-500/10"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Увійти / Реєстрація</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Tab Bar */}
      <div className="md:hidden flex items-center justify-around border-t border-slate-800/80 bg-slate-900/90 py-2 px-2 text-xs">
        <button
          onClick={() => setActiveTab('wizard')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'wizard' ? 'text-amber-400' : 'text-slate-400'}`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Підбір</span>
        </button>
        <button
          onClick={() => setActiveTab('catalog')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'catalog' ? 'text-amber-400' : 'text-slate-400'}`}
        >
          <Dices className="w-4 h-4" />
          <span>Каталог</span>
        </button>
        <button
          onClick={() => setActiveTab('favorites')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'favorites' ? 'text-amber-400' : 'text-slate-400'}`}
        >
          <Bookmark className="w-4 h-4" />
          <span>Улюблені ({favoritesCount})</span>
        </button>
        <button
          onClick={() => setActiveTab('roulette')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'roulette' ? 'text-amber-400' : 'text-slate-400'}`}
        >
          <Dices className="w-4 h-4" />
          <span>Рулетка</span>
        </button>
        <button
          onClick={onOpenShare}
          className="flex flex-col items-center gap-1 text-slate-400"
        >
          <Share2 className="w-4 h-4" />
          <span>Посилання</span>
        </button>
      </div>
    </header>
  );
};
