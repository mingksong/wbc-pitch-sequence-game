import { useLanguage } from '../i18n/LanguageContext';

interface ModeSelectProps {
  onSelectMode: (mode: 'japan' | 'dom' | 'scenario') => void;
}

export default function ModeSelect({ onSelectMode }: ModeSelectProps) {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 flex flex-col items-center justify-center px-6 text-center">
      {/* Top decorative line */}
      <div className="w-24 h-0.5 bg-amber-500 mb-8 rounded-full" />

      {/* Title */}
      <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-3 leading-tight">
        {t('mode.title')}
      </h1>

      {/* Subtitle */}
      <p className="text-lg sm:text-xl text-amber-400 font-semibold mb-10">
        {t('mode.subtitle')}
      </p>

      {/* Mode cards */}
      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-lg mb-10">
        {/* Japan Mode */}
        <button
          onClick={() => onSelectMode('japan')}
          className="flex-1 relative p-5 rounded-2xl border-2 border-slate-700 bg-slate-800/60 hover:border-blue-500 hover:bg-slate-800/90 hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] text-left"
        >
          <div className="text-3xl mb-3">🇰🇷 vs 🇯🇵</div>
          <div className="text-white font-black text-xl mb-1">{t('mode.japan.title')}</div>
          <div className="text-slate-300 text-sm font-semibold mb-2">
            {t('mode.japan.desc')}
          </div>
          <div className="text-slate-500 text-xs">{t('mode.japan.meta')}</div>
        </button>

        {/* DOM Mode */}
        <button
          onClick={() => onSelectMode('dom')}
          className="flex-1 relative p-5 rounded-2xl border-2 border-slate-700 bg-slate-800/60 hover:border-amber-500 hover:bg-slate-800/90 hover:shadow-lg hover:shadow-amber-500/20 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] text-left"
        >
          {/* NEW badge */}
          <div className="absolute -top-2 -right-2 bg-amber-500 text-slate-900 text-xs font-black px-2 py-0.5 rounded-full">
            NEW
          </div>
          <div className="text-3xl mb-3">🇰🇷 vs 🇩🇴</div>
          <div className="text-white font-black text-xl mb-1">{t('mode.dom.title')}</div>
          <div className="text-slate-300 text-sm font-semibold mb-2">
            {t('mode.dom.desc')}
          </div>
          <div className="text-slate-500 text-xs">{t('mode.dom.meta')}</div>
        </button>
      </div>

      {/* Scenario Mode */}
      <div className="w-full max-w-lg mb-10">
        <button
          onClick={() => onSelectMode('scenario')}
          className="w-full relative p-5 rounded-2xl border-2 border-slate-700 bg-slate-800/60 hover:border-emerald-500 hover:bg-slate-800/90 hover:shadow-lg hover:shadow-emerald-500/20 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] text-left"
        >
          <div className="absolute -top-2 -right-2 bg-emerald-500 text-slate-900 text-xs font-black px-2 py-0.5 rounded-full">
            NEW
          </div>
          <div className="text-3xl mb-3">🎬</div>
          <div className="text-white font-black text-xl mb-1">{t('mode.scenario.title')}</div>
          <div className="text-slate-300 text-sm font-semibold mb-2">
            {t('mode.scenario.desc')}
          </div>
          <div className="text-slate-500 text-xs">{t('mode.scenario.meta')}</div>
        </button>
      </div>

      {/* Bottom note */}
      <div className="text-slate-600 text-xs">
        {t('mode.footer')}
      </div>
    </div>
  );
}
