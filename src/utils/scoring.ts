import type { PitchOutcome, PitchRecord, AtBatOutcome, Zone } from '../data/types';
import { BATTER_PROFILES } from '../data/batterProfiles';

// Score per pitch outcome (0-100)
export function scorePitch(outcome: PitchOutcome, zone: Zone): number {
  const isChaseZone = [11, 12, 13, 14].includes(zone);

  switch (outcome) {
    case 'called_strike': return 80;
    case 'swinging_strike': return 100;
    case 'foul': return 40;
    case 'ball': return isChaseZone ? 20 : 5; // intended chase vs missed location
    case 'groundout': return 70;
    case 'flyout': return 70;
    case 'lineout': return 75;
    case 'single': return 10;
    case 'double': return 5;
    case 'triple': return 3;
    case 'homerun': return 0;
  }
}

// Bonus for at-bat result
export function scoreAtBat(outcome: AtBatOutcome): number {
  switch (outcome.type) {
    case 'strikeout': return 300;
    case 'out': return 200;
    case 'walk': return 50;
    case 'hit':
      switch (outcome.result) {
        case 'single': return 0;
        case 'double': return 0;
        case 'triple': return 0;
        case 'homerun': return 0;
      }
  }
}

// Calculate total score from all at-bats
export interface AtBatSummary {
  batterId: string;
  pitchHistory: PitchRecord[];
  outcome: AtBatOutcome;
  totalScore: number;
}

export function calculateTotalScore(atBats: AtBatSummary[]): number {
  return atBats.reduce((sum, ab) => {
    const pitchScore = ab.pitchHistory.reduce((s, p) => s + p.score, 0);
    const bonusScore = scoreAtBat(ab.outcome);
    return sum + pitchScore + bonusScore;
  }, 0);
}

// Max possible score: 5 at-bats, avg 5 pitches each, all swinging strikes + strikeouts
// 5 * (5 * 100 + 300) = 4000, but theoretical max is higher
export const MAX_SCORE = 5000;

export function getGrade(score: number): { grade: string; label: string } {
  const pct = score / MAX_SCORE;
  if (pct >= 0.90) return { grade: 'S', label: '명포수' };
  if (pct >= 0.75) return { grade: 'A', label: '시리즈 MVP급' };
  if (pct >= 0.60) return { grade: 'B', label: '1군 주전 자격 있음' };
  if (pct >= 0.45) return { grade: 'C', label: '2군 복귀각' };
  if (pct >= 0.30) return { grade: 'D', label: '감독 눈치 보는 중' };
  return { grade: 'F', label: '벤치 직행' };
}

// Emoji for pitch result
function pitchEmoji(outcome: PitchOutcome): string {
  switch (outcome) {
    case 'swinging_strike':
    case 'called_strike':
    case 'groundout':
    case 'flyout':
    case 'lineout':
      return '\uD83D\uDFE2'; // green circle
    case 'foul':
    case 'ball':
      return '\uD83D\uDFE1'; // yellow circle
    case 'single':
    case 'double':
    case 'triple':
    case 'homerun':
      return '\uD83D\uDD34'; // red circle
  }
}

// At-bat result text
function atBatResultText(outcome: AtBatOutcome): string {
  switch (outcome.type) {
    case 'strikeout': return '삼진!';
    case 'walk': return '볼넷 허용';
    case 'out': {
      const labels: Record<string, string> = { groundout: '땅볼 아웃', flyout: '뜬공 아웃', lineout: '라인드라이브 아웃' };
      return labels[outcome.result] || '아웃!';
    }
    case 'hit': {
      const labels: Record<string, string> = { single: '안타 허용', double: '2루타 허용', triple: '3루타 허용', homerun: '홈런 허용' };
      return labels[outcome.result] || '안타 허용';
    }
  }
}

// Generate share text
export function generateShareText(atBats: AtBatSummary[], totalScore: number): string {
  const { grade, label } = getGrade(totalScore);

  const lines = atBats.map((ab) => {
    const batter = BATTER_PROFILES[ab.batterId];
    const emojis = ab.pitchHistory.map(p => pitchEmoji(p.outcome)).join('');
    const result = atBatResultText(ab.outcome);
    return `${batter?.nameKo || ab.batterId}: ${emojis}  ${result}`;
  });

  return [
    '\u26BE 답답하면 니가 던지던가',
    '\uD83C\uDDF0\uD83C\uDDF7 한국 vs 일본 \uD83C\uDDEF\uD83C\uDDF5 WBC 2026',
    '',
    ...lines,
    '',
    `최종: ${grade}등급 | ${totalScore.toLocaleString()}점`,
    `"${label}"`,
    '',
    '나도 도전 \u2192 [URL]',
  ].join('\n');
}

// Copy to clipboard
export async function copyShareText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
