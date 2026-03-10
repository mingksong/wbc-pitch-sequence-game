import type { GameScenario } from '../data/types';

interface HUDProps {
  scenario: GameScenario;
  balls: number;
  strikes: number;
  outs: number;
  currentAtBat: number;
  totalAtBats: number;
  pitcherName: string;
  batterName?: string;
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
}: HUDProps) {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-slate-900/90 backdrop-blur-sm border-b border-slate-700/50 px-4 py-2">
      <div className="max-w-lg mx-auto flex items-center justify-between text-sm">
        {/* Score */}
        <div className="flex items-center gap-1">
          <span className="text-blue-400 font-bold">한 {scenario.scoreKor}</span>
          <span className="text-slate-500">-</span>
          <span className="text-red-400 font-bold">{scenario.scoreJpn} 일</span>
        </div>

        {/* Inning */}
        <div className="text-slate-300 text-xs">
          {scenario.inning}회{scenario.halfInning === 'top' ? '초' : '말'}
        </div>

        {/* Count */}
        <div className="flex flex-col gap-0.5">
          <CountDots label="B" count={balls} max={4} activeColor="bg-green-500" />
          <CountDots label="S" count={strikes} max={3} activeColor="bg-yellow-500" />
          <CountDots label="O" count={outs} max={3} activeColor="bg-red-500" />
        </div>

        {/* Pitcher/Batter + progress */}
        <div className="text-right">
          {batterName && (
            <p className="text-amber-400 text-xs font-bold">vs {batterName}</p>
          )}
          <p className="text-white text-xs font-medium">{pitcherName}</p>
          <p className="text-slate-400 text-[10px]">{currentAtBat} / {totalAtBats} 타석</p>
        </div>
      </div>
    </div>
  );
}
