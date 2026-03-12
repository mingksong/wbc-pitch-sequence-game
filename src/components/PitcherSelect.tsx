import { useLanguage } from '../i18n/LanguageContext';
import type { KorPitcherProfile } from '../data/types';

interface PitcherSelectProps {
  pitchers: KorPitcherProfile[];
  onSelect: (pitcher: KorPitcherProfile) => void;
  onBack: () => void;
}

export default function PitcherSelect({ pitchers, onSelect, onBack }: PitcherSelectProps) {
  const { t, playerName } = useLanguage();

  function pitcherStyle(pitcher: KorPitcherProfile): string {
    const key = 'pitcher.style.' + pitcher.id;
    const val = t(key);
    return val !== key ? val : pitcher.style;
  }

  function pitcherDesc(pitcher: KorPitcherProfile): string {
    const key = 'pitcher.desc.' + pitcher.id;
    const val = t(key);
    return val !== key ? val : pitcher.description;
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
          <span>{t('pitcher.back')}</span>
        </button>
      </div>

      {/* Header */}
      <div className="text-center mb-8 w-full max-w-lg">
        <div className="w-16 h-0.5 bg-amber-500 mx-auto mb-6 rounded-full" />
        <h1 className="text-3xl font-black text-white mb-2">{t('pitcher.title')}</h1>
        <p className="text-slate-400 text-sm">{t('pitcher.subtitle')}</p>
      </div>

      {/* Pitcher cards */}
      <div className="w-full max-w-lg flex flex-col gap-3">
        {pitchers.map((pitcher) => (
          <button
            key={pitcher.id}
            onClick={() => onSelect(pitcher)}
            className="w-full p-4 rounded-2xl border border-slate-700 bg-slate-800/60 hover:border-amber-500/60 hover:bg-slate-800/90 hover:shadow-lg hover:shadow-amber-500/10 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] text-left"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-white font-black text-lg">{playerName(pitcher.nameKo, pitcher.id)}</span>
                {/* Hand indicator */}
                <span
                  className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                    pitcher.hand === 'R'
                      ? 'bg-blue-500/20 text-blue-400'
                      : 'bg-red-500/20 text-red-400'
                  }`}
                >
                  {t(pitcher.hand === 'R' ? 'pitcher.rightHand' : 'pitcher.leftHand')}
                </span>
              </div>
              {/* Style badge */}
              <span className="text-xs font-semibold bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full">
                {pitcherStyle(pitcher)}
              </span>
            </div>

            {/* Description */}
            <p className="text-slate-400 text-sm mb-3 leading-relaxed">{pitcherDesc(pitcher)}</p>

            {/* Pitch repertoire */}
            <div className="flex flex-wrap gap-1.5">
              {pitcher.pitches.map((pitch) => (
                <span
                  key={pitch.code}
                  className="text-xs bg-slate-700/80 text-slate-300 px-2 py-0.5 rounded font-mono"
                >
                  {pitch.code} {pitch.avgSpeed}
                </span>
              ))}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
