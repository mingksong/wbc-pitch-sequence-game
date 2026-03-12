import { useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import type { AtBatOutcome, PitchOutcome, Difficulty } from '../data/types';
import type { AtBatSummary } from '../utils/scoring';
import { getGrade, generateShareText, copyShareText, JAPAN_MAX_SCORE, DOM_MAX_SCORE, calculateBaselineScore, SCENARIO_MAX_SCORE } from '../utils/scoring';
import type { LeadScoreResult } from '../utils/scoring';
import { BATTER_PROFILES } from '../data/batterProfiles';
import { DOM_BATTER_PROFILES } from '../data/domBatterProfiles';
import { USA_BATTER_PROFILES } from '../data/usaBatterProfiles';
import type { ScenarioMode, ScenarioAtBat } from '../data/lorenzenScenarios';

interface GameResultProps {
  atBats: AtBatSummary[];
  totalScore: number;
  difficulty?: Difficulty;
  onRestart: () => void;
  gameMode?: 'japan' | 'dom' | 'scenario';
  pitcherName?: string;
  leadScore?: LeadScoreResult;
  scenarioMode?: ScenarioMode;
  selectedAtBats?: ScenarioAtBat[];
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

export default function GameResult({ atBats, totalScore, difficulty, onRestart, gameMode, pitcherName, leadScore, scenarioMode, selectedAtBats }: GameResultProps) {
  const { t, lang, playerName } = useLanguage();
  const [copied, setCopied] = useState(false);
  const allProfiles = { ...BATTER_PROFILES, ...DOM_BATTER_PROFILES, ...USA_BATTER_PROFILES };
  const maxScore = gameMode === 'scenario' ? SCENARIO_MAX_SCORE : gameMode === 'dom' ? DOM_MAX_SCORE : JAPAN_MAX_SCORE;
  const isHard = difficulty === 'hard';
  const { grade } = getGrade(totalScore, maxScore);
  const pct = Math.round((totalScore / maxScore) * 100);

  function outcomeLabel(outcome: AtBatOutcome): string {
    switch (outcome.type) {
      case 'strikeout': return lang === 'ko' ? '삼진' : 'K';
      case 'walk': return lang === 'ko' ? '볼넷' : 'BB';
      case 'out': {
        const ko: Record<string, string> = { groundout: '땅볼', flyout: '뜬공', lineout: '라인아웃' };
        const en: Record<string, string> = { groundout: 'GO', flyout: 'FO', lineout: 'LO' };
        return (lang === 'ko' ? ko : en)[outcome.result] || (lang === 'ko' ? '아웃' : 'Out');
      }
      case 'hit': {
        const ko: Record<string, string> = { single: '안타', double: '2루타', triple: '3루타', homerun: '홈런' };
        const en: Record<string, string> = { single: '1B', double: '2B', triple: '3B', homerun: 'HR' };
        return (lang === 'ko' ? ko : en)[outcome.result] || (lang === 'ko' ? '안타' : 'Hit');
      }
    }
  }

  // Scenario mode: calculate Lorenzen's baseline score for the same at-bats
  const baselineScore = (gameMode === 'scenario' && selectedAtBats)
    ? calculateBaselineScore(selectedAtBats.map(ab => ab.actualOutcome))
    : null;
  const beatBaseline = baselineScore !== null && totalScore > baselineScore;

  const handleCopy = async () => {
    const text = generateShareText(atBats, totalScore, gameMode, pitcherName, isHard, leadScore, lang);
    const ok = await copyShareText(text);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShareX = () => {
    const text = generateShareText(atBats, totalScore, gameMode, pitcherName, isHard, leadScore, lang);
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleShareThreads = () => {
    const text = generateShareText(atBats, totalScore, gameMode, pitcherName, isHard, leadScore, lang);
    const url = `https://www.threads.net/intent/post?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const resultTitle = gameMode === 'scenario'
    ? (lang === 'ko' ? scenarioMode?.nameKo : scenarioMode?.name) ?? t('result.scenarioTitle')
    : gameMode === 'dom' ? t('result.domTitle') : t('result.japanTitle');

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 flex flex-col items-center justify-center px-4 py-8">
      <div className="max-w-md w-full">
        {/* Title */}
        <h2 className="text-center text-lg text-slate-400 mb-1">
          {resultTitle}
          {isHard && <span className="ml-1 text-red-400">{t('result.hardMode')}</span>}
        </h2>

        {/* Grade */}
        <div className="text-center mb-6">
          <p className={`text-7xl font-black ${gradeColor(grade)} mb-1`}>
            {grade}{isHard ? ' \uD83D\uDD25' : ''}
          </p>
          <p className="text-slate-300 font-medium text-lg">{t('grade.' + grade)}</p>
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

        {/* Scenario Mode: vs Pitcher Comparison */}
        {gameMode === 'scenario' && baselineScore !== null && (
          <div className={`border-2 rounded-xl px-4 py-4 mb-6 text-center ${beatBaseline ? 'border-emerald-500 bg-emerald-900/20' : 'border-red-500 bg-red-900/20'}`}>
            <p className={`text-2xl font-black mb-1 ${beatBaseline ? 'text-emerald-400' : 'text-red-400'}`}>
              {beatBaseline
                ? t('result.yourVictory')
                : t('result.pitcherVictory').replace('{name}', playerName(pitcherName ?? '', scenarioMode?.pitcherId ?? '') || t('result.realPitcher'))}
            </p>
            <div className="flex items-center justify-center gap-4 mt-2">
              <div>
                <p className="text-slate-400 text-xs">{t('result.you')}</p>
                <p className="text-amber-400 font-black text-xl">{totalScore.toLocaleString()}</p>
              </div>
              <p className="text-slate-500 font-bold text-lg">vs</p>
              <div>
                <p className="text-slate-400 text-xs">{playerName(pitcherName ?? '', scenarioMode?.pitcherId ?? '') || t('result.realPitcher')}</p>
                <p className="text-emerald-400 font-black text-xl">{baselineScore.toLocaleString()}</p>
              </div>
            </div>
            <p className="text-slate-500 text-[10px] mt-2">
              {scenarioMode ? (() => { const k = 'scenario.pitcherLine.' + scenarioMode.id; const v = t(k); return v !== k ? v : scenarioMode.pitcherLine; })() : ''}
              {' | '}
              {scenarioMode ? (() => { const k = 'scenario.matchResult.' + scenarioMode.id; const v = t(k); return v !== k ? v : scenarioMode.matchResult; })() : ''}
            </p>
          </div>
        )}

        {/* Catcher Lead Score */}
        {leadScore && (
          <div className="bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-3 mb-6 text-center">
            <p className="text-slate-400 text-xs mb-1">{t('result.leadScoreTitle')}</p>
            <p className="text-xl font-bold text-white">
              {leadScore.grade} {leadScore.label}
            </p>
            <p className={`text-sm mt-0.5 ${leadScore.totalDRE <= 0 ? 'text-green-400' : 'text-red-400'}`}>
              dRE: {leadScore.totalDRE > 0 ? '+' : ''}{leadScore.totalDRE.toFixed(3)}
            </p>
            <p className="text-slate-500 text-[10px] mt-1">
              {t('result.leadScoreHint')}
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
                    {playerName(batter?.nameKo || ab.batterId, ab.batterId)}
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
            {copied ? (lang === 'ko' ? '복사됨!' : 'Copied!') : (lang === 'ko' ? '복사' : 'Copy')}
          </button>
        </div>

        {/* Restart button */}
        <button
          onClick={onRestart}
          className="w-full bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-900 font-bold text-lg py-3.5 rounded-xl transition-all duration-150 shadow-lg shadow-amber-500/20"
        >
          {t('result.restartButton')}
        </button>
      </div>
    </div>
  );
}
