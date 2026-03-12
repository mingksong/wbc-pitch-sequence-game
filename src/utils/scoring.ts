import type { PitchOutcome, PitchRecord, AtBatOutcome, Zone } from '../data/types';
import { BATTER_PROFILES } from '../data/batterProfiles';
import { DOM_BATTER_PROFILES } from '../data/domBatterProfiles';
import { USA_BATTER_PROFILES } from '../data/usaBatterProfiles';
import { RUN_VALUE_MATRIX } from '../data/runValueMatrix';
import { ko } from '../i18n/ko';
import { en } from '../i18n/en';

// Helper to get translation
function tr(key: string, lang: 'ko' | 'en'): string {
  const dict = lang === 'en' ? en : ko;
  return (dict as Record<string, string>)[key] ?? (ko as Record<string, string>)[key] ?? key;
}

function getLeadLabelKey(totalDRE: number): string {
  if (totalDRE <= -0.5) return 'lead.mlb';
  if (totalDRE <= -0.2) return 'lead.stable';
  if (totalDRE <= 0) return 'lead.decent';
  return 'lead.risky';
}

// Score per pitch outcome (0-100)
// Design: 5-at-bat game, "3 outs + 1K + 1 hit" → B grade
export function scorePitch(outcome: PitchOutcome, zone: Zone): number {
  const isChaseZone = [11, 12, 13, 14].includes(zone);

  switch (outcome) {
    case 'called_strike': return 80;
    case 'swinging_strike': return 100;
    case 'foul': return 50;            // 파울 유도도 전략 (40→50)
    case 'ball': return isChaseZone ? 35 : 10; // 유인구 볼넷 전략 인정 (20→35, 5→10)
    case 'groundout': return 80;       // 범타 아웃 = 좋은 결과 (70→80)
    case 'flyout': return 80;
    case 'lineout': return 85;
    case 'single': return 15;          // 안타 허용해도 싸운 건 인정 (10→15)
    case 'double': return 10;
    case 'triple': return 5;
    case 'homerun': return 0;
  }
}

// Bonus for at-bat result
export function scoreAtBat(outcome: AtBatOutcome): number {
  switch (outcome.type) {
    case 'strikeout': return 300;
    case 'out': return 250;           // 아웃 처리 보너스 상향 (200→250)
    case 'walk': return 80;           // 볼넷도 홈런보다는 낫다 (50→80)
    case 'hit':
      switch (outcome.result) {
        case 'single': return 30;     // 싸우다 허용한 안타 (0→30)
        case 'double': return 15;     // 장타는 적게 (0→15)
        case 'triple': return 5;
        case 'homerun': return 0;     // 홈런은 0 유지
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

// 삼진 = 만점: 과정과 무관하게 삼진으로 잡으면 타석당 최고점
export const STRIKEOUT_PERFECT_SCORE = 600;

export function calculateTotalScore(atBats: AtBatSummary[]): number {
  return atBats.reduce((sum, ab) => {
    if (ab.outcome.type === 'strikeout') {
      return sum + STRIKEOUT_PERFECT_SCORE;
    }
    const pitchScore = ab.pitchHistory.reduce((s, p) => s + p.score, 0);
    const bonusScore = scoreAtBat(ab.outcome);
    return sum + pitchScore + bonusScore;
  }, 0);
}

// Catcher Lead Score — cumulative delta_run_exp from RUN_VALUE_MATRIX
export interface LeadScoreResult {
  totalDRE: number;       // cumulative delta_run_exp (negative = good)
  label: string;          // Korean label
  grade: string;          // emoji indicator
}

// Calculate catcher lead score from pitch history across all at-bats
// Each pitch's (count, actualZone) is looked up in RUN_VALUE_MATRIX
export function calculateLeadScore(atBats: AtBatSummary[], lang: 'ko' | 'en' = 'ko'): LeadScoreResult {
  let totalDRE = 0;
  let pitchCount = 0;

  for (const ab of atBats) {
    let balls = 0;
    let strikes = 0;

    for (const pitch of ab.pitchHistory) {
      const countKey = `${balls}-${strikes}`;
      const zoneValues = RUN_VALUE_MATRIX[countKey];
      if (zoneValues) {
        const dre = zoneValues[pitch.actualZone] ?? 0;
        totalDRE += dre;
      }
      pitchCount++;

      // Update count for next pitch lookup
      if (pitch.outcome === 'called_strike' || pitch.outcome === 'swinging_strike') {
        strikes = Math.min(strikes + 1, 2); // cap at 2 since 3 = strikeout ends AB
      } else if (pitch.outcome === 'foul') {
        if (strikes < 2) strikes++;
      } else if (pitch.outcome === 'ball') {
        balls = Math.min(balls + 1, 3); // cap at 3 since 4 = walk ends AB
      }
      // in-play outcomes end AB, so no need to update count
    }
  }

  void pitchCount; // suppress unused var warning

  // Classify lead quality
  const labelKey = getLeadLabelKey(totalDRE);
  const label = tr(labelKey, lang);
  let grade: string;
  if (totalDRE <= -0.5) {
    grade = '\u2B50'; // star
  } else if (totalDRE <= -0.2) {
    grade = '\uD83D\uDFE2'; // green circle
  } else if (totalDRE <= 0) {
    grade = '\uD83D\uDFE1'; // yellow circle
  } else {
    grade = '\uD83D\uDD34'; // red circle
  }

  return { totalDRE: Math.round(totalDRE * 1000) / 1000, label, grade };
}

// Max scores:
// Japan: 5 at-bats × 600 = 3000
// DOM: 6000 (9타석, 6K+3아웃=82%→S, 9아웃=67%→A)
export const MAX_SCORE = 3000;
export const JAPAN_MAX_SCORE = 3000;
export const DOM_MAX_SCORE = 6000;
// Scenario: 5 at-bats × 600 = 3000 (same as Japan)
export const SCENARIO_MAX_SCORE = 3000;

// Calculate baseline score from real pitcher's actual outcomes
export function calculateBaselineScore(actualOutcomes: AtBatOutcome[]): number {
  return actualOutcomes.reduce((sum, outcome) => {
    return sum + scoreAtBat(outcome);
  }, 0);
}

// Grade thresholds:
// DOM 기준: 9K=90%→S, 6K+3아웃=82%→S, 9아웃=67%→A
// Japan 기준: 5K=100%→S, 3K+2아웃=90%→S, 5아웃=75%→A
export function getGrade(score: number, maxScore: number = MAX_SCORE, lang: 'ko' | 'en' = 'ko'): { grade: string; label: string } {
  const pct = score / maxScore;
  let grade: string;
  if (pct >= 0.80) grade = 'S';
  else if (pct >= 0.65) grade = 'A';
  else if (pct >= 0.50) grade = 'B';
  else if (pct >= 0.35) grade = 'C';
  else if (pct >= 0.20) grade = 'D';
  else grade = 'F';

  const label = tr('grade.' + grade, lang);
  return { grade, label };
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
function atBatResultText(outcome: AtBatOutcome, lang: 'ko' | 'en'): string {
  switch (outcome.type) {
    case 'strikeout': return tr('share.strikeout', lang);
    case 'walk': return tr('share.walk', lang);
    case 'out': return tr('share.' + outcome.result, lang) || tr('share.out', lang);
    case 'hit': return tr('share.' + outcome.result, lang) || tr('share.hit', lang);
  }
}

// Generate share text
export function generateShareText(
  atBats: AtBatSummary[],
  totalScore: number,
  mode: 'japan' | 'dom' | 'scenario' = 'japan',
  pitcherName?: string,
  isHard: boolean = false,
  leadScore?: LeadScoreResult,
  lang: 'ko' | 'en' = 'ko',
): string {
  const allProfiles = { ...BATTER_PROFILES, ...DOM_BATTER_PROFILES, ...USA_BATTER_PROFILES };
  const maxScore = mode === 'scenario' ? SCENARIO_MAX_SCORE : mode === 'dom' ? DOM_MAX_SCORE : JAPAN_MAX_SCORE;
  const { grade, label } = getGrade(totalScore, maxScore, lang);

  const hardTag = isHard ? tr('share.hardTag', lang) : '';
  let header: string[];
  if (mode === 'scenario') {
    const scenarioTitle = pitcherName
      ? `\u26BE ${pitcherName}${hardTag}`
      : `\u26BE ${lang === 'en' ? 'Scenario Mode' : '시나리오 모드'}${hardTag}`;
    header = [scenarioTitle, tr('share.scenarioSubheader', lang)];
  } else if (mode === 'japan') {
    header = [tr('share.japanHeader', lang) + hardTag, tr('share.japanSubheader', lang)];
  } else {
    header = [
      tr('share.domHeader', lang) + hardTag,
      tr('share.domSubheader', lang),
      pitcherName ? tr('share.pitcher', lang).replace('{name}', pitcherName) : '',
    ];
  }

  const lines = atBats.map((ab) => {
    const batter = allProfiles[ab.batterId];
    const emojis = ab.pitchHistory.map(p => pitchEmoji(p.outcome)).join('');
    const result = atBatResultText(ab.outcome, lang);
    const batterName = lang === 'en'
      ? ((en as Record<string, string>)['player.' + ab.batterId] || batter?.nameKo || ab.batterId)
      : (batter?.nameKo || ab.batterId);
    return `${batterName}: ${emojis}  ${result}`;
  });

  const scoreText = tr('share.final', lang).replace('{grade}', grade).replace('{score}', totalScore.toLocaleString());

  const leadLine = leadScore
    ? tr('share.leadScore', lang)
        .replace('{grade}', leadScore.grade)
        .replace('{label}', leadScore.label)
        .replace('{dre}', (leadScore.totalDRE > 0 ? '+' : '') + leadScore.totalDRE.toFixed(3))
    : '';

  return [
    ...header.filter(Boolean),
    '',
    ...lines,
    '',
    scoreText,
    `"${label}"`,
    ...(leadLine ? [leadLine] : []),
    '',
    tr('share.tryLink', lang),
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
