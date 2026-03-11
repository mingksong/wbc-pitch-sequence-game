import type { BatterProfile, Zone, ZoneStats } from './types';

function z(wOBA: number, swingRate: number, whiffRate: number, contactRate: number, hrRate: number): ZoneStats {
  return { wOBA, swingRate, whiffRate, contactRate, hrRate };
}

export const DOM_BATTER_PROFILES: Record<string, BatterProfile> = {
  soto: {
    id: 'soto',
    name: 'Juan Soto',
    nameKo: '후안 소토',
    bats: 'L',
    team: 'Dominican Republic',
    flavorText: '낮은 안쪽(7번 존)과 중간 안쪽(4번 존)에 약하다. 높은 안쪽(1번 존)은 위험 존. SV에 헛스윙이 많다.',
    zones: {
      1: z(0.5, 0.573, 0.163, 0.837, 0.1417),  // high inside
      2: z(0.423, 0.724, 0.173, 0.827, 0.1154),  // high middle
      3: z(0.402, 0.657, 0.068, 0.932, 0.1132),  // high outside
      4: z(0.331, 0.577, 0.108, 0.892, 0.0485),  // middle inside
      5: z(0.483, 0.721, 0.079, 0.921, 0.108),  // dead center
      6: z(0.436, 0.585, 0.053, 0.947, 0.0736),  // middle outside
      7: z(0.22, 0.429, 0.228, 0.772, 0.0124),  // low inside
      8: z(0.367, 0.503, 0.178, 0.822, 0.0793),  // low middle
      9: z(0.336, 0.381, 0.255, 0.745, 0.0337),  // low outside
      11: z(0.448, 0.211, 0.267, 0.733, 0.0504),  // 하이볼
      12: z(0.462, 0.323, 0.259, 0.741, 0.06),  // 로우볼
      13: z(0.397, 0.13, 0.51, 0.49, 0.0),  // 왼쪽 유인구
      14: z(0.548, 0.086, 0.589, 0.411, 0.0185),  // 오른쪽 유인구
    } as Record<Zone, ZoneStats>,
    pitchTypeStats: {
      CH: { ba: 0.231, whiffRate: 0.265 },
      CU: { ba: 0.174, whiffRate: 0.178 },
      EP: { ba: 0.292, whiffRate: 0.236 },
      FC: { ba: 0.326, whiffRate: 0.172 },
      FF: { ba: 0.306, whiffRate: 0.155 },
      FO: { ba: 0.24, whiffRate: 0.24 },
      FS: { ba: 0.286, whiffRate: 0.255 },
      KC: { ba: 0.278, whiffRate: 0.21 },
      SC: { ba: 0.25, whiffRate: 0.279 },
      SI: { ba: 0.306, whiffRate: 0.123 },
      SL: { ba: 0.263, whiffRate: 0.271 },
      ST: { ba: 0.252, whiffRate: 0.247 },
      SV: { ba: 0.13, whiffRate: 0.301 },
    },
  },

  tatis: {
    id: 'tatis',
    name: 'Fernando Tatis Jr.',
    nameKo: '페르난도 타티스 주니어',
    bats: 'R',
    team: 'Dominican Republic',
    flavorText: '높은 바깥쪽(3번 존)과 높은 가운데(2번 존)에 약하다. 중앙(5번 존)은 위험 존. 스플리터에 헛스윙이 많다.',
    zones: {
      1: z(0.349, 0.54, 0.283, 0.717, 0.0351),  // high inside
      2: z(0.313, 0.701, 0.247, 0.753, 0.0923),  // high middle
      3: z(0.264, 0.633, 0.395, 0.605, 0.0652),  // high outside
      4: z(0.368, 0.766, 0.103, 0.897, 0.06),  // middle inside
      5: z(0.471, 0.896, 0.17, 0.83, 0.0746),  // dead center
      6: z(0.336, 0.806, 0.169, 0.831, 0.0617),  // middle outside
      7: z(0.357, 0.689, 0.133, 0.867, 0.0424),  // low inside
      8: z(0.445, 0.774, 0.112, 0.888, 0.078),  // low middle
      9: z(0.321, 0.69, 0.213, 0.787, 0.0203),  // low outside
      11: z(0.464, 0.166, 0.297, 0.703, 0.0294),  // 하이볼
      12: z(0.4, 0.239, 0.322, 0.678, 0.0392),  // 로우볼
      13: z(0.366, 0.299, 0.417, 0.583, 0.0099),  // 왼쪽 유인구
      14: z(0.248, 0.315, 0.567, 0.433, 0.0044),  // 오른쪽 유인구
    } as Record<Zone, ZoneStats>,
    pitchTypeStats: {
      CH: { ba: 0.186, whiffRate: 0.36 },
      CS: { ba: 0.25, whiffRate: 0.227 },
      CU: { ba: 0.229, whiffRate: 0.305 },
      EP: { ba: 0.318, whiffRate: 0.227 },
      FA: { ba: 0.301, whiffRate: 0.219 },
      FC: { ba: 0.26, whiffRate: 0.244 },
      FF: { ba: 0.296, whiffRate: 0.227 },
      FO: { ba: 0.227, whiffRate: 0.227 },
      FS: { ba: 0.216, whiffRate: 0.43 },
      KC: { ba: 0.256, whiffRate: 0.342 },
      SI: { ba: 0.317, whiffRate: 0.127 },
      SL: { ba: 0.252, whiffRate: 0.343 },
      ST: { ba: 0.22, whiffRate: 0.379 },
      SV: { ba: 0.279, whiffRate: 0.201 },
    },
  },

  guerrero: {
    id: 'guerrero',
    name: 'Vladimir Guerrero Jr.',
    nameKo: '블라디미르 게레로 주니어',
    bats: 'R',
    team: 'Dominican Republic',
    flavorText: '낮은 바깥쪽(9번 존)과 높은 안쪽(1번 존)에 약하다. 중앙(5번 존)은 위험 존. 너클커브에 헛스윙이 많다.',
    zones: {
      1: z(0.332, 0.704, 0.153, 0.847, 0.0341),  // high inside
      2: z(0.404, 0.712, 0.217, 0.783, 0.093),  // high middle
      3: z(0.466, 0.573, 0.197, 0.803, 0.0508),  // high outside
      4: z(0.429, 0.742, 0.061, 0.939, 0.0466),  // middle inside
      5: z(0.526, 0.767, 0.078, 0.922, 0.0996),  // dead center
      6: z(0.338, 0.683, 0.164, 0.836, 0.0404),  // middle outside
      7: z(0.351, 0.619, 0.138, 0.862, 0.05),  // low inside
      8: z(0.366, 0.675, 0.129, 0.871, 0.0516),  // low middle
      9: z(0.322, 0.588, 0.186, 0.814, 0.02),  // low outside
      11: z(0.449, 0.228, 0.174, 0.826, 0.0541),  // 하이볼
      12: z(0.344, 0.203, 0.27, 0.73, 0.0312),  // 로우볼
      13: z(0.392, 0.323, 0.262, 0.738, 0.02),  // 왼쪽 유인구
      14: z(0.305, 0.26, 0.509, 0.491, 0.0),  // 오른쪽 유인구
    } as Record<Zone, ZoneStats>,
    pitchTypeStats: {
      CH: { ba: 0.264, whiffRate: 0.272 },
      CS: { ba: 0.25, whiffRate: 0.24 },
      CU: { ba: 0.256, whiffRate: 0.228 },
      EP: { ba: 0.264, whiffRate: 0.264 },
      FA: { ba: 0.264, whiffRate: 0.236 },
      FC: { ba: 0.347, whiffRate: 0.23 },
      FF: { ba: 0.307, whiffRate: 0.168 },
      FO: { ba: 0.25, whiffRate: 0.265 },
      FS: { ba: 0.314, whiffRate: 0.33 },
      KC: { ba: 0.412, whiffRate: 0.367 },
      KN: { ba: 0.25, whiffRate: 0.223 },
      PO: { ba: 0.25, whiffRate: 0.25 },
      SI: { ba: 0.317, whiffRate: 0.081 },
      SL: { ba: 0.298, whiffRate: 0.252 },
      ST: { ba: 0.238, whiffRate: 0.289 },
      SV: { ba: 0.242, whiffRate: 0.194 },
    },
  },

  machado: {
    id: 'machado',
    name: 'Manny Machado',
    nameKo: '매니 머차도',
    bats: 'R',
    team: 'Dominican Republic',
    flavorText: '낮은 바깥쪽(9번 존)과 높은 바깥쪽(3번 존)에 약하다. 낮은 안쪽(7번 존)은 위험 존. 스플리터에 헛스윙이 많다.',
    zones: {
      1: z(0.349, 0.707, 0.25, 0.75, 0.0435),  // high inside
      2: z(0.474, 0.797, 0.22, 0.78, 0.12),  // high middle
      3: z(0.263, 0.665, 0.236, 0.764, 0.0806),  // high outside
      4: z(0.389, 0.815, 0.084, 0.916, 0.0455),  // middle inside
      5: z(0.394, 0.807, 0.115, 0.885, 0.0909),  // dead center
      6: z(0.392, 0.707, 0.139, 0.861, 0.0833),  // middle outside
      7: z(0.479, 0.653, 0.091, 0.909, 0.1042),  // low inside
      8: z(0.356, 0.667, 0.147, 0.853, 0.0402),  // low middle
      9: z(0.239, 0.566, 0.228, 0.772, 0.0051),  // low outside
      11: z(0.357, 0.31, 0.304, 0.696, 0.0154),  // 하이볼
      12: z(0.319, 0.285, 0.278, 0.722, 0.0222),  // 로우볼
      13: z(0.263, 0.327, 0.289, 0.711, 0.0086),  // 왼쪽 유인구
      14: z(0.262, 0.29, 0.555, 0.445, 0.0),  // 오른쪽 유인구
    } as Record<Zone, ZoneStats>,
    pitchTypeStats: {
      CH: { ba: 0.275, whiffRate: 0.269 },
      CS: { ba: 0.25, whiffRate: 0.264 },
      CU: { ba: 0.253, whiffRate: 0.345 },
      EP: { ba: 0.295, whiffRate: 0.223 },
      FC: { ba: 0.266, whiffRate: 0.218 },
      FF: { ba: 0.237, whiffRate: 0.218 },
      FO: { ba: 0.231, whiffRate: 0.256 },
      FS: { ba: 0.14, whiffRate: 0.374 },
      KC: { ba: 0.229, whiffRate: 0.298 },
      SC: { ba: 0.265, whiffRate: 0.245 },
      SI: { ba: 0.359, whiffRate: 0.105 },
      SL: { ba: 0.244, whiffRate: 0.311 },
      ST: { ba: 0.219, whiffRate: 0.269 },
      SV: { ba: 0.21, whiffRate: 0.234 },
    },
  },

  jrod: {
    id: 'jrod',
    name: 'Julio Rodriguez',
    nameKo: '훌리오 로드리게스',
    bats: 'R',
    team: 'Dominican Republic',
    flavorText: '높은 안쪽(1번 존)과 중간 바깥쪽(6번 존)에 약하다. 높은 가운데(2번 존)은 위험 존. 너클커브에 헛스윙이 많다.',
    zones: {
      1: z(0.318, 0.716, 0.131, 0.869, 0.0598),  // high inside
      2: z(0.47, 0.799, 0.243, 0.757, 0.1197),  // high middle
      3: z(0.341, 0.682, 0.262, 0.738, 0.0588),  // high outside
      4: z(0.402, 0.749, 0.062, 0.938, 0.067),  // middle inside
      5: z(0.457, 0.8, 0.118, 0.882, 0.0726),  // dead center
      6: z(0.328, 0.703, 0.208, 0.792, 0.0452),  // middle outside
      7: z(0.357, 0.715, 0.171, 0.829, 0.0667),  // low inside
      8: z(0.357, 0.781, 0.182, 0.818, 0.0289),  // low middle
      9: z(0.388, 0.655, 0.251, 0.749, 0.0411),  // low outside
      11: z(0.385, 0.341, 0.264, 0.736, 0.0248),  // 하이볼
      12: z(0.28, 0.304, 0.408, 0.592, 0.0326),  // 로우볼
      13: z(0.274, 0.443, 0.436, 0.564, 0.0391),  // 왼쪽 유인구
      14: z(0.246, 0.371, 0.576, 0.424, 0.0),  // 오른쪽 유인구
    } as Record<Zone, ZoneStats>,
    pitchTypeStats: {
      CH: { ba: 0.222, whiffRate: 0.326 },
      CU: { ba: 0.274, whiffRate: 0.373 },
      FA: { ba: 0.192, whiffRate: 0.258 },
      FC: { ba: 0.231, whiffRate: 0.299 },
      FF: { ba: 0.294, whiffRate: 0.225 },
      FO: { ba: 0.231, whiffRate: 0.269 },
      FS: { ba: 0.276, whiffRate: 0.474 },
      KC: { ba: 0.189, whiffRate: 0.476 },
      SI: { ba: 0.317, whiffRate: 0.126 },
      SL: { ba: 0.267, whiffRate: 0.324 },
      ST: { ba: 0.238, whiffRate: 0.36 },
      SV: { ba: 0.184, whiffRate: 0.358 },
    },
  },

  marte: {
    id: 'marte',
    name: 'Starling Marte',
    nameKo: '스탈링 마르떼',
    bats: 'R',
    team: 'Dominican Republic',
    flavorText: '낮은 바깥쪽(9번 존)과 높은 안쪽(1번 존)에 약하다. 높은 바깥쪽(3번 존)은 위험 존. 너클커브에 헛스윙이 많다.',
    zones: {
      1: z(0.255, 0.589, 0.111, 0.889, 0.0227),  // high inside
      2: z(0.354, 0.706, 0.192, 0.808, 0.0526),  // high middle
      3: z(0.408, 0.559, 0.158, 0.842, 0.0),  // high outside
      4: z(0.339, 0.729, 0.076, 0.924, 0.0351),  // middle inside
      5: z(0.363, 0.754, 0.079, 0.921, 0.0174),  // dead center
      6: z(0.301, 0.708, 0.127, 0.873, 0.0183),  // middle outside
      7: z(0.385, 0.658, 0.188, 0.812, 0.0735),  // low inside
      8: z(0.33, 0.758, 0.151, 0.849, 0.024),  // low middle
      9: z(0.219, 0.647, 0.258, 0.742, 0.0097),  // low outside
      11: z(0.484, 0.22, 0.19, 0.81, 0.0),  // 하이볼
      12: z(0.401, 0.24, 0.208, 0.792, 0.0),  // 로우볼
      13: z(0.289, 0.374, 0.453, 0.547, 0.0114),  // 왼쪽 유인구
      14: z(0.218, 0.372, 0.594, 0.406, 0.0),  // 오른쪽 유인구
    } as Record<Zone, ZoneStats>,
    pitchTypeStats: {
      CH: { ba: 0.237, whiffRate: 0.335 },
      CU: { ba: 0.284, whiffRate: 0.244 },
      EP: { ba: 0.306, whiffRate: 0.231 },
      FA: { ba: 0.208, whiffRate: 0.208 },
      FC: { ba: 0.256, whiffRate: 0.291 },
      FF: { ba: 0.284, whiffRate: 0.141 },
      FS: { ba: 0.182, whiffRate: 0.39 },
      KC: { ba: 0.136, whiffRate: 0.477 },
      KN: { ba: 0.33, whiffRate: 0.223 },
      SC: { ba: 0.306, whiffRate: 0.269 },
      SI: { ba: 0.245, whiffRate: 0.148 },
      SL: { ba: 0.257, whiffRate: 0.369 },
      ST: { ba: 0.186, whiffRate: 0.32 },
      SV: { ba: 0.169, whiffRate: 0.25 },
    },
  },

  pena: {
    id: 'pena',
    name: 'Jeremy Pena',
    nameKo: '제레미 페냐',
    bats: 'R',
    team: 'Dominican Republic',
    flavorText: '낮은 바깥쪽(9번 존)과 중간 바깥쪽(6번 존)에 약하다. 낮은 가운데(8번 존)은 위험 존. 스플리터에 헛스윙이 많다.',
    zones: {
      1: z(0.354, 0.757, 0.136, 0.864, 0.0282),  // high inside
      2: z(0.36, 0.799, 0.093, 0.907, 0.0426),  // high middle
      3: z(0.436, 0.729, 0.124, 0.876, 0.0175),  // high outside
      4: z(0.369, 0.733, 0.04, 0.96, 0.0429),  // middle inside
      5: z(0.374, 0.807, 0.055, 0.945, 0.0609),  // dead center
      6: z(0.268, 0.688, 0.096, 0.904, 0.0111),  // middle outside
      7: z(0.37, 0.591, 0.134, 0.866, 0.013),  // low inside
      8: z(0.509, 0.729, 0.114, 0.886, 0.0357),  // low middle
      9: z(0.251, 0.654, 0.196, 0.804, 0.0195),  // low outside
      11: z(0.473, 0.331, 0.238, 0.762, 0.0167),  // 하이볼
      12: z(0.328, 0.341, 0.214, 0.786, 0.0),  // 로우볼
      13: z(0.293, 0.291, 0.534, 0.466, 0.0172),  // 왼쪽 유인구
      14: z(0.225, 0.395, 0.593, 0.407, 0.0),  // 오른쪽 유인구
    } as Record<Zone, ZoneStats>,
    pitchTypeStats: {
      CH: { ba: 0.228, whiffRate: 0.395 },
      CS: { ba: 0.25, whiffRate: 0.24 },
      CU: { ba: 0.279, whiffRate: 0.356 },
      EP: { ba: 0.259, whiffRate: 0.223 },
      FA: { ba: 0.385, whiffRate: 0.205 },
      FC: { ba: 0.252, whiffRate: 0.191 },
      FF: { ba: 0.321, whiffRate: 0.124 },
      FS: { ba: 0.176, whiffRate: 0.488 },
      KC: { ba: 0.261, whiffRate: 0.349 },
      KN: { ba: 0.227, whiffRate: 0.273 },
      SC: { ba: 0.24, whiffRate: 0.26 },
      SI: { ba: 0.315, whiffRate: 0.098 },
      SL: { ba: 0.246, whiffRate: 0.332 },
      ST: { ba: 0.253, whiffRate: 0.35 },
      SV: { ba: 0.184, whiffRate: 0.286 },
    },
  },

  wells: {
    id: 'wells',
    name: 'Austin Wells',
    nameKo: '오스틴 웰스',
    bats: 'L',
    team: 'Dominican Republic',
    flavorText: '중간 안쪽(4번 존)과 높은 안쪽(1번 존)에 약하다. 중간 바깥쪽(6번 존)은 위험 존. 스플리터에 헛스윙이 많다.',
    zones: {
      1: z(0.237, 0.499, 0.103, 0.897, 0.0103),  // high inside
      2: z(0.425, 0.66, 0.047, 0.953, 0.0633),  // high middle
      3: z(0.376, 0.605, 0.029, 0.971, 0.0617),  // high outside
      4: z(0.207, 0.585, 0.084, 0.916, 0.0),  // middle inside
      5: z(0.41, 0.706, 0.024, 0.976, 0.0656),  // dead center
      6: z(0.507, 0.593, 0.065, 0.935, 0.1089),  // middle outside
      7: z(0.265, 0.487, 0.223, 0.777, 0.0),  // low inside
      8: z(0.269, 0.614, 0.128, 0.872, 0.0074),  // low middle
      9: z(0.265, 0.539, 0.265, 0.735, 0.0),  // low outside
      11: z(0.428, 0.163, 0.227, 0.773, 0.0),  // 하이볼
      12: z(0.382, 0.327, 0.102, 0.898, 0.0208),  // 로우볼
      13: z(0.267, 0.235, 0.523, 0.477, 0.0),  // 왼쪽 유인구
      14: z(0.372, 0.204, 0.561, 0.439, 0.0),  // 오른쪽 유인구
    } as Record<Zone, ZoneStats>,
    pitchTypeStats: {
      CH: { ba: 0.216, whiffRate: 0.3 },
      CS: { ba: 0.25, whiffRate: 0.25 },
      CU: { ba: 0.155, whiffRate: 0.274 },
      EP: { ba: 0.219, whiffRate: 0.219 },
      FA: { ba: 0.25, whiffRate: 0.212 },
      FC: { ba: 0.262, whiffRate: 0.087 },
      FF: { ba: 0.288, whiffRate: 0.076 },
      FO: { ba: 0.231, whiffRate: 0.269 },
      FS: { ba: 0.136, whiffRate: 0.314 },
      KC: { ba: 0.261, whiffRate: 0.308 },
      SC: { ba: 0.25, whiffRate: 0.25 },
      SI: { ba: 0.311, whiffRate: 0.076 },
      SL: { ba: 0.284, whiffRate: 0.259 },
      ST: { ba: 0.147, whiffRate: 0.293 },
      SV: { ba: 0.152, whiffRate: 0.283 },
    },
  },

  perdomo: {
    id: 'perdomo',
    name: 'Geraldo Perdomo',
    nameKo: '헤랄도 페르도모',
    bats: 'S',
    team: 'Dominican Republic',
    flavorText: '높은 안쪽(1번 존)과 높은 가운데(2번 존)에 약하다. 중앙(5번 존)은 위험 존. SV에 헛스윙이 많다.',
    zones: {
      1: z(0.13, 0.432, 0.195, 0.805, 0.0),  // high inside
      2: z(0.21, 0.642, 0.09, 0.91, 0.0088),  // high middle
      3: z(0.339, 0.566, 0.065, 0.935, 0.0588),  // high outside
      4: z(0.335, 0.574, 0.083, 0.917, 0.0129),  // middle inside
      5: z(0.397, 0.709, 0.023, 0.977, 0.0327),  // dead center
      6: z(0.289, 0.602, 0.041, 0.959, 0.0144),  // middle outside
      7: z(0.332, 0.514, 0.077, 0.923, 0.0227),  // low inside
      8: z(0.378, 0.609, 0.064, 0.936, 0.0365),  // low middle
      9: z(0.303, 0.456, 0.094, 0.906, 0.0326),  // low outside
      11: z(0.5, 0.109, 0.247, 0.753, 0.0),  // 하이볼
      12: z(0.473, 0.141, 0.116, 0.884, 0.0),  // 로우볼
      13: z(0.356, 0.275, 0.228, 0.772, 0.0),  // 왼쪽 유인구
      14: z(0.417, 0.206, 0.335, 0.665, 0.0106),  // 오른쪽 유인구
    } as Record<Zone, ZoneStats>,
    pitchTypeStats: {
      CH: { ba: 0.253, whiffRate: 0.126 },
      CS: { ba: 0.25, whiffRate: 0.25 },
      CU: { ba: 0.26, whiffRate: 0.155 },
      EP: { ba: 0.265, whiffRate: 0.245 },
      FC: { ba: 0.323, whiffRate: 0.107 },
      FF: { ba: 0.265, whiffRate: 0.083 },
      FO: { ba: 0.202, whiffRate: 0.266 },
      FS: { ba: 0.204, whiffRate: 0.146 },
      KC: { ba: 0.071, whiffRate: 0.242 },
      KN: { ba: 0.202, whiffRate: 0.202 },
      SI: { ba: 0.315, whiffRate: 0.064 },
      SL: { ba: 0.247, whiffRate: 0.202 },
      ST: { ba: 0.171, whiffRate: 0.143 },
      SV: { ba: 0.25, whiffRate: 0.297 },
    },
  },

  cruz: {
    id: 'cruz',
    name: 'Oneil Cruz',
    nameKo: '오닐 크루즈',
    bats: 'L',
    team: 'Dominican Republic',
    flavorText: '중간 안쪽(4번 존)과 낮은 안쪽(7번 존)에 약하다. 높은 안쪽(1번 존)은 위험 존. 너클커브에 헛스윙이 많다.',
    zones: {
      1: z(0.48, 0.63, 0.192, 0.808, 0.1296),  // high inside
      2: z(0.346, 0.708, 0.237, 0.763, 0.0625),  // high middle
      3: z(0.423, 0.591, 0.077, 0.923, 0.0303),  // high outside
      4: z(0.22, 0.603, 0.209, 0.791, 0.0427),  // middle inside
      5: z(0.339, 0.719, 0.186, 0.814, 0.0762),  // dead center
      6: z(0.377, 0.589, 0.129, 0.871, 0.086),  // middle outside
      7: z(0.276, 0.546, 0.3, 0.7, 0.0075),  // low inside
      8: z(0.368, 0.568, 0.257, 0.743, 0.0574),  // low middle
      9: z(0.353, 0.58, 0.298, 0.702, 0.0617),  // low outside
      11: z(0.479, 0.227, 0.228, 0.772, 0.0909),  // 하이볼
      12: z(0.335, 0.265, 0.22, 0.78, 0.0),  // 로우볼
      13: z(0.256, 0.325, 0.533, 0.467, 0.0057),  // 왼쪽 유인구
      14: z(0.299, 0.302, 0.615, 0.385, 0.0109),  // 오른쪽 유인구
    } as Record<Zone, ZoneStats>,
    pitchTypeStats: {
      CH: { ba: 0.254, whiffRate: 0.433 },
      CS: { ba: 0.25, whiffRate: 0.25 },
      CU: { ba: 0.194, whiffRate: 0.473 },
      FC: { ba: 0.282, whiffRate: 0.222 },
      FF: { ba: 0.282, whiffRate: 0.184 },
      FS: { ba: 0.263, whiffRate: 0.398 },
      KC: { ba: 0.121, whiffRate: 0.507 },
      SC: { ba: 0.245, whiffRate: 0.245 },
      SI: { ba: 0.227, whiffRate: 0.194 },
      SL: { ba: 0.191, whiffRate: 0.402 },
      ST: { ba: 0.159, whiffRate: 0.446 },
      SV: { ba: 0.167, whiffRate: 0.258 },
    },
  },

  ramirez: {
    id: 'ramirez',
    name: 'Jose Ramirez',
    nameKo: '호세 라미레스',
    bats: 'S',
    team: 'Dominican Republic',
    flavorText: '낮은 안쪽(7번 존)과 높은 안쪽(1번 존)에 약하다. 높은 바깥쪽(3번 존)은 위험 존. 피치아웃에 헛스윙이 많다.',
    zones: {
      1: z(0.317, 0.59, 0.146, 0.854, 0.0531),  // high inside
      2: z(0.422, 0.741, 0.099, 0.901, 0.0677),  // high middle
      3: z(0.456, 0.592, 0.083, 0.917, 0.0909),  // high outside
      4: z(0.356, 0.659, 0.065, 0.935, 0.0314),  // middle inside
      5: z(0.448, 0.732, 0.044, 0.956, 0.0976),  // dead center
      6: z(0.343, 0.685, 0.057, 0.943, 0.0577),  // middle outside
      7: z(0.307, 0.658, 0.08, 0.92, 0.0553),  // low inside
      8: z(0.425, 0.712, 0.086, 0.914, 0.0758),  // low middle
      9: z(0.343, 0.649, 0.113, 0.887, 0.0435),  // low outside
      11: z(0.373, 0.202, 0.252, 0.748, 0.0175),  // 하이볼
      12: z(0.388, 0.265, 0.183, 0.817, 0.0385),  // 로우볼
      13: z(0.291, 0.373, 0.231, 0.769, 0.008),  // 왼쪽 유인구
      14: z(0.327, 0.311, 0.355, 0.645, 0.0141),  // 오른쪽 유인구
    } as Record<Zone, ZoneStats>,
    pitchTypeStats: {
      CH: { ba: 0.286, whiffRate: 0.192 },
      CS: { ba: 0.227, whiffRate: 0.227 },
      CU: { ba: 0.289, whiffRate: 0.149 },
      FA: { ba: 0.25, whiffRate: 0.219 },
      FC: { ba: 0.281, whiffRate: 0.147 },
      FF: { ba: 0.288, whiffRate: 0.094 },
      FS: { ba: 0.262, whiffRate: 0.207 },
      KC: { ba: 0.333, whiffRate: 0.18 },
      KN: { ba: 0.216, whiffRate: 0.216 },
      PO: { ba: 0.25, whiffRate: 0.25 },
      SC: { ba: 0.25, whiffRate: 0.25 },
      SI: { ba: 0.315, whiffRate: 0.075 },
      SL: { ba: 0.223, whiffRate: 0.17 },
      ST: { ba: 0.253, whiffRate: 0.186 },
      SV: { ba: 0.23, whiffRate: 0.23 },
    },
  },

  rosario: {
    id: 'rosario',
    name: 'Amed Rosario',
    nameKo: '아메드 로사리오',
    bats: 'R',
    team: 'Dominican Republic',
    flavorText: '낮은 바깥쪽(9번 존)과 높은 안쪽(1번 존)에 약하다. 중앙(5번 존)은 위험 존. 너클커브에 헛스윙이 많다.',
    zones: {
      1: z(0.275, 0.676, 0.139, 0.861, 0.0652),  // high inside
      2: z(0.398, 0.746, 0.127, 0.873, 0.0333),  // high middle
      3: z(0.31, 0.736, 0.128, 0.872, 0.0213),  // high outside
      4: z(0.341, 0.758, 0.076, 0.924, 0.0),  // middle inside
      5: z(0.409, 0.787, 0.103, 0.897, 0.0374),  // dead center
      6: z(0.385, 0.718, 0.105, 0.895, 0.0182),  // middle outside
      7: z(0.405, 0.732, 0.099, 0.901, 0.0147),  // low inside
      8: z(0.362, 0.706, 0.149, 0.851, 0.0128),  // low middle
      9: z(0.193, 0.582, 0.246, 0.754, 0.0),  // low outside
      11: z(0.33, 0.378, 0.283, 0.717, 0.0182),  // 하이볼
      12: z(0.289, 0.352, 0.259, 0.741, 0.0189),  // 로우볼
      13: z(0.264, 0.444, 0.293, 0.707, 0.0),  // 왼쪽 유인구
      14: z(0.241, 0.374, 0.51, 0.49, 0.0),  // 오른쪽 유인구
    } as Record<Zone, ZoneStats>,
    pitchTypeStats: {
      CH: { ba: 0.298, whiffRate: 0.248 },
      CS: { ba: 0.245, whiffRate: 0.245 },
      CU: { ba: 0.339, whiffRate: 0.273 },
      EP: { ba: 0.227, whiffRate: 0.227 },
      FA: { ba: 0.24, whiffRate: 0.24 },
      FC: { ba: 0.297, whiffRate: 0.227 },
      FF: { ba: 0.259, whiffRate: 0.17 },
      FS: { ba: 0.357, whiffRate: 0.273 },
      KC: { ba: 0.158, whiffRate: 0.436 },
      KN: { ba: 0.25, whiffRate: 0.25 },
      PO: { ba: 0.25, whiffRate: 0.25 },
      SI: { ba: 0.287, whiffRate: 0.108 },
      SL: { ba: 0.262, whiffRate: 0.271 },
      ST: { ba: 0.198, whiffRate: 0.291 },
      SV: { ba: 0.267, whiffRate: 0.276 },
    },
  },

  santana: {
    id: 'santana',
    name: 'Carlos Santana',
    nameKo: '카를로스 산타나',
    bats: 'S',
    team: 'Dominican Republic',
    flavorText: '높은 안쪽(1번 존)과 낮은 안쪽(7번 존)에 약하다. 중앙(5번 존)은 위험 존. 너클커브에 헛스윙이 많다.',
    zones: {
      1: z(0.193, 0.632, 0.212, 0.788, 0.0),  // high inside
      2: z(0.286, 0.691, 0.174, 0.826, 0.0492),  // high middle
      3: z(0.372, 0.567, 0.178, 0.822, 0.0984),  // high outside
      4: z(0.334, 0.745, 0.1, 0.9, 0.0374),  // middle inside
      5: z(0.372, 0.76, 0.086, 0.914, 0.0596),  // dead center
      6: z(0.303, 0.641, 0.117, 0.883, 0.0381),  // middle outside
      7: z(0.195, 0.625, 0.152, 0.848, 0.0222),  // low inside
      8: z(0.35, 0.678, 0.198, 0.802, 0.0606),  // low middle
      9: z(0.207, 0.556, 0.185, 0.815, 0.0139),  // low outside
      11: z(0.404, 0.212, 0.282, 0.718, 0.0337),  // 하이볼
      12: z(0.414, 0.205, 0.226, 0.774, 0.06),  // 로우볼
      13: z(0.31, 0.319, 0.39, 0.61, 0.0057),  // 왼쪽 유인구
      14: z(0.37, 0.2, 0.49, 0.51, 0.02),  // 오른쪽 유인구
    } as Record<Zone, ZoneStats>,
    pitchTypeStats: {
      CH: { ba: 0.264, whiffRate: 0.262 },
      CU: { ba: 0.191, whiffRate: 0.282 },
      FA: { ba: 0.279, whiffRate: 0.24 },
      FC: { ba: 0.211, whiffRate: 0.199 },
      FF: { ba: 0.253, whiffRate: 0.158 },
      FO: { ba: 0.227, whiffRate: 0.273 },
      FS: { ba: 0.236, whiffRate: 0.242 },
      KC: { ba: 0.273, whiffRate: 0.32 },
      KN: { ba: 0.342, whiffRate: 0.219 },
      PO: { ba: 0.25, whiffRate: 0.25 },
      SI: { ba: 0.251, whiffRate: 0.137 },
      SL: { ba: 0.173, whiffRate: 0.303 },
      ST: { ba: 0.203, whiffRate: 0.268 },
      SV: { ba: 0.198, whiffRate: 0.224 },
    },
  },

  lake: {
    id: 'lake',
    name: 'Junior Lake',
    nameKo: '주니어 레이크',
    bats: 'R',
    team: 'Dominican Republic',
    flavorText: '공격적인 자유 스윙어. 유인구를 적극 활용하면 쉽게 잡을 수 있다.',
    zones: {
      // Lake: aggressive free swinger
      1: z(0.280, 0.78, 0.28, 0.72, 0.05),  // high inside
      2: z(0.340, 0.82, 0.22, 0.78, 0.08),  // high middle
      3: z(0.260, 0.70, 0.30, 0.70, 0.04),  // high outside
      4: z(0.360, 0.80, 0.20, 0.80, 0.09),  // middle inside
      5: z(0.400, 0.83, 0.17, 0.83, 0.10),  // dead center
      6: z(0.290, 0.70, 0.28, 0.72, 0.05),  // middle outside
      7: z(0.300, 0.72, 0.26, 0.74, 0.06),  // low inside
      8: z(0.310, 0.74, 0.24, 0.76, 0.06),  // low middle
      9: z(0.240, 0.62, 0.36, 0.64, 0.03),  // low outside
      // Very aggressive chaser
      11: z(0.220, 0.52, 0.42, 0.58, 0.02), // 하이볼
      12: z(0.185, 0.46, 0.48, 0.52, 0.02), // 로우볼
      13: z(0.205, 0.50, 0.44, 0.56, 0.02), // 왼쪽 유인구
      14: z(0.190, 0.48, 0.46, 0.54, 0.01), // 오른쪽 유인구
    } as Record<Zone, ZoneStats>,
    pitchTypeStats: {
      FF: { ba: 0.265, whiffRate: 0.26 },
      SI: { ba: 0.252, whiffRate: 0.24 },
      SL: { ba: 0.210, whiffRate: 0.40 },
      CU: { ba: 0.195, whiffRate: 0.44 },
      CH: { ba: 0.205, whiffRate: 0.42 },
      FC: { ba: 0.235, whiffRate: 0.30 },
      ST: { ba: 0.200, whiffRate: 0.43 },
      FS: { ba: 0.190, whiffRate: 0.45 },
    },
  },

};
