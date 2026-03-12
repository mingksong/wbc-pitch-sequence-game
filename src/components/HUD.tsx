import type { GameScenario, GameMode } from '../data/types';
import { useLanguage } from '../i18n/LanguageContext';

interface HUDProps {
  scenario?: GameScenario;
  balls: number;
  strikes: number;
  outs: number;
  currentAtBat: number;
  totalAtBats: number;
  pitcherName: string;
  batterName?: string;
  gameMode?: GameMode;
}

function CountDots({
  label,
  count,
  max,
  activeColor,
}: {
  label: string;
  count: number;
  max: number;
  activeColor: string;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[10px] text-slate-400 font-mono w-3">{label}</span>
      {Array.from({ length: max }, (_, i) => (
        <div
          key={i}
          className={`w-3 h-3 rounded-full ${
            i < count ? activeColor : 'bg-slate-700'
          }`}
        />
      ))}
    </div>
  );
}

export default function HUD({
  scenario,
  balls,
  strikes,
  outs,
  currentAtBat,
  totalAtBats,
  pitcherName,
  batterName,
  gameMode,
}: HUDProps) {
  const { t } = useLanguage();
  const isDom = gameMode === 'dom';

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-slate-900/90 backdrop-blur-sm border-b border-slate-700/50 px-4 py-2">
      <div className="max-w-lg mx-auto flex items-center justify-between text-sm">
        {/* Score / flags */}
        {isDom ? (
          <div className="flex items-center gap-1">
            <span className="text-blue-400 font-bold">🇰🇷</span>
            <span className="text-slate-500">vs</span>
            <span className="text-red-400 font-bold">🇩🇴</span>
          </div>
        ) : (
          <div className="flex items-center gap-1">
            <span className="text-blue-400 font-bold">{t('hud.kor')} {scenario?.scoreKor}</span>
            <span className="text-slate-500">-</span>
            <span className="text-red-400 font-bold">{scenario?.scoreJpn} {t('hud.jpn')}</span>
          </div>
        )}

        {/* Inning / at-bat order */}
        {isDom ? (
          <div className="text-slate-300 text-xs">
            {t('hud.battingOrder').replace('{current}', String(currentAtBat)).replace('{total}', String(totalAtBats))}
          </div>
        ) : (
          <div className="text-slate-300 text-xs">
            {t('hud.inning').replace('{n}', String(scenario?.inning))} {scenario?.halfInning === 'top' ? t('hud.top') : t('hud.bottom')}
          </div>
        )}

        {/* Count */}
        <div className="flex flex-col gap-0.5">
          <CountDots label="B" count={balls} max={4} activeColor="bg-green-500" />
          <CountDots label="S" count={strikes} max={3} activeColor="bg-yellow-500" />
          {!isDom && <CountDots label="O" count={outs} max={3} activeColor="bg-red-500" />}
        </div>

        {/* Pitcher/Batter + progress */}
        <div className="text-right">
          {batterName && (
            <p className="text-amber-400 text-xs font-bold">vs {batterName}</p>
          )}
          <p className="text-white text-xs font-medium">{pitcherName}</p>
          {!isDom && (
            <p className="text-slate-400 text-[10px]">{t('hud.atBatProgress').replace('{current}', String(currentAtBat)).replace('{total}', String(totalAtBats))}</p>
          )}
        </div>
      </div>
    </div>
  );
}
