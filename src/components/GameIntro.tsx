import React from 'react';
import { useLanguage } from '../i18n/LanguageContext';

interface GameIntroProps {
  onStart: () => void;
}

export default function GameIntro({ onStart }: GameIntroProps) {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 flex flex-col items-center justify-center px-6 text-center">
      {/* Top decorative line */}
      <div className="w-24 h-0.5 bg-amber-500 mb-8 rounded-full" />

      {/* Title */}
      <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-3 leading-tight">
        {t('intro.title')}
      </h1>

      {/* Subtitle */}
      <p className="text-lg sm:text-xl text-amber-400 font-semibold mb-6">
        {t('intro.subtitle')}
      </p>

      {/* Description */}
      <p className="text-slate-300 text-base sm:text-lg max-w-md mb-8 leading-relaxed">
        {t('intro.desc').split('\n').map((line, i, arr) => (
          <React.Fragment key={i}>
            {line}
            {i < arr.length - 1 && <br />}
          </React.Fragment>
        ))}
      </p>

      {/* Opponents */}
      <div className="bg-slate-800/60 border border-slate-700 rounded-xl px-6 py-4 mb-10 max-w-sm w-full">
        <p className="text-xs text-slate-400 uppercase tracking-widest mb-2">
          {t('intro.opponentLabel')}
        </p>
        <p className="text-white font-bold text-lg tracking-wide">
          {t('intro.opponentNames')}
        </p>
      </div>

      {/* Start button */}
      <button
        onClick={onStart}
        className="bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-900 font-bold text-xl px-12 py-4 rounded-2xl transition-all duration-150 shadow-lg shadow-amber-500/20 hover:shadow-amber-400/30 hover:scale-[1.02] active:scale-[0.98]"
      >
        {t('intro.startButton')}
      </button>

      {/* Bottom decorative */}
      <div className="mt-12 text-slate-600 text-xs">
        {t('intro.footer')}
      </div>
    </div>
  );
}
