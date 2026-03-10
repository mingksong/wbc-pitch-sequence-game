import type { PitcherRepertoire } from './types';

export const PITCHER_REPERTOIRE: Record<string, PitcherRepertoire> = {
  ko: {
    id: 'ko',
    name: 'Young-Pyo Ko',
    nameKo: '고영표',
    hand: 'R',
    style: '잠수함 (언더핸드)',
    pitches: [
      {
        code: 'SI',
        name: 'Sinker',
        nameKo: '싱커',
        avgSpeed: 84,
        movement: '좌우 무빙 + 낙차, 잠수함 특유의 아래에서 떠오르는 궤적',
      },
      {
        code: 'CH',
        name: 'Changeup',
        nameKo: '체인지업',
        avgSpeed: 74,
        movement: '싱커와 비슷한 궤적에서 급격한 낙차',
      },
      {
        code: 'SL',
        name: 'Slider',
        nameKo: '슬라이더',
        avgSpeed: 78,
        movement: '횡방향 무빙, 좌타자 바깥으로 빠지는 공',
      },
    ],
  },
  kim: {
    id: 'kim',
    name: 'Young-Kyu Kim',
    nameKo: '김영규',
    hand: 'L',
    style: '좌완 중계',
    pitches: [
      {
        code: 'FF',
        name: '4-Seam Fastball',
        nameKo: '포심 패스트볼',
        avgSpeed: 92,
        movement: '직선적 구위, 높은 존에서 위력적',
      },
      {
        code: 'SL',
        name: 'Slider',
        nameKo: '슬라이더',
        avgSpeed: 84,
        movement: '날카로운 횡방향 무빙',
      },
      {
        code: 'CH',
        name: 'Changeup',
        nameKo: '체인지업',
        avgSpeed: 85,
        movement: '패스트볼과 비슷한 팔 동작에서 속도 차이',
      },
    ],
  },
};
