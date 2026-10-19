import React, { useState } from 'react';
import { X, Copy, Check, Share2, Globe, Send, MessageCircle } from 'lucide-react';
import { playSuccessChime } from '../utils/sound';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  publicUrl: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  publicUrl,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    playSuccessChime();
    setTimeout(() => setCopied(false), 2500);
  };

  const shareText = encodeURIComponent('BoardMatch — Розумний підбір настільних ігор для ігрового вечора!');
  const encodedUrl = encodeURIComponent(publicUrl);

  const telegramShare = `https://t.me/share/url?url=${encodedUrl}&text=${shareText}`;
  const viberShare = `viber://forward?text=${shareText}%20${encodedUrl}`;
  const whatsappShare = `https://api.whatsapp.com/send?text=${shareText}%20${encodedUrl}`;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
    >
      <div
        onClick={e => e.stopPropagation()}
        className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl p-6 text-slate-100 relative space-y-5"
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">
              Поділитися сайтом
            </h2>
            <p className="text-xs text-slate-400">
              Надішліть друзям посилання для спільного підбору настілок
            </p>
          </div>
        </div>

        {/* Public link copy box */}
        <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2">
          <label className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-amber-400" />
            <span>Публічне посилання на додаток:</span>
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={publicUrl}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-200 select-all font-mono truncate focus:outline-none"
            />
            <button
              onClick={handleCopy}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors ${
                copied
                  ? 'bg-emerald-500 text-slate-950'
                  : 'bg-amber-400 hover:bg-amber-300 text-slate-950'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Скопійовано!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Копіювати</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Quick Social Share Buttons */}
        <div className="space-y-2">
          <span className="text-xs font-medium text-slate-400 block">
            Швидко надіслати в месенджери:
          </span>
          <div className="grid grid-cols-3 gap-2">
            <a
              href={telegramShare}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 rounded-xl flex items-center justify-center gap-1.5 text-xs text-sky-400 font-medium transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Telegram</span>
            </a>

            <a
              href={viberShare}
              className="p-2.5 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 rounded-xl flex items-center justify-center gap-1.5 text-xs text-purple-400 font-medium transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Viber</span>
            </a>

            <a
              href={whatsappShare}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 rounded-xl flex items-center justify-center gap-1.5 text-xs text-emerald-400 font-medium transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
