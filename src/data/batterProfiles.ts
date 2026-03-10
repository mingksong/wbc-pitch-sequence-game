import type { BatterProfile, Zone, ZoneStats } from './types';

function z(wOBA: number, swingRate: number, whiffRate: number, contactRate: number, hrRate: number): ZoneStats {
  return { wOBA, swingRate, whiffRate, contactRate, hrRate };
}

export const BATTER_PROFILES: Record<string, BatterProfile> = {
  ohtani: {
    id: 'ohtani',
    name: 'Shohei Ohtani',
    nameKo: '오타니 쇼헤이',
    bats: 'L',
    team: 'Japan',
    flavorText: '절대 한가운데 직구를 던지지 말 것. 몸쪽 높은 공에 약점.',
    zones: {
      // Zone 1-9 strike zone (catcher perspective for LEFT-handed batter)
      // Ohtani: devastating in middle zones, somewhat vulnerable high-inside (zone 1) and low-away (zone 9)
      1: z(0.280, 0.72, 0.28, 0.72, 0.04),   // high inside - slightly less dangerous
      2: z(0.380, 0.78, 0.18, 0.82, 0.08),   // high middle - dangerous
      3: z(0.340, 0.70, 0.22, 0.78, 0.06),   // high outside
      4: z(0.420, 0.82, 0.12, 0.88, 0.10),   // middle inside - very dangerous
      5: z(0.480, 0.88, 0.08, 0.92, 0.14),   // dead center - elite
      6: z(0.360, 0.76, 0.16, 0.84, 0.07),   // middle outside
      7: z(0.320, 0.68, 0.24, 0.76, 0.05),   // low inside
      8: z(0.350, 0.74, 0.20, 0.80, 0.06),   // low middle
      9: z(0.260, 0.62, 0.30, 0.70, 0.03),   // low outside - weakness
      // Shadow zones (outside strike zone)
      11: z(0.190, 0.40, 0.42, 0.58, 0.02),  // 하이볼
      12: z(0.150, 0.32, 0.52, 0.48, 0.01),  // 로우볼
      13: z(0.170, 0.36, 0.48, 0.52, 0.02),  // 왼쪽 유인구
      14: z(0.160, 0.34, 0.50, 0.50, 0.01),  // 오른쪽 유인구
    } as Record<Zone, ZoneStats>,
    pitchTypeStats: {
      FF: { ba: 0.285, whiffRate: 0.22 },
      SI: { ba: 0.265, whiffRate: 0.18 },
      SL: { ba: 0.210, whiffRate: 0.35 },
      CU: { ba: 0.195, whiffRate: 0.38 },
      CH: { ba: 0.220, whiffRate: 0.32 },
      FC: { ba: 0.240, whiffRate: 0.25 },
      ST: { ba: 0.200, whiffRate: 0.36 },
      FS: { ba: 0.215, whiffRate: 0.34 },
    },
  },
  suzuki: {
    id: 'suzuki',
    name: 'Seiya Suzuki',
    nameKo: '스즈키 세이야',
    bats: 'R',
    team: 'Japan',
    flavorText: '빠른 볼에 강하다. 체인지업과 낮은 존 공략이 핵심.',
    zones: {
      // Suzuki: strong on fastballs in middle zones, struggles low-away
      1: z(0.340, 0.74, 0.20, 0.80, 0.06),
      2: z(0.400, 0.80, 0.14, 0.86, 0.09),
      3: z(0.300, 0.68, 0.26, 0.74, 0.05),
      4: z(0.380, 0.78, 0.16, 0.84, 0.08),
      5: z(0.440, 0.85, 0.10, 0.90, 0.12),
      6: z(0.320, 0.72, 0.22, 0.78, 0.06),
      7: z(0.280, 0.65, 0.28, 0.72, 0.04),
      8: z(0.300, 0.70, 0.24, 0.76, 0.05),
      9: z(0.220, 0.58, 0.35, 0.65, 0.02),
      11: z(0.180, 0.38, 0.45, 0.55, 0.02),  // 하이볼
      12: z(0.140, 0.30, 0.54, 0.46, 0.01),  // 로우볼
      13: z(0.170, 0.36, 0.46, 0.54, 0.01),  // 왼쪽 유인구
      14: z(0.150, 0.32, 0.50, 0.50, 0.01),  // 오른쪽 유인구
    } as Record<Zone, ZoneStats>,
    pitchTypeStats: {
      FF: { ba: 0.295, whiffRate: 0.20 },
      SI: { ba: 0.275, whiffRate: 0.19 },
      SL: { ba: 0.230, whiffRate: 0.30 },
      CU: { ba: 0.210, whiffRate: 0.34 },
      CH: { ba: 0.200, whiffRate: 0.36 },
      FC: { ba: 0.250, whiffRate: 0.24 },
      ST: { ba: 0.215, whiffRate: 0.33 },
      FS: { ba: 0.205, whiffRate: 0.35 },
    },
  },
  yoshida: {
    id: 'yoshida',
    name: 'Masataka Yoshida',
    nameKo: '요시다 마사타카',
    bats: 'L',
    team: 'Japan',
    flavorText: '컨택 능력 최상. 삼진이 적다. 존 밖 유인구로 흔들어야.',
    zones: {
      // Yoshida: elite contact, high wOBA across zones, but low HR power
      1: z(0.320, 0.76, 0.14, 0.86, 0.03),
      2: z(0.380, 0.82, 0.10, 0.90, 0.05),
      3: z(0.360, 0.78, 0.12, 0.88, 0.04),
      4: z(0.400, 0.84, 0.08, 0.92, 0.06),
      5: z(0.420, 0.86, 0.06, 0.94, 0.07),
      6: z(0.380, 0.80, 0.10, 0.90, 0.05),
      7: z(0.340, 0.72, 0.16, 0.84, 0.03),
      8: z(0.360, 0.76, 0.14, 0.86, 0.04),
      9: z(0.300, 0.66, 0.22, 0.78, 0.02),
      11: z(0.190, 0.31, 0.40, 0.60, 0.01),  // 하이볼
      12: z(0.150, 0.26, 0.48, 0.52, 0.01),  // 로우볼
      13: z(0.170, 0.29, 0.44, 0.56, 0.01),  // 왼쪽 유인구
      14: z(0.140, 0.25, 0.52, 0.48, 0.01),  // 오른쪽 유인구
    } as Record<Zone, ZoneStats>,
    pitchTypeStats: {
      FF: { ba: 0.310, whiffRate: 0.14 },
      SI: { ba: 0.290, whiffRate: 0.12 },
      SL: { ba: 0.250, whiffRate: 0.24 },
      CU: { ba: 0.230, whiffRate: 0.28 },
      CH: { ba: 0.240, whiffRate: 0.26 },
      FC: { ba: 0.270, whiffRate: 0.18 },
      ST: { ba: 0.235, whiffRate: 0.27 },
      FS: { ba: 0.225, whiffRate: 0.30 },
    },
  },
  murakami: {
    id: 'murakami',
    name: 'Munetaka Murakami',
    nameKo: '무라카미 무네타카',
    bats: 'L',
    team: 'Japan',
    flavorText: '홈런 파워 최강. 하지만 높은 공에 약하고 체이스율 높음.',
    zones: {
      // Murakami: huge power in lower zones, vulnerable up in zone
      1: z(0.240, 0.65, 0.32, 0.68, 0.04),
      2: z(0.300, 0.72, 0.25, 0.75, 0.07),
      3: z(0.260, 0.60, 0.30, 0.70, 0.05),
      4: z(0.380, 0.80, 0.15, 0.85, 0.11),
      5: z(0.440, 0.85, 0.10, 0.90, 0.15),
      6: z(0.340, 0.74, 0.20, 0.80, 0.08),
      7: z(0.400, 0.82, 0.12, 0.88, 0.13),
      8: z(0.420, 0.84, 0.10, 0.90, 0.14),
      9: z(0.300, 0.68, 0.26, 0.74, 0.06),
      11: z(0.200, 0.42, 0.42, 0.58, 0.02),  // 하이볼
      12: z(0.170, 0.36, 0.50, 0.50, 0.02),  // 로우볼
      13: z(0.210, 0.44, 0.40, 0.60, 0.03),  // 왼쪽 유인구
      14: z(0.160, 0.35, 0.52, 0.48, 0.01),  // 오른쪽 유인구
    } as Record<Zone, ZoneStats>,
    pitchTypeStats: {
      FF: { ba: 0.260, whiffRate: 0.26 },
      SI: { ba: 0.245, whiffRate: 0.22 },
      SL: { ba: 0.220, whiffRate: 0.32 },
      CU: { ba: 0.200, whiffRate: 0.38 },
      CH: { ba: 0.210, whiffRate: 0.35 },
      FC: { ba: 0.235, whiffRate: 0.28 },
      ST: { ba: 0.205, whiffRate: 0.36 },
      FS: { ba: 0.195, whiffRate: 0.40 },
    },
  },
};
