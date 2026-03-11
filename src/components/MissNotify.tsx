import { useEffect } from 'react';
import type { Zone } from '../data/types';

interface MissNotifyProps {
  targetZone: Zone;
  actualZone: Zone;
  onDone: () => void;
}

function getZoneLabel(zone: Zone): string {
  const labels: Record<number, string> = {
    1: '높은 안쪽', 2: '높은 가운데', 3: '높은 바깥',
    4: '중간 안쪽', 5: '한가운데', 6: '중간 바깥',
    7: '낮은 안쪽', 8: '낮은 가운데', 9: '낮은 바깥',
    11: '하이볼', 12: '로우볼',
    13: '왼쪽 유인구', 14: '오른쪽 유인구',
  };
  return labels[zone] || `존 ${zone}`;
}

export default function MissNotify({ targetZone, actualZone, onDone }: MissNotifyProps) {
  // Auto-dismiss after 1.5 seconds
  useEffect(() => {
    const timer = setTimeout(onDone, 1500);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 flex flex-col items-center justify-center px-4 cursor-pointer"
      onClick={onDone}
    >
      <div className="bg-red-900/60 border-2 border-red-500/50 rounded-2xl p-8 max-w-sm w-full text-center animate-bounce">
        <p className="text-4xl mb-3">&#x1F62C;</p>
        <h2 className="text-2xl font-black text-red-300 mb-2">
          빗나갔다!
        </h2>
        <p className="text-slate-300 text-sm mb-4">
          투수가 목표한 곳에 못 던졌습니다
        </p>
        <div className="bg-slate-900/50 rounded-lg px-4 py-3">
          <div className="flex items-center justify-center gap-3 text-sm">
            <div>
              <p className="text-slate-500 text-xs">목표</p>
              <p className="text-slate-300 font-medium">{getZoneLabel(targetZone)}</p>
            </div>
            <span className="text-red-400 text-lg">&#x2192;</span>
            <div>
              <p className="text-slate-500 text-xs">실제</p>
              <p className="text-red-400 font-bold">{getZoneLabel(actualZone)}</p>
            </div>
          </div>
        </div>
      </div>
      <p className="text-slate-600 text-xs mt-4">탭하여 계속</p>
    </div>
  );
}
