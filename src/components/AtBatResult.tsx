import type { BatterProfile, AtBatOutcome, PitchRecord, PitchOutcome } from '../data/types';
import { useLanguage } from '../i18n/LanguageContext';

interface AtBatResultProps {
  batter: BatterProfile;
  outcome: AtBatOutcome;
  pitchHistory: PitchRecord[];
  totalScore: number;
  scenarioActualResult: string;
  onNext: () => void;
  isLastAtBat: boolean;
}

function pitchEmoji(outcome: PitchOutcome): string {
  switch (outcome) {
    case 'swinging_strike':
    case 'called_strike':
    case 'groundout':
    case 'flyout':
    case 'lineout':
      return '\uD83D\uDFE2'; // green circle
    case 'foul':
    case 'ball':
      return '\uD83D\uDFE1'; // yellow circle
    case 'single':
    case 'double':
    case 'triple':
    case 'homerun':
      return '\uD83D\uDD34'; // red circle
  }
}

function outcomeLabel(outcome: AtBatOutcome, t: (k: string) => string): { text: string; color: string } {
  switch (outcome.type) {
    case 'strikeout':
      return { text: t('atBat.strikeout'), color: 'text-green-400' };
    case 'walk':
      return { text: t('atBat.walk'), color: 'text-yellow-400' };
    case 'out': {
      const key = 'atBat.' + outcome.result;
      return { text: t(key) || t('atBat.out'), color: 'text-green-400' };
    }
    case 'hit': {
      const key = 'atBat.' + outcome.result;
      return {
        text: t(key) || t('atBat.hit'),
        color: outcome.result === 'homerun' ? 'text-red-300' : 'text-red-400',
      };
    }
  }
}

function outcomeEmoji(outcome: AtBatOutcome): string {
  switch (outcome.type) {
    case 'strikeout': return 'K';
    case 'walk': return 'BB';
    case 'out': return 'OUT';
    case 'hit': {
      if (outcome.result === 'homerun') return 'HR';
      if (outcome.result === 'double') return '2B';
      if (outcome.result === 'triple') return '3B';
      return 'H';
    }
  }
}

export default function AtBatResult({
  batter,
  outcome,
  pitchHistory,
  totalScore,
  scenarioActualResult,
  onNext,
  isLastAtBat,
}: AtBatResultProps) {
  const { t, playerName, pitchName } = useLanguage();
  const { text, color } = outcomeLabel(outcome, t);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 flex flex-col items-center justify-center px-4 py-8">
      <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-6 max-w-md w-full text-center">
        {/* Batter name */}
        <p className="text-slate-400 text-sm mb-1">vs {playerName(batter.nameKo, batter.id)}</p>

        {/* Outcome */}
        <h2 className={`text-3xl font-black ${color} mb-1`}>{text}</h2>
        <div className="inline-block bg-slate-700 rounded-full px-3 py-1 text-white font-mono font-bold text-sm mb-4">
          {outcomeEmoji(outcome)}
        </div>

        {/* Pitch sequence */}
        <div className="bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-3 mb-4">
          <p className="text-xs text-slate-400 mb-2">{t('atBat.pitchSequence')}</p>
          <div className="flex items-center justify-center gap-1 mb-2 text-xl">
            {pitchHistory.map((p, i) => (
              <span key={i}>{pitchEmoji(p.outcome)}</span>
            ))}
          </div>
          <div className="flex flex-wrap justify-center gap-1">
            {pitchHistory.map((p, i) => (
              <span key={i} className="text-[10px] text-slate-500">
                {pitchName(p.pitchCode)}
              </span>
            ))}
          </div>
        </div>

        {/* Score */}
        <div className="bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-3 mb-4">
          <p className="text-xs text-slate-400 mb-1">{t('atBat.score')}</p>
          <p className="text-amber-400 font-black text-2xl">
            +{totalScore.toLocaleString()}
          </p>
        </div>

        {/* Actual result comparison (Japan mode only) */}
        {scenarioActualResult && (
          <div className="bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-3 mb-6">
            <p className="text-xs text-slate-400 mb-1">{t('atBat.actualResult')}</p>
            <p className="text-slate-200 text-sm font-medium">{scenarioActualResult}</p>
          </div>
        )}

        {/* Next button */}
        <button
          onClick={onNext}
          className="w-full bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-900 font-bold text-lg py-3.5 rounded-xl transition-all duration-150 shadow-lg shadow-amber-500/20"
        >
          {isLastAtBat ? t('atBat.viewFinal') : t('atBat.nextAtBat')}
        </button>
      </div>
    </div>
  );
}
