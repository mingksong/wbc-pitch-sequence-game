// Zone system (MLB Statcast standard, catcher's perspective)
// 1-9: Strike zone 3x3 grid
// 11-14: Shadow zones (outside strike zone, chase pitches)
export type Zone = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 11 | 12 | 13 | 14;

export interface ZoneStats {
  wOBA: number;
  swingRate: number;
  whiffRate: number;
  contactRate: number;
  hrRate: number;
}

export interface PitchTypeStats {
  ba: number;
  whiffRate: number;
}

export interface BatterProfile {
  id: string;
  name: string;
  nameKo: string;
  bats: 'L' | 'R';
  team: string;
  zones: Record<Zone, ZoneStats>;
  pitchTypeStats: Record<string, PitchTypeStats>;
  flavorText: string;
}

export interface GameScenario {
  id: string;
  inning: number;
  halfInning: 'top' | 'bottom';
  outs: number;
  runners: ('1B' | '2B' | '3B')[];
  scoreKor: number;
  scoreJpn: number;
  batterId: string;
  pitcherId: string;
  actualResult: string;
  description: string;
}

export interface PitchOption {
  code: string;
  name: string;
  nameKo: string;
  avgSpeed: number;
  movement: string;
}

export interface PitcherRepertoire {
  id: string;
  name: string;
  nameKo: string;
  hand: 'L' | 'R';
  style: string;
  pitches: PitchOption[];
}

export type PitchOutcome =
  | 'called_strike'
  | 'swinging_strike'
  | 'foul'
  | 'ball'
  | 'single'
  | 'double'
  | 'triple'
  | 'homerun'
  | 'groundout'
  | 'flyout'
  | 'lineout';

// For 3D animation - compatible with umpire game's PitchBall
export interface PitchTrajectory {
  vX0: number;
  vY0: number;
  vZ0: number;
  aX: number;
  aY: number;
  aZ: number;
  x0: number;
  y0: number;
  z0: number;
  pX: number;
  pZ: number;
  plateTime: number;
  pitchCode: string;
  szTop: number;
  szBot: number;
  batSide: 'L' | 'R';
}

// Game state
export type GamePhase =
  | 'intro'
  | 'pitch_select'
  | 'animating'
  | 'outcome'
  | 'at_bat_result'
  | 'game_result';

export interface AtBatState {
  scenarioIndex: number;
  balls: number;
  strikes: number;
  pitchHistory: PitchRecord[];
  result: AtBatOutcome | null;
}

export interface PitchRecord {
  pitchCode: string;
  zone: Zone;
  outcome: PitchOutcome;
  score: number;
}

export type AtBatOutcome =
  | { type: 'strikeout' }
  | { type: 'walk' }
  | { type: 'hit'; result: 'single' | 'double' | 'triple' | 'homerun' }
  | { type: 'out'; result: 'groundout' | 'flyout' | 'lineout' };
