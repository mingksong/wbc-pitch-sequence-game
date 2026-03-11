import type { Zone, PitchRecord } from '../data/types';

// ============================================================
// Hard Mode Engine
// Based on KBO 1.1M pitch analysis (consecutive_pitch_study)
// ============================================================

// --- 3-1. Pitch Repeat Adaptation ---
// wOBA change from consecutive same-pitch-type usage
// modifier > 1.0 = batter advantage, < 1.0 = pitcher advantage
const PITCH_REPEAT_MODIFIERS: Record<string, { repeat2: number; repeat3: number }> = {
  FF: { repeat2: 1.00, repeat3: 0.98 },  // Fastball repeat favors pitcher (-.007 wOBA)
  SI: { repeat2: 1.00, repeat3: 0.99 },  // Sinker similar
  SL: { repeat2: 1.01, repeat3: 1.03 },  // Slider slight batter advantage (+.004)
  CU: { repeat2: 1.02, repeat3: 1.12 },  // Curveball 3x → batter surges (+.039)
  CH: { repeat2: 1.01, repeat3: 1.01 },  // Changeup minimal (+.004)
  FC: { repeat2: 1.02, repeat3: 1.10 },  // Cutter 3x → batter advantage (+.034)
  ST: { repeat2: 1.01, repeat3: 1.03 },  // Sweeper ≈ slider
  FS: { repeat2: 1.00, repeat3: 1.00 },  // Splitter no change (+.001)
  KC: { repeat2: 1.02, repeat3: 1.10 },  // Knuckle curve ≈ curveball
  SC: { repeat2: 1.01, repeat3: 1.03 },  // Screwball ≈ slider
  SV: { repeat2: 1.01, repeat3: 1.03 },  // Slurve ≈ slider
  EP: { repeat2: 1.02, repeat3: 1.12 },  // Eephus ≈ curveball
  KN: { repeat2: 1.00, repeat3: 1.00 },  // Knuckleball neutral
};

export function getPitchRepeatModifier(pitchCode: string, pitchHistory: PitchRecord[]): number {
  if (pitchHistory.length === 0) return 1.0;

  const mods = PITCH_REPEAT_MODIFIERS[pitchCode] || { repeat2: 1.0, repeat3: 1.0 };

  // Count consecutive same pitch type from end of history
  let consecutive = 0;
  for (let i = pitchHistory.length - 1; i >= 0; i--) {
    if (pitchHistory[i].pitchCode === pitchCode) {
      consecutive++;
    } else {
      break;
    }
  }

  if (consecutive >= 2) return mods.repeat3; // 3+ consecutive (current pitch would be 3rd+)
  if (consecutive >= 1) return mods.repeat2; // 2 consecutive (current pitch would be 2nd)
  return 1.0;
}

// --- 3-2. Zone Repeat Adaptation ---
// Same zone repeated → batter predicts location
const ZONE_REPEAT_MODIFIERS = {
  repeat2: { contactMod: 1.08, whiffMod: 0.92 },
  repeat3: { contactMod: 1.18, whiffMod: 0.82 },
};

export function getZoneRepeatModifier(
  zone: Zone,
  pitchHistory: PitchRecord[],
): { contactMod: number; whiffMod: number } {
  if (pitchHistory.length === 0) return { contactMod: 1.0, whiffMod: 1.0 };

  // Use actualZone for comparison (where pitch actually landed)
  let consecutive = 0;
  for (let i = pitchHistory.length - 1; i >= 0; i--) {
    if (pitchHistory[i].actualZone === zone) {
      consecutive++;
    } else {
      break;
    }
  }

  if (consecutive >= 2) return ZONE_REPEAT_MODIFIERS.repeat3;
  if (consecutive >= 1) return ZONE_REPEAT_MODIFIERS.repeat2;
  return { contactMod: 1.0, whiffMod: 1.0 };
}

// --- 3-3. Velocity Band Modifier ---
import { VELOCITY_BAND_DATA } from '../data/velocityBandData';

function speedToBand(speed: number): string {
  if (speed < 63) return '60-62';
  if (speed < 66) return '63-65';
  if (speed < 69) return '66-68';
  if (speed < 72) return '69-71';
  if (speed < 75) return '72-74';
  if (speed < 78) return '75-77';
  if (speed < 81) return '78-80';
  if (speed < 84) return '81-83';
  if (speed < 87) return '84-86';
  if (speed < 90) return '87-89';
  if (speed < 93) return '90-92';
  if (speed < 96) return '93-95';
  if (speed < 99) return '96-98';
  if (speed < 102) return '99-101';
  return '102-105';
}

export function getVelocityBandModifier(
  batterId: string,
  pitchSpeed: number,
): { baMod: number; slgMod: number } {
  const batterData = VELOCITY_BAND_DATA[batterId];
  if (!batterData) return { baMod: 1.0, slgMod: 1.0 };

  const band = speedToBand(pitchSpeed);
  const bandStats = batterData.bands[band];
  if (!bandStats) return { baMod: 1.0, slgMod: 1.0 };

  // Compare band BA/SLG to batter's overall averages
  const avgBA = batterData.avgBA;
  const avgSLG = batterData.avgSLG;

  const baMod = avgBA > 0 ? bandStats.ba / avgBA : 1.0;
  const slgMod = avgSLG > 0 ? bandStats.slg / avgSLG : 1.0;

  // Clamp to reasonable range [0.5, 1.8]
  return {
    baMod: Math.max(0.5, Math.min(1.8, baMod)),
    slgMod: Math.max(0.5, Math.min(1.8, slgMod)),
  };
}

// --- 3-4. Location Variance (Pitch Randomness) ---
// Zone adjacency map (pitcher's perspective)
const ZONE_ADJACENCY: Record<Zone, Zone[]> = {
  1:  [2, 4, 5, 11, 13],
  2:  [1, 3, 4, 5, 6, 11],
  3:  [2, 5, 6, 11, 14],
  4:  [1, 2, 5, 7, 8, 13],
  5:  [1, 2, 3, 4, 6, 7, 8, 9],
  6:  [2, 3, 5, 8, 9, 14],
  7:  [4, 5, 8, 12, 13],
  8:  [4, 5, 6, 7, 9, 12],
  9:  [5, 6, 8, 12, 14],
  11: [1, 2, 3],
  12: [7, 8, 9],
  13: [1, 4, 7],
  14: [3, 6, 9],
};

// Opposite zones (high-inside → low-outside etc.)
const OPPOSITE_ZONES: Record<Zone, Zone[]> = {
  1:  [9, 14, 12],
  2:  [8, 12],
  3:  [7, 13, 12],
  4:  [6, 14],
  5:  [11, 12, 13, 14],
  6:  [4, 13],
  7:  [3, 14, 11],
  8:  [2, 11],
  9:  [1, 13, 11],
  11: [12, 7, 8, 9],
  12: [11, 1, 2, 3],
  13: [14, 3, 6, 9],
  14: [13, 1, 4, 7],
};

const ALL_ZONES: Zone[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 12, 13, 14];

export function applyLocationVariance(targetZone: Zone): { actualZone: Zone; isMiss: boolean } {
  const roll = Math.random();

  // 70% → on target
  if (roll < 0.70) {
    return { actualZone: targetZone, isMiss: false };
  }

  // 18% → adjacent zone
  if (roll < 0.88) {
    const adjacent = ZONE_ADJACENCY[targetZone];
    const picked = adjacent[Math.floor(Math.random() * adjacent.length)];
    return { actualZone: picked, isMiss: true };
  }

  // 9% → random zone (excluding target and adjacent)
  if (roll < 0.97) {
    const adjacent = ZONE_ADJACENCY[targetZone];
    const candidates = ALL_ZONES.filter(z => z !== targetZone && !adjacent.includes(z));
    if (candidates.length === 0) {
      return { actualZone: targetZone, isMiss: false };
    }
    const picked = candidates[Math.floor(Math.random() * candidates.length)];
    return { actualZone: picked, isMiss: true };
  }

  // 3% → opposite zone (wild miss)
  const opposite = OPPOSITE_ZONES[targetZone];
  const picked = opposite[Math.floor(Math.random() * opposite.length)];
  return { actualZone: picked, isMiss: true };
}
