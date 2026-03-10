import type { Zone } from '../data/types';

interface ZoneHeatmapProps {
  onZoneSelect?: (zone: Zone) => void;
  selectedZone?: Zone | null;
  interactive?: boolean;
  size?: 'sm' | 'md' | 'lg';
  batSide: 'L' | 'R';
}

const SIZE_MAP = {
  sm: { cell: 'w-10 h-10 text-[10px]', shadow: 'w-10 h-8 text-[10px]', sideW: 'w-8', gap: 'gap-0.5' },
  md: { cell: 'w-14 h-14 text-xs', shadow: 'w-14 h-10 text-[10px]', sideW: 'w-10', gap: 'gap-1' },
  lg: { cell: 'w-20 h-20 text-sm', shadow: 'w-20 h-12 text-xs', sideW: 'w-12', gap: 'gap-1' },
};

// Zone labels from pitcher's perspective
const ZONE_LABELS: Record<number, string> = {
  1: '높은\n글러브', 2: '높은\n가운데', 3: '높은\n팔쪽',
  4: '중간\n글러브', 5: '한가운데', 6: '중간\n팔쪽',
  7: '낮은\n글러브', 8: '낮은\n가운데', 9: '낮은\n팔쪽',
  11: '하이볼', 12: '로우볼', 13: '왼쪽\n유인구', 14: '오른쪽\n유인구',
};

function ZoneButton({
  zone,
  sizeClass,
  interactive,
  selected,
  onSelect,
  isShadow,
  label,
}: {
  zone: Zone;
  sizeClass: string;
  interactive: boolean;
  selected: boolean;
  onSelect?: (zone: Zone) => void;
  isShadow: boolean;
  label: string;
}) {
  const baseColor = isShadow
    ? 'bg-slate-800/60 border border-dashed border-slate-600'
    : 'bg-slate-700/80 border border-slate-600';
  const borderClass = selected
    ? 'ring-2 ring-amber-400 ring-offset-1 ring-offset-slate-900'
    : '';
  const hoverClass = interactive
    ? 'cursor-pointer hover:bg-slate-600 hover:scale-105 transition-all duration-100 active:scale-95'
    : '';

  return (
    <button
      type="button"
      disabled={!interactive}
      onClick={() => onSelect?.(zone)}
      className={`${sizeClass} ${baseColor} ${borderClass} ${hoverClass} rounded flex flex-col items-center justify-center leading-tight text-slate-300 whitespace-pre-line`}
    >
      <span className="font-medium">{label}</span>
    </button>
  );
}

export default function ZoneHeatmap({
  onZoneSelect,
  selectedZone = null,
  interactive = false,
  size = 'md',
  batSide,
}: ZoneHeatmapProps) {
  const s = SIZE_MAP[size];

  // Pitcher's perspective: mirror horizontally from catcher view
  // Catcher [1,2,3] → Pitcher [3,2,1]
  const strikeRows: Zone[][] = [
    [3, 2, 1],
    [6, 5, 4],
    [9, 8, 7],
  ];

  // 인코스/아웃코스 labels based on batter handedness
  // From pitcher's view:
  //   Pitcher's left (our grid left) = 3B side
  //   Pitcher's right (our grid right) = 1B side
  // RHB stands on 1B side → 인코스 = right, 아웃코스 = left
  // LHB stands on 3B side → 인코스 = left, 아웃코스 = right
  const leftLabel = batSide === 'L' ? '인코스' : '아웃코스';
  const rightLabel = batSide === 'L' ? '아웃코스' : '인코스';

  return (
    <div className="inline-flex flex-col items-center">
      {/* Pitcher's view label */}
      <p className="text-slate-500 text-[10px] mb-2 tracking-wider">PITCHER VIEW</p>

      {/* Shadow top: zone 11 하이볼 */}
      <div className={`flex ${s.gap} justify-center mb-1`}>
        <ZoneButton
          zone={11}
          sizeClass={`${s.shadow} w-full min-w-[100px]`}
          interactive={interactive}
          selected={selectedZone === 11}
          onSelect={onZoneSelect}
          isShadow
          label={ZONE_LABELS[11]}
        />
      </div>

      {/* Main grid with side shadow zones */}
      <div className={`flex items-center ${s.gap}`}>
        {/* Left shadow: zone 13 왼쪽 유인구 */}
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-[9px] text-slate-500 mb-0.5">{leftLabel}</span>
          <ZoneButton
            zone={13}
            sizeClass={`${s.sideW} h-full min-h-[100px]`}
            interactive={interactive}
            selected={selectedZone === 13}
            onSelect={onZoneSelect}
            isShadow
            label={ZONE_LABELS[13]}
          />
        </div>

        {/* Strike zone 3x3 */}
        <div className={`flex flex-col ${s.gap}`}>
          {strikeRows.map((row, ri) => (
            <div key={ri} className={`flex ${s.gap}`}>
              {row.map((zone) => (
                <ZoneButton
                  key={zone}
                  zone={zone}
                  sizeClass={s.cell}
                  interactive={interactive}
                  selected={selectedZone === zone}
                  onSelect={onZoneSelect}
                  isShadow={false}
                  label={ZONE_LABELS[zone]}
                />
              ))}
            </div>
          ))}
        </div>

        {/* Right shadow: zone 14 오른쪽 유인구 */}
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-[9px] text-slate-500 mb-0.5">{rightLabel}</span>
          <ZoneButton
            zone={14}
            sizeClass={`${s.sideW} h-full min-h-[100px]`}
            interactive={interactive}
            selected={selectedZone === 14}
            onSelect={onZoneSelect}
            isShadow
            label={ZONE_LABELS[14]}
          />
        </div>
      </div>

      {/* Shadow bottom: zone 12 로우볼 */}
      <div className={`flex ${s.gap} justify-center mt-1`}>
        <ZoneButton
          zone={12}
          sizeClass={`${s.shadow} w-full min-w-[100px]`}
          interactive={interactive}
          selected={selectedZone === 12}
          onSelect={onZoneSelect}
          isShadow
          label={ZONE_LABELS[12]}
        />
      </div>

      {/* Batter side indicator */}
      <p className="text-slate-500 text-[10px] mt-2">
        {batSide === 'L' ? '좌타자' : '우타자'} 상대 중
      </p>
    </div>
  );
}
