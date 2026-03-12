import type { Difficulty, GameMode } from '../data/types';

interface DifficultySelectProps {
  gameMode: GameMode;
  onSelect: (difficulty: Difficulty) => void;
  onBack: () => void;
}

export default function DifficultySelect({ gameMode, onSelect, onBack }: DifficultySelectProps) {
  const modeLabel = gameMode === 'japan' ? '한일전' : gameMode === 'scenario' ? '시나리오' : '도미니카';

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 flex flex-col items-center justify-center px-6 text-center">
      <div className="w-24 h-0.5 bg-amber-500 mb-8 rounded-full" />

      <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-2">
        난이도 선택
      </h1>
      <p className="text-slate-400 text-sm mb-8">
        {modeLabel} 모드
      </p>

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-lg mb-8">
        {/* Normal Mode */}
        <button
          onClick={() => onSelect('normal')}
          className="flex-1 p-5 rounded-2xl border-2 border-slate-700 bg-slate-800/60 hover:border-blue-500 hover:bg-slate-800/90 hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] text-left"
        >
          <div className="text-3xl mb-3">&#x26BE;</div>
          <div className="text-white font-black text-xl mb-2">일반 모드</div>
          <div className="text-slate-400 text-sm space-y-1">
            <p>&#x2022; 현재와 동일한 난이도</p>
            <p>&#x2022; 모든 투구가 정확히 목표 존에 도달</p>
            <p>&#x2022; 같은 구종/존 반복 패널티 없음</p>
          </div>
        </button>

        {/* Hard Mode */}
        <button
          onClick={() => onSelect('hard')}
          className="flex-1 relative p-5 rounded-2xl border-2 border-slate-700 bg-slate-800/60 hover:border-red-500 hover:bg-slate-800/90 hover:shadow-lg hover:shadow-red-500/20 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] text-left"
        >
          <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-black px-2 py-0.5 rounded-full animate-pulse">
            HARD
          </div>
          <div className="text-3xl mb-3">&#x1F525;</div>
          <div className="text-white font-black text-xl mb-2">하드 모드</div>
          <div className="text-slate-400 text-sm space-y-1">
            <p>&#x2022; 타자 적응 ON (같은 구종/존 반복 시 타자 유리)</p>
            <p>&#x2022; 투구 랜덤성 ON (30% 확률로 빗나감)</p>
            <p>&#x2022; 구속 반응 ON (타자별 구속대 강/약점)</p>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-700">
            <p className="text-amber-400 text-sm font-bold">
              실제 볼배합의 어려움을 체감하세요
            </p>
          </div>
        </button>
      </div>

      <button
        onClick={onBack}
        className="text-slate-500 hover:text-slate-300 text-sm transition-colors"
      >
        &#x2190; 모드 선택으로
      </button>
    </div>
  );
}
