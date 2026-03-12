const PITCH_COLORS: Record<string, string> = {
  FF: '#FF0000',
  SI: '#F57C00',
  FC: '#E91E63',
  SL: '#FFC107',
  ST: '#FFD600',
  CU: '#2196F3',
  KC: '#42A5F5',
  CH: '#4CAF50',
  FS: '#66BB6A',
  KN: '#9C27B0',
  EP: '#7B1FA2',
  SC: '#FF5722',
  SV: '#FFD600',
  UN: '#9E9E9E',
};

export function getPitchColor(code: string): string {
  return PITCH_COLORS[code] || PITCH_COLORS.UN;
}

const PITCH_NAMES_KO: Record<string, string> = {
  FF: '포심 패스트볼',
  SI: '싱커',
  FC: '커터',
  SL: '슬라이더',
  ST: '스위퍼',
  CU: '커브',
  KC: '너클커브',
  CH: '체인지업',
  FS: '스플리터',
  KN: '너클볼',
  EP: '이퍼스',
  SC: '스크루볼',
  SV: '슬러브',
  UN: '알 수 없음',
};

export function getPitchNameKo(code: string): string {
  return PITCH_NAMES_KO[code] || code;
}

const PITCH_NAMES_EN: Record<string, string> = {
  FF: '4-Seam Fastball',
  SI: 'Sinker',
  FC: 'Cutter',
  SL: 'Slider',
  ST: 'Sweeper',
  CU: 'Curveball',
  KC: 'Knuckle Curve',
  CH: 'Changeup',
  FS: 'Splitter',
  KN: 'Knuckleball',
  EP: 'Eephus',
  SC: 'Screwball',
  SV: 'Slurve',
  UN: 'Unknown',
};

export function getPitchNameEn(code: string): string {
  return PITCH_NAMES_EN[code] || code;
}
