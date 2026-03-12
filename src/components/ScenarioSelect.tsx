import { useLanguage } from '../i18n/LanguageContext';
import type { ScenarioMode } from '../data/lorenzenScenarios';

interface ScenarioSelectProps {
  scenarios: ScenarioMode[];
  onSelect: (scenario: ScenarioMode) => void;
  onBack: () => void;
}

export default function ScenarioSelect({ scenarios, onSelect, onBack }: ScenarioSelectProps) {
  const { t, lang } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 flex flex-col items-center justify-center px-4 py-8">
      <div className="max-w-md w-full">
        {/* Back button */}
        <button
          onClick={onBack}
          className="text-slate-400 hover:text-white text-sm mb-6 flex items-center gap-1 transition-colors"
        >
          {t('scenario.backToMode')}
        </button>

        <h2 className="text-2xl font-black text-white mb-2 text-center">{t('scenario.title')}</h2>
        <p className="text-slate-400 text-sm mb-6 text-center">
          {t('scenario.subtitle')}
        </p>

        <div className="space-y-3">
          {scenarios.map((sc) => (
            <button
              key={sc.id}
              onClick={() => onSelect(sc)}
              className="w-full p-5 rounded-2xl border-2 border-slate-700 bg-slate-800/60 hover:border-emerald-500 hover:bg-slate-800/90 hover:shadow-lg hover:shadow-emerald-500/20 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] text-left"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="text-2xl mb-1">{sc.flag} vs {sc.opponentFlag}</div>
                  <div className="text-white font-black text-lg">{lang === 'ko' ? sc.nameKo : sc.name}</div>
                </div>
                <div className="text-right">
                  <div className="text-slate-500 text-xs">{sc.matchDate}</div>
                  <div className="text-emerald-400 text-xs font-semibold">
                    {(() => { const k = 'scenario.matchResult.' + sc.id; const v = t(k); return v !== k ? v : sc.matchResult; })()}
                  </div>
                </div>
              </div>
              <p className="text-slate-300 text-sm mb-2">
                {lang === 'ko' ? sc.description : (t('scenario.desc.' + sc.id) || sc.description)}
              </p>
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span>{(() => { const k = 'scenario.pitcherLine.' + sc.id; const v = t(k); return v !== k ? v : sc.pitcherLine; })()}</span>
                <span>|</span>
                <span>{t('scenario.randomAtBats').replace('{n}', String(sc.selectCount))}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Coming soon placeholder */}
        <div className="mt-4 p-4 rounded-xl border border-dashed border-slate-700 text-center">
          <p className="text-slate-600 text-sm">{t('scenario.comingSoon')}</p>
        </div>
      </div>
    </div>
  );
}
