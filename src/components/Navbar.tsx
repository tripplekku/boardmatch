import React from 'react';
import { Sparkles, Dices, Bookmark, Database, User, LogIn, LogOut } from 'lucide-react';
import { auth } from '../firebase';
import { GoogleAuthProvider, signInWithPopup, signOut, User as FirebaseUser } from 'firebase/auth';

interface NavbarProps {
  activeTab: 'wizard' | 'catalog' | 'favorites' | 'roulette';
  setActiveTab: (tab: 'wizard' | 'catalog' | 'favorites' | 'roulette') => void;
  favoritesCount: number;
  user: FirebaseUser | null;
  onOpenAdmin: () => void;
  gamesCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  favoritesCount,
  user,
  onOpenAdmin,
  gamesCount,
}) => {
  const handleAuth = async () => {
    if (user) {
      try {
        await signOut(auth);
      } catch (err) {
        console.error('Sign out error', err);
      }
    } else {
      try {
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
      } catch (err) {
        console.warn('Google sign-in popup closed or cancelled', err);
      }
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
            <span>База даних</span>
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          {user ? (
            <div className="flex items-center gap-2.5">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-medium text-slate-200 truncate max-w-[130px]">
                  {user.displayName || user.email?.split('@')[0]}
                </span>
                <span className="text-[10px] text-slate-400">Синхронізовано</span>
              </div>
              <button
                onClick={handleAuth}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors whitespace-nowrap"
                title="Вийти з профілю"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Вийти</span>
              </button>
            </div>
          ) : (
            <button
              onClick={handleAuth}
              className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium text-slate-900 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors whitespace-nowrap font-medium"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Увійти через Google</span>
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
          onClick={onOpenAdmin}
          className="flex flex-col items-center gap-1 text-slate-400"
        >
          <Database className="w-4 h-4" />
          <span>База</span>
        </button>
      </div>
    </header>
  );
};
