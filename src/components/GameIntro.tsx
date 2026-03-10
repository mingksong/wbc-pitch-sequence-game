interface GameIntroProps {
  onStart: () => void;
}

export default function GameIntro({ onStart }: GameIntroProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 flex flex-col items-center justify-center px-6 text-center">
      {/* Top decorative line */}
      <div className="w-24 h-0.5 bg-amber-500 mb-8 rounded-full" />

      {/* Title */}
      <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-3 leading-tight">
        답답하면 니가 던지던가
      </h1>

      {/* Subtitle */}
      <p className="text-lg sm:text-xl text-amber-400 font-semibold mb-6">
        WBC 2026 한일전 포수 시뮬레이터
      </p>

      {/* Description */}
      <p className="text-slate-300 text-base sm:text-lg max-w-md mb-8 leading-relaxed">
        당신이 포수석에 앉습니다.
        <br />
        구종과 코스를 선택해 일본 타선을 막으세요.
      </p>

      {/* Opponents */}
      <div className="bg-slate-800/60 border border-slate-700 rounded-xl px-6 py-4 mb-10 max-w-sm w-full">
        <p className="text-xs text-slate-400 uppercase tracking-widest mb-2">
          상대 타선
        </p>
        <p className="text-white font-bold text-lg tracking-wide">
          오타니 / 스즈키 / 요시다 / 무라카미
        </p>
      </div>

      {/* Start button */}
      <button
        onClick={onStart}
        className="bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-900 font-bold text-xl px-12 py-4 rounded-2xl transition-all duration-150 shadow-lg shadow-amber-500/20 hover:shadow-amber-400/30 hover:scale-[1.02] active:scale-[0.98]"
      >
        게임 시작
      </button>

      {/* Bottom decorative */}
      <div className="mt-12 text-slate-600 text-xs">
        5타석 시뮬레이션 | 실제 WBC 2026 데이터 기반
      </div>
    </div>
  );
}
