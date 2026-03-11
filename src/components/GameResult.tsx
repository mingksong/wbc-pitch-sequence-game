import { useState } from 'react';
import type { AtBatOutcome, PitchOutcome, Difficulty } from '../data/types';
import type { AtBatSummary } from '../utils/scoring';
import { getGrade, generateShareText, copyShareText, JAPAN_MAX_SCORE, DOM_MAX_SCORE } from '../utils/scoring';
import type { LeadScoreResult } from '../utils/scoring';
import { BATTER_PROFILES } from '../data/batterProfiles';
import { DOM_BATTER_PROFILES } from '../data/domBatterProfiles';

interface GameResultProps {
  atBats: AtBatSummary[];
  totalScore: number;
  difficulty?: Difficulty;
  onRestart: () => void;
  gameMode?: 'japan' | 'dom';
  pitcherName?: string;
  leadScore?: LeadScoreResult;
}

function pitchEmoji(outcome: PitchOutcome): string {
  switch (outcome) {
    case 'swinging_strike':
    case 'called_strike':
    case 'groundout':
    case 'flyout':
    case 'lineout':
      return '\uD83D\uDFE2';
    case 'foul':
    case 'ball':
      return '\uD83D\uDFE1';
    case 'single':
    case 'double':
    case 'triple':
    case 'homerun':
      return '\uD83D\uDD34';
  }
}

function outcomeLabel(outcome: AtBatOutcome): string {
  switch (outcome.type) {
    case 'strikeout': return '삼진';
    case 'walk': return '볼넷';
    case 'out': {
      const labels: Record<string, string> = { groundout: '땅볼', flyout: '뜬공', lineout: '라인아웃' };
      return labels[outcome.result] || '아웃';
    }
    case 'hit': {
      const labels: Record<string, string> = { single: '안타', double: '2루타', triple: '3루타', homerun: '홈런' };
      return labels[outcome.result] || '안타';
    }
  }
}

function gradeColor(grade: string): string {
  switch (grade) {
    case 'S': return 'text-amber-300';
    case 'A': return 'text-green-400';
    case 'B': return 'text-blue-400';
    case 'C': return 'text-slate-300';
    case 'D': return 'text-orange-400';
    default: return 'text-red-400';
  }
}

export default function GameResult({ atBats, totalScore, difficulty, onRestart, gameMode, pitcherName, leadScore }: GameResultProps) {
  const [copied, setCopied] = useState(false);
  const allProfiles = { ...BATTER_PROFILES, ...DOM_BATTER_PROFILES };
  const maxScore = gameMode === 'dom' ? DOM_MAX_SCORE : JAPAN_MAX_SCORE;
  const isHard = difficulty === 'hard';
  const { grade, label } = getGrade(totalScore, maxScore);
  const pct = Math.round((totalScore / maxScore) * 100);

  const handleCopy = async () => {
    const text = generateShareText(atBats, totalScore, gameMode, pitcherName, isHard, leadScore);
    const ok = await copyShareText(text);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShareX = () => {
    const text = generateShareText(atBats, totalScore, gameMode, pitcherName, isHard, leadScore);
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleShareThreads = () => {
    const text = generateShareText(atBats, totalScore, gameMode, pitcherName, isHard, leadScore);
    const url = `https://www.threads.net/intent/post?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 flex flex-col items-center justify-center px-4 py-8">
      <div className="max-w-md w-full">
        {/* Title */}
        <h2 className="text-center text-lg text-slate-400 mb-1">
          {gameMode === 'dom' ? '도미니카 챌린지 결과' : '오늘의 포수 성적표'}
          {isHard && <span className="ml-1 text-red-400">&#x1F525; 하드모드</span>}
        </h2>

        {/* Grade */}
        <div className="text-center mb-6">
          <p className={`text-7xl font-black ${gradeColor(grade)} mb-1`}>
            {grade}{isHard ? ' \uD83D\uDD25' : ''}
          </p>
          <p className="text-slate-300 font-medium text-lg">{label}</p>
        </div>

        {/* Score */}
        <div className="text-center mb-6">
          <p className="text-amber-400 font-black text-3xl">
            {totalScore.toLocaleString()} <span className="text-lg text-slate-400">/ {maxScore.toLocaleString()}</span>
          </p>
          {/* Progress bar */}
          <div className="w-full bg-slate-700 rounded-full h-2.5 mt-2 max-w-xs mx-auto">
            <div
              className="bg-amber-500 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(pct, 100)}%` }}
            />
          </div>
          <p className="text-slate-500 text-xs mt-1">{pct}%</p>
        </div>

        {/* Catcher Lead Score */}
        {leadScore && (
          <div className="bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-3 mb-6 text-center">
            <p className="text-slate-400 text-xs mb-1">포수 리드 지수</p>
            <p className="text-xl font-bold text-white">
              {leadScore.grade} {leadScore.label}
            </p>
            <p className={`text-sm mt-0.5 ${leadScore.totalDRE <= 0 ? 'text-green-400' : 'text-red-400'}`}>
              dRE: {leadScore.totalDRE > 0 ? '+' : ''}{leadScore.totalDRE.toFixed(3)}
            </p>
            <p className="text-slate-500 text-[10px] mt-1">
              음수일수록 투수에게 유리한 배합
            </p>
          </div>
        )}

        {/* At-bat summaries */}
        <div className="space-y-2 mb-6">
          {atBats.map((ab, i) => {
            const batter = allProfiles[ab.batterId];
            return (
              <div
                key={i}
                className="bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-3 flex items-center justify-between"
              >
                <div>
                  <p className="text-white font-medium text-sm">
                    {batter?.nameKo || ab.batterId}
                  </p>
                  <div className="flex items-center gap-0.5 mt-0.5">
                    {ab.pitchHistory.map((p, j) => (
                      <span key={j} className="text-sm">{pitchEmoji(p.outcome)}</span>
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-slate-300 text-xs">{outcomeLabel(ab.outcome)}</p>
                  <p className="text-amber-400 font-bold text-sm">+{ab.totalScore}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Share buttons */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={handleShareX}
            className="flex-1 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-medium py-2.5 rounded-xl transition-colors text-sm"
          >
            X (Twitter)
          </button>
          <button
            onClick={handleShareThreads}
            className="flex-1 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-medium py-2.5 rounded-xl transition-colors text-sm"
          >
            Threads
          </button>
          <button
            onClick={handleCopy}
            className="flex-1 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-medium py-2.5 rounded-xl transition-colors text-sm"
          >
            {copied ? '복사됨!' : '복사'}
          </button>
        </div>

        {/* Restart button */}
        <button
          onClick={onRestart}
          className="w-full bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-900 font-bold text-lg py-3.5 rounded-xl transition-all duration-150 shadow-lg shadow-amber-500/20"
        >
          다시 도전
        </button>
      </div>
    </div>
  );
}
