import React, { useState } from 'react';
import { X, Mail, Lock, User, AlertCircle, Sparkles, Check, ArrowRight } from 'lucide-react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider,
  signInAnonymously,
} from 'firebase/auth';
import { auth } from '../firebase';
import { playSuccessChime } from '../utils/sound';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const getFriendlyErrorMessage = (code: string, fallback: string): string => {
    switch (code) {
      case 'auth/email-already-in-use':
        return 'Цей email вже зареєстровано. Будь ласка, увійдіть.';
      case 'auth/invalid-email':
        return 'Введено некоректний формат email адреси.';
      case 'auth/weak-password':
        return 'Пароль занадто простий. Він має містити щонайменше 6 символів.';
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'Невірний email або пароль. Перевірте введені дані.';
      case 'auth/popup-closed-by-user':
        return 'Вікно авторизації було закрито.';
      case 'auth/unauthorized-domain':
        return 'Домен вашого сайту ще не додано до списку дозволених у Firebase Console. Додайте його в Authentication -> Settings -> Authorized domains.';
      case 'auth/operation-not-allowed':
        return 'Вхід за Email/Паролем потребує активації в консолі Firebase. Рекомендуємо скористатися входом через Google!';
      default:
        return fallback || 'Сталася помилка при авторизації. Спробуйте ще раз.';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (mode === 'register') {
      if (!displayName.trim()) {
        setError("Будь ласка, вкажіть ваше ім'я.");
        return;
      }
      if (password.length < 6) {
        setError('Пароль має містити щонайменше 6 символів.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Паролі не співпадають.');
        return;
      }
    }

    setLoading(true);

    try {
      if (mode === 'register') {
        const userCred = await createUserWithEmailAndPassword(auth, email.trim(), password);
        if (displayName.trim()) {
          await updateProfile(userCred.user, { displayName: displayName.trim() });
        }
      } else {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      }
      playSuccessChime();
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(getFriendlyErrorMessage(err?.code, err?.message));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      playSuccessChime();
      onClose();
    } catch (err: any) {
      console.warn(err);
      if (err?.code !== 'auth/popup-closed-by-user') {
        setError(getFriendlyErrorMessage(err?.code, err?.message));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGuestSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInAnonymously(auth);
      playSuccessChime();
      onClose();
    } catch (err: any) {
      console.error(err);
      setError('Гостьовий вхід зараз недоступний. Скористайтеся входом через Google.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
    >
      <div
        onClick={e => e.stopPropagation()}
        className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl p-6 sm:p-7 text-slate-100 relative"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white tracking-tight">
            {mode === 'login' ? 'Вхід до облікового запису' : 'Створення облікового запису'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {mode === 'login'
              ? 'Увійдіть, щоб зберігати улюблені ігри та історію підбору'
              : 'Зареєструйтесь для персональних рекомендацій настілок'}
          </p>
        </div>

        {/* Tab Toggle (Вхід / Реєстрація) */}
        <div className="flex p-1 bg-slate-950/70 border border-slate-800 rounded-xl mb-5">
          <button
            type="button"
            onClick={() => {
              setError(null);
              setMode('login');
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors ${
              mode === 'login'
                ? 'bg-slate-800 text-amber-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Вхід
          </button>
          <button
            type="button"
            onClick={() => {
              setError(null);
              setMode('register');
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors ${
              mode === 'register'
                ? 'bg-slate-800 text-amber-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Реєстрація
          </button>
        </div>

        {/* Fast Google Auth Button */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          type="button"
          className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 rounded-xl text-xs font-medium text-white transition-colors flex items-center justify-center gap-2 mb-4"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Продовжити через Google (Швидкий вхід)</span>
        </button>

        {/* Divider */}
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-800" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-slate-900 px-2 text-slate-400">або за email</span>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Email & Password Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {mode === 'register' && (
            <div>
              <label className="block text-slate-300 mb-1 font-medium">Ваше ім'я або нікнейм</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  placeholder="Олександр"
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-slate-300 mb-1 font-medium">Email адреса</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="example@gmail.com"
                className="w-full bg-slate-950/80 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 mb-1 font-medium">Пароль (мін. 6 символів)</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950/80 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-slate-300 mb-1 font-medium">Підтвердіть пароль</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 font-semibold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/10 mt-2"
          >
            <span>{loading ? 'Обробка...' : mode === 'login' ? 'Увійти' : 'Зареєструватися'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Guest fallback button */}
        <div className="mt-4 pt-3 border-t border-slate-800 text-center">
          <button
            type="button"
            onClick={handleGuestSignIn}
            disabled={loading}
            className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
          >
            Продовжити як гість (без реєстрації)
          </button>
        </div>
      </div>
    </div>
  );
};
