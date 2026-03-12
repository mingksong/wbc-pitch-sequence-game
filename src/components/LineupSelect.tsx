import { useLanguage } from '../i18n/LanguageContext';
import type { DomLineup, BatterProfile } from '../data/types';

interface LineupSelectProps {
  lineups: DomLineup[];
  batterProfiles: Record<string, BatterProfile>;
  onSelect: (lineup: DomLineup) => void;
  onBack: () => void;
}

export default function LineupSelect({ lineups, batterProfiles, onSelect, onBack }: LineupSelectProps) {
  const { t, lang, playerName } = useLanguage();

  function lineupName(lineup: DomLineup): string {
    return lang === 'en' ? lineup.name : lineup.nameKo;
  }

  function lineupDesc(lineup: DomLineup): string {
    const key = 'lineup.desc.' + lineup.id;
    const val = t(key);
    return val !== key ? val : lineup.description;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 flex flex-col items-center px-4 py-8">
      {/* Back button */}
      <div className="w-full max-w-lg mb-6 flex items-center">
        <button
          onClick={onBack}
          className="text-slate-400 hover:text-white transition-colors text-sm flex items-center gap-1"
        >
          <span>&#8592;</span>
          <span>{t('lineup.back')}</span>
        </button>
      </div>

      {/* Header */}
      <div className="text-center mb-8 w-full max-w-lg">
        <div className="w-16 h-0.5 bg-amber-500 mx-auto mb-6 rounded-full" />
        <h1 className="text-3xl font-black text-white mb-2">{t('lineup.title')}</h1>
        <p className="text-slate-400 text-sm">{t('lineup.subtitle')}</p>
      </div>

      {/* Lineup cards */}
      <div className="w-full max-w-lg flex flex-col gap-4">
        {lineups.map((lineup) => (
          <button
            key={lineup.id}
            onClick={() => onSelect(lineup)}
            className="w-full p-5 rounded-2xl border border-slate-700 bg-slate-800/60 hover:border-amber-500/60 hover:bg-slate-800/90 hover:shadow-lg hover:shadow-amber-500/10 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] text-left"
          >
            {/* Lineup name & description */}
            <div className="mb-3">
              <h2 className="text-white font-black text-xl mb-1">{lineupName(lineup)}</h2>
              <p className="text-slate-400 text-sm">{lineupDesc(lineup)}</p>
            </div>

            {/* Divider */}
            <div className="w-full h-px bg-slate-700 mb-3" />

            {/* 9 batters */}
            <div className="grid grid-cols-1 gap-1">
              {lineup.batterIds.map((batterId, index) => {
                const batter = batterProfiles[batterId];
                if (!batter) return null;
                return (
                  <div key={batterId} className="flex items-center gap-2 text-sm">
                    <span className="text-slate-500 font-mono w-4 text-right flex-shrink-0">
                      {index + 1}
                    </span>
                    <span className="text-white font-semibold flex-1">{playerName(batter.nameKo, batterId)}</span>
                    <span
                      className={`text-xs font-bold px-1.5 py-0.5 rounded flex-shrink-0 ${
                        batter.bats === 'R'
                          ? 'bg-blue-500/20 text-blue-400'
                          : batter.bats === 'L'
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-purple-500/20 text-purple-400'
                      }`}
                    >
                      {batter.bats}
                    </span>
                  </div>
                );
              })}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
