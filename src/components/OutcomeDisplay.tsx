import type { PitchOutcome, Zone, BatterProfile, Difficulty } from '../data/types';
import { useLanguage } from '../i18n/LanguageContext';

interface OutcomeDisplayProps {
  outcome: PitchOutcome;
  pitchCode: string;
  zone: Zone;
  actualZone?: Zone;
  difficulty?: Difficulty;
  batterProfile: BatterProfile;
  balls: number;
  strikes: number;
  onNext: () => void;
}

function getOutcomeStyle(outcome: PitchOutcome, t: (key: string) => string): { bg: string; text: string; label: string; desc: string } {
  switch (outcome) {
    case 'called_strike':
      return { bg: 'bg-green-900/80', text: 'text-green-400', label: t('outcome.called_strike'), desc: t('outcome.called_strike.desc') };
    case 'swinging_strike':
      return { bg: 'bg-green-900/80', text: 'text-green-300', label: t('outcome.swinging_strike'), desc: t('outcome.swinging_strike.desc') };
    case 'foul':
      return { bg: 'bg-yellow-900/80', text: 'text-yellow-400', label: t('outcome.foul'), desc: t('outcome.foul.desc') };
    case 'ball':
      return { bg: 'bg-yellow-900/80', text: 'text-yellow-300', label: t('outcome.ball'), desc: t('outcome.ball.desc') };
    case 'single':
      return { bg: 'bg-red-900/80', text: 'text-red-400', label: t('outcome.single'), desc: t('outcome.single.desc') };
    case 'double':
      return { bg: 'bg-red-900/80', text: 'text-red-300', label: t('outcome.double'), desc: t('outcome.double.desc') };
    case 'triple':
      return { bg: 'bg-red-900/80', text: 'text-red-200', label: t('outcome.triple'), desc: t('outcome.triple.desc') };
    case 'homerun':
      return { bg: 'bg-red-900/90', text: 'text-red-100', label: t('outcome.homerun'), desc: t('outcome.homerun.desc') };
    case 'groundout':
      return { bg: 'bg-green-900/80', text: 'text-green-400', label: t('outcome.groundout'), desc: t('outcome.groundout.desc') };
    case 'flyout':
      return { bg: 'bg-green-900/80', text: 'text-green-400', label: t('outcome.flyout'), desc: t('outcome.flyout.desc') };
    case 'lineout':
      return { bg: 'bg-green-900/80', text: 'text-green-300', label: t('outcome.lineout'), desc: t('outcome.lineout.desc') };
  }
}

function getZoneLabel(zone: Zone, t: (key: string) => string): string {
  return t('zone.' + zone) || t('zone.fallback').replace('{n}', String(zone));
}

function getInsight(
  outcome: PitchOutcome,
  pitchCode: string,
  zone: Zone,
  batter: BatterProfile,
  t: (k: string) => string,
  pName: (nameKo: string, id: string) => string,
  ptName: (code: string) => string,
): string {
  const zoneStats = batter.zones[zone];
  const pitchStats = batter.pitchTypeStats[pitchCode];
  const pitch = ptName(pitchCode);
  const batterName = pName(batter.nameKo, batter.id);

  if (['single', 'double', 'triple', 'homerun'].includes(outcome)) {
    return t('insight.hitZone')
      .replace('{batter}', batterName)
      .replace('{woba}', (zoneStats.wOBA * 1000).toFixed(0))
      .replace('{pitch}', pitch);
  }
  if (outcome === 'swinging_strike') {
    const whiff = pitchStats ? (pitchStats.whiffRate * 100).toFixed(0) : '??';
    return t('insight.whiff').replace('{pitch}', pitch).replace('{rate}', whiff);
  }
  if (outcome === 'called_strike') {
    return t('insight.calledStrike').replace('{zone}', getZoneLabel(zone, t));
  }
  if (outcome === 'ball') {
    return t('insight.ball').replace('{zone}', getZoneLabel(zone, t));
  }
  if (['groundout', 'flyout', 'lineout'].includes(outcome)) {
    return t('insight.outContact')
      .replace('{batter}', batterName)
      .replace('{pitch}', pitch)
      .replace('{rate}', (zoneStats.contactRate * 100).toFixed(0));
  }
  return t('insight.default').replace('{pitch}', pitch).replace('{zone}', getZoneLabel(zone, t));
}

export default function OutcomeDisplay({
  outcome,
  pitchCode,
  zone,
  actualZone,
  difficulty,
  batterProfile,
  balls,
  strikes,
  onNext,
}: OutcomeDisplayProps) {
  const { t, playerName, pitchName } = useLanguage();
  const style = getOutcomeStyle(outcome, t);
  const displayZone = actualZone ?? zone;
  const insight = getInsight(outcome, pitchCode, displayZone, batterProfile, t, playerName, pitchName);
  const pitchLabel = pitchName(pitchCode);
  const isMiss = difficulty === 'hard' && actualZone !== undefined && actualZone !== zone;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 flex flex-col items-center justify-center px-4 pt-16 pb-8">
      <div className={`${style.bg} border border-slate-700 rounded-2xl p-8 max-w-md w-full text-center`}>
        {/* Outcome label */}
        <h2 className={`text-4xl font-black ${style.text} mb-2`}>
          {style.label}
        </h2>
        <p className="text-slate-300 text-sm mb-4">{style.desc}</p>

        {/* Pitch info */}
        <div className="bg-slate-900/50 rounded-lg px-4 py-3 mb-4">
          <p className="text-slate-400 text-xs mb-1">{t('outcome.pitchInfo')}</p>
          <p className="text-white font-medium">
            {pitchLabel} - {getZoneLabel(displayZone, t)}
          </p>
          {isMiss && (
            <p className="text-red-400 text-xs mt-1">
              &#x26A0; {t('outcome.missWarning').replace('{target}', getZoneLabel(zone, t)).replace('{actual}', getZoneLabel(actualZone!, t))}
            </p>
          )}
        </div>

        {/* Current count */}
        <div className="flex justify-center gap-4 mb-4">
          <div className="text-center">
            <p className="text-xs text-slate-400">B</p>
            <p className="text-green-400 font-bold text-xl">{balls}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-slate-400">S</p>
            <p className="text-yellow-400 font-bold text-xl">{strikes}</p>
          </div>
        </div>

        {/* Insight */}
        <div className="bg-slate-800/60 rounded-lg px-4 py-3 mb-6">
          <p className="text-slate-300 text-sm leading-relaxed">{insight}</p>
        </div>

        {/* Next button */}
        <button
          onClick={onNext}
          className="w-full bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-900 font-bold text-lg py-3 rounded-xl transition-all duration-150"
        >
          {t('outcome.nextPitch')}
        </button>
      </div>
    </div>
  );
}
