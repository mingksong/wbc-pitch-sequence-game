import type { Zone, PitchOutcome, PitchTrajectory, PitchRecord, Difficulty } from '../data/types';
import { BATTER_PROFILES } from '../data/batterProfiles';
import { DOM_BATTER_PROFILES } from '../data/domBatterProfiles';
import {
  getPitchRepeatModifier,
  getZoneRepeatModifier,
  getVelocityBandModifier,
  applyLocationVariance,
} from './hardModeEngine';

// Strike zone: zones 1-9 are IN the zone, 11-14 are OUTSIDE
const STRIKE_ZONES: Zone[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];

function isStrikeZone(zone: Zone): boolean {
  return STRIKE_ZONES.includes(zone);
}

// Count-based adjustments to simulate real baseball tendencies
interface CountAdjustment {
  swingMod: number;     // multiplier on swing rate
  chaseMod: number;     // multiplier on chase rate (swing on balls)
  patience: number;     // multiplier on take rate for strikes
}

function getCountAdjustment(balls: number, strikes: number): CountAdjustment {
  // Hitter's counts: more aggressive, better selection
  if (balls === 3 && strikes === 0) return { swingMod: 0.5, chaseMod: 0.3, patience: 1.5 };
  if (balls === 2 && strikes === 0) return { swingMod: 0.7, chaseMod: 0.5, patience: 1.3 };
  if (balls === 3 && strikes === 1) return { swingMod: 0.6, chaseMod: 0.4, patience: 1.4 };

  // Pitcher's counts: more chasing, more desperate swings
  if (balls === 0 && strikes === 2) return { swingMod: 1.3, chaseMod: 1.5, patience: 0.6 };
  if (balls === 1 && strikes === 2) return { swingMod: 1.2, chaseMod: 1.4, patience: 0.7 };

  // Full count: protect the plate
  if (balls === 3 && strikes === 2) return { swingMod: 1.5, chaseMod: 1.3, patience: 0.3 };

  // Even counts
  if (balls === 0 && strikes === 0) return { swingMod: 0.9, chaseMod: 0.7, patience: 1.1 };
  if (balls === 1 && strikes === 1) return { swingMod: 1.0, chaseMod: 1.0, patience: 1.0 };

  return { swingMod: 1.0, chaseMod: 1.0, patience: 1.0 };
}

// Hard mode context passed from App
export interface HardModeContext {
  pitchHistory: PitchRecord[];
  pitchSpeed: number;
  difficulty: Difficulty;
}

// Main outcome determination
export function determinePitchOutcome(
  batterId: string,
  pitchCode: string,
  zone: Zone,
  balls: number,
  strikes: number,
  hardModeContext?: HardModeContext,
): { outcome: PitchOutcome; actualZone: Zone } {
  const batter = BATTER_PROFILES[batterId] || DOM_BATTER_PROFILES[batterId];
  if (!batter) throw new Error(`Unknown batter: ${batterId}`);

  const isHard = hardModeContext?.difficulty === 'hard';

  // Step 0 (Hard mode): Apply location variance
  let actualZone = zone;
  if (isHard) {
    const variance = applyLocationVariance(zone);
    actualZone = variance.actualZone;
  }

  // Use actualZone for all subsequent calculations
  const zoneStats = batter.zones[actualZone];
  const pitchStats = batter.pitchTypeStats[pitchCode] || { ba: 0.220, whiffRate: 0.25 };
  const countAdj = getCountAdjustment(balls, strikes);
  const inZone = isStrikeZone(actualZone);

  // Hard mode modifiers
  let pitchRepeatMod = 1.0;
  let zoneRepeatContact = 1.0;
  let zoneRepeatWhiff = 1.0;
  let velBaMod = 1.0;
  let velSlgMod = 1.0;

  if (isHard && hardModeContext) {
    pitchRepeatMod = getPitchRepeatModifier(pitchCode, hardModeContext.pitchHistory);
    const zoneRepeat = getZoneRepeatModifier(actualZone, hardModeContext.pitchHistory);
    zoneRepeatContact = zoneRepeat.contactMod;
    zoneRepeatWhiff = zoneRepeat.whiffMod;
    const velMod = getVelocityBandModifier(batterId, hardModeContext.pitchSpeed);
    velBaMod = velMod.baMod;
    velSlgMod = velMod.slgMod;
  }

  // Step 1: Does the batter swing?
  let swingProb: number;
  if (inZone) {
    swingProb = zoneStats.swingRate * countAdj.swingMod;
    swingProb = Math.min(swingProb, 0.95);
  } else {
    swingProb = zoneStats.swingRate * countAdj.chaseMod;
    swingProb = Math.min(swingProb, 0.85);
  }

  const doesSwing = Math.random() < swingProb;

  // Step 2: No swing
  if (!doesSwing) {
    return { outcome: inZone ? 'called_strike' : 'ball', actualZone };
  }

  // Step 3: Swing → check whiff (swinging strike)
  const combinedWhiff = (zoneStats.whiffRate * 0.6 + pitchStats.whiffRate * 0.4);
  // Apply hard mode: zone repeat reduces whiff, pitch repeat affects overall
  let whiffProb = inZone ? combinedWhiff : combinedWhiff * 1.3;
  if (isHard) {
    whiffProb *= zoneRepeatWhiff;      // zone repeat → less whiff
    whiffProb *= (1 / pitchRepeatMod); // pitch repeat batter advantage → less whiff
  }

  if (Math.random() < whiffProb) {
    return { outcome: 'swinging_strike', actualZone };
  }

  // Step 4: Contact made → determine result
  const cornerZones: Zone[] = [1, 3, 7, 9, 11, 12, 13, 14];
  const isCorner = cornerZones.includes(actualZone);
  let foulProb = isCorner ? 0.45 : 0.30;
  if (strikes === 2) foulProb += 0.15;
  // Hard mode: zone repeat → better contact → fewer fouls
  if (isHard) {
    foulProb *= (1 / zoneRepeatContact);
  }

  if (Math.random() < foulProb) {
    return { outcome: 'foul', actualZone };
  }

  // Step 5: Ball in play → determine hit quality
  const wOBA = zoneStats.wOBA;
  const hrRate = zoneStats.hrRate;
  let ba = pitchStats.ba;

  // Hard mode: apply velocity band + pitch repeat modifiers to BA
  if (isHard) {
    ba *= velBaMod * pitchRepeatMod * zoneRepeatContact;
  }

  // Homerun check
  let hrProb = hrRate * (ba / 0.260);
  if (isHard) {
    hrProb *= velSlgMod; // velocity band affects power
  }
  if (Math.random() < hrProb) {
    return { outcome: 'homerun', actualZone };
  }

  // Hit vs out
  let hitProb = (wOBA * 0.6 + ba * 0.4);
  if (isHard) {
    hitProb *= pitchRepeatMod; // repeated pitches → easier to hit
  }

  if (Math.random() < hitProb) {
    const r = Math.random();
    if (r < 0.05) return { outcome: 'triple', actualZone };
    if (r < 0.30) return { outcome: 'double', actualZone };
    return { outcome: 'single', actualZone };
  }

  // Out type distribution
  const outRoll = Math.random();
  if (outRoll < 0.45) return { outcome: 'groundout', actualZone };
  if (outRoll < 0.80) return { outcome: 'flyout', actualZone };
  return { outcome: 'lineout', actualZone };
}

// Generate a representative pitch trajectory for 3D animation
// Based on the selected pitch type, targeting the selected zone
export function generatePitchTrajectory(
  pitchCode: string,
  zone: Zone,
  avgSpeed: number,
  pitcherHand: 'L' | 'R',
  batterBats: 'L' | 'R',
): PitchTrajectory {
  // Zone to target location mapping (pX, pZ in feet, catcher perspective)
  // pX: negative = catcher's left (batter's right), positive = catcher's right
  // pZ: height in feet
  const zoneTargets: Record<Zone, { pX: number; pZ: number }> = {
    1:  { pX: -0.5,  pZ: 3.2 },   // high inside (catcher POV)
    2:  { pX: 0.0,   pZ: 3.2 },   // high middle
    3:  { pX: 0.5,   pZ: 3.2 },   // high outside
    4:  { pX: -0.5,  pZ: 2.5 },   // middle inside
    5:  { pX: 0.0,   pZ: 2.5 },   // dead center
    6:  { pX: 0.5,   pZ: 2.5 },   // middle outside
    7:  { pX: -0.5,  pZ: 1.8 },   // low inside
    8:  { pX: 0.0,   pZ: 1.8 },   // low middle
    9:  { pX: 0.5,   pZ: 1.8 },   // low outside
    11: { pX: 0.0,   pZ: 3.8 },   // 하이볼 (high, centered)
    12: { pX: 0.0,   pZ: 1.0 },   // 로우볼 (low, centered)
    13: { pX: 1.0,   pZ: 2.5 },   // 왼쪽 유인구 (pitcher's left = catcher's right)
    14: { pX: -1.0,  pZ: 2.5 },   // 오른쪽 유인구 (pitcher's right = catcher's left)
  };

  const target = zoneTargets[zone];
  // Add small random scatter (±0.15ft)
  const pX = target.pX + (Math.random() - 0.5) * 0.3;
  const pZ = target.pZ + (Math.random() - 0.5) * 0.3;

  // Convert mph to ft/s
  const speedFtS = avgSpeed * 1.467;

  // Release point (approximate)
  const x0 = pitcherHand === 'R' ? -2.0 : 2.0;
  const y0 = 55.0; // release distance from plate
  const z0 = 5.8;  // release height

  // Calculate plate time
  const plateTime = y0 / speedFtS;

  // Calculate initial velocities to hit target
  // Using kinematic: pos = pos0 + v0*t + 0.5*a*t^2
  // Gravity: aZ = -32.17 ft/s^2
  const gravity = -32.17;

  // Pitch-type specific movement profiles
  const movements: Record<string, { aX: number; aY: number; aZ: number }> = {
    FF: { aX: pitcherHand === 'R' ? -8 : 8, aY: -30, aZ: gravity + 16 },     // Rising action (high spin)
    SI: { aX: pitcherHand === 'R' ? -14 : 14, aY: -30, aZ: gravity + 8 },    // Arm-side run + sink
    SL: { aX: pitcherHand === 'R' ? 6 : -6, aY: -28, aZ: gravity + 2 },      // Glove-side sweep
    CU: { aX: pitcherHand === 'R' ? 4 : -4, aY: -26, aZ: gravity - 8 },      // Big drop
    CH: { aX: pitcherHand === 'R' ? -12 : 12, aY: -28, aZ: gravity + 4 },    // Arm-side fade + drop
    FC: { aX: pitcherHand === 'R' ? 2 : -2, aY: -30, aZ: gravity + 10 },     // Slight cut
    ST: { aX: pitcherHand === 'R' ? 10 : -10, aY: -28, aZ: gravity + 0 },    // Big sweep
    FS: { aX: pitcherHand === 'R' ? -6 : 6, aY: -28, aZ: gravity - 4 },      // Split/drop
  };

  const mov = movements[pitchCode] || movements.FF;

  // Solve for initial velocities: target = origin + v0*t + 0.5*a*t^2
  // v0 = (target - origin - 0.5*a*t^2) / t
  const vX0 = (pX - x0 - 0.5 * mov.aX * plateTime * plateTime) / plateTime;
  const vY0 = (-y0 - 0.5 * mov.aY * plateTime * plateTime) / plateTime; // negative because moving toward plate
  const vZ0 = (pZ - z0 - 0.5 * mov.aZ * plateTime * plateTime) / plateTime;

  return {
    vX0,
    vY0,
    vZ0,
    aX: mov.aX,
    aY: mov.aY,
    aZ: mov.aZ,
    x0,
    y0,
    z0,
    pX,
    pZ,
    plateTime,
    pitchCode,
    szTop: 3.4,
    szBot: 1.6,
    batSide: batterBats,
  };
}
