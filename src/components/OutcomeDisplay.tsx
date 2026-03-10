import type { PitchOutcome, Zone, BatterProfile } from '../data/types';
import { getPitchNameKo } from '../utils/pitchColors';

interface OutcomeDisplayProps {
  outcome: PitchOutcome;
  pitchCode: string;
  zone: Zone;
  batterProfile: BatterProfile;
  balls: number;
  strikes: number;
  onNext: () => void;
}

function getOutcomeStyle(outcome: PitchOutcome): { bg: string; text: string; label: string; desc: string } {
  switch (outcome) {
    case 'called_strike':
      return { bg: 'bg-green-900/80', text: 'text-green-400', label: '스트라이크!', desc: '콜드 스트라이크' };
    case 'swinging_strike':
      return { bg: 'bg-green-900/80', text: 'text-green-300', label: '헛스윙!', desc: '삼진 낙낙' };
    case 'foul':
      return { bg: 'bg-yellow-900/80', text: 'text-yellow-400', label: '파울', desc: '가까스로 맞춤' };
    case 'ball':
      return { bg: 'bg-yellow-900/80', text: 'text-yellow-300', label: '볼', desc: '스트라이크 존 이탈' };
    case 'single':
      return { bg: 'bg-red-900/80', text: 'text-red-400', label: '안타!', desc: '1루타 허용' };
    case 'double':
      return { bg: 'bg-red-900/80', text: 'text-red-300', label: '2루타!', desc: '장타 허용' };
    case 'triple':
      return { bg: 'bg-red-900/80', text: 'text-red-200', label: '3루타!', desc: '대형 장타 허용' };
    case 'homerun':
      return { bg: 'bg-red-900/90', text: 'text-red-100', label: '홈런!!!', desc: '공이 관중석으로...' };
    case 'groundout':
      return { bg: 'bg-green-900/80', text: 'text-green-400', label: '땅볼 아웃!', desc: '유격수 앞 땅볼' };
    case 'flyout':
      return { bg: 'bg-green-900/80', text: 'text-green-400', label: '뜬공 아웃!', desc: '중견수 플라이' };
    case 'lineout':
      return { bg: 'bg-green-900/80', text: 'text-green-300', label: '라인드라이브 아웃!', desc: '쎄게 맞았지만 정면' };
  }
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

function getInsight(outcome: PitchOutcome, pitchCode: string, zone: Zone, batter: BatterProfile): string {
  const zoneStats = batter.zones[zone];
  const pitchStats = batter.pitchTypeStats[pitchCode];
  const pitchName = getPitchNameKo(pitchCode);

  if (['single', 'double', 'triple', 'homerun'].includes(outcome)) {
    return `${batter.nameKo}의 이 존 wOBA: .${(zoneStats.wOBA * 1000).toFixed(0)} - ${pitchName}에 강했습니다.`;
  }
  if (outcome === 'swinging_strike') {
    const whiff = pitchStats ? (pitchStats.whiffRate * 100).toFixed(0) : '??';
    return `${pitchName}에 대한 헛스윙률: ${whiff}% - 좋은 선택이었습니다!`;
  }
  if (outcome === 'called_strike') {
    return `${getZoneLabel(zone)}에 정확히 꽂혔습니다. 타자가 꼼짝 못했습니다.`;
  }
  if (outcome === 'ball') {
    return `${getZoneLabel(zone)} - 타자가 참았습니다. 카운트 관리에 주의하세요.`;
  }
  if (['groundout', 'flyout', 'lineout'].includes(outcome)) {
    return `${batter.nameKo}가 ${pitchName}을 맞췄지만 아웃. 이 존 컨택률: ${(zoneStats.contactRate * 100).toFixed(0)}%`;
  }
  return `${pitchName} ${getZoneLabel(zone)}`;
}

export default function OutcomeDisplay({
  outcome,
  pitchCode,
  zone,
  batterProfile,
  balls,
  strikes,
  onNext,
}: OutcomeDisplayProps) {
  const style = getOutcomeStyle(outcome);
  const insight = getInsight(outcome, pitchCode, zone, batterProfile);
  const pitchName = getPitchNameKo(pitchCode);

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
          <p className="text-slate-400 text-xs mb-1">투구 정보</p>
          <p className="text-white font-medium">
            {pitchName} - {getZoneLabel(zone)}
          </p>
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
          다음 투구
        </button>
      </div>
    </div>
  );
}
