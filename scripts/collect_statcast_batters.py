#!/usr/bin/env python3
"""
collect_statcast_batters.py

Fetches 2023-2025 Statcast data for Dominican Republic WBC batters via pybaseball,
computes zone stats, pitch type stats, velocity band stats, and run value matrix,
then outputs TypeScript files directly.

Usage:
    /Users/mksong/Documents/JavaScript/RealTimePitchTracker/NaverBaseballRelay/.venv/bin/python \
        scripts/collect_statcast_batters.py

Output files (relative to wbc-catcher-game/):
    src/data/domBatterProfiles.ts   - per-batter zone/pitchType stats
    src/data/velocityBandData.ts    - velocity band BA/SLG
    src/data/runValueMatrix.ts      - league-wide run value by count x zone
"""

import os
import sys
import math
import warnings
import traceback
from pathlib import Path

import numpy as np
import pandas as pd

warnings.filterwarnings("ignore")

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
SCRIPT_DIR = Path(__file__).parent.resolve()
APP_DIR = SCRIPT_DIR.parent  # wbc-catcher-game/
DATA_DIR = APP_DIR / "src" / "data"
CACHE_DIR = SCRIPT_DIR / "cache"

os.makedirs(CACHE_DIR, exist_ok=True)
os.makedirs(DATA_DIR, exist_ok=True)

# ---------------------------------------------------------------------------
# Batter registry (MLBAM IDs)
# ---------------------------------------------------------------------------
BATTERS = {
    "soto":     665742,
    "tatis":    665487,
    "guerrero": 665489,
    "machado":  592518,
    "caminero": 694557,
    "jrod":     677594,
    "marte":    516782,
    "pena":     665161,
    "wells":    670770,
    "perdomo":  672695,
    "cruz":     665833,
    "ramirez":  608070,
    "rosario":  642708,
    "santana":  467793,
    # "lake" has no known MLBAM ID — kept verbatim from existing file
}

# Metadata preserved verbatim
BATTER_META = {
    "soto":     dict(name="Juan Soto",                 nameKo="후안 소토",              bats="L"),
    "tatis":    dict(name="Fernando Tatis Jr.",         nameKo="페르난도 타티스 주니어",  bats="R"),
    "guerrero": dict(name="Vladimir Guerrero Jr.",      nameKo="블라디미르 게레로 주니어", bats="R"),
    "machado":  dict(name="Manny Machado",              nameKo="매니 머차도",            bats="R"),
    "caminero": dict(name="Junior Caminero",            nameKo="주니어 카미네로",         bats="R"),
    "jrod":     dict(name="Julio Rodriguez",            nameKo="훌리오 로드리게스",       bats="R"),
    "marte":    dict(name="Starling Marte",             nameKo="스탈링 마르떼",          bats="R"),
    "pena":     dict(name="Jeremy Pena",                nameKo="제레미 페냐",            bats="R"),
    "wells":    dict(name="Austin Wells",               nameKo="오스틴 웰스",            bats="L"),
    "perdomo":  dict(name="Geraldo Perdomo",            nameKo="헤랄도 페르도모",        bats="S"),
    "cruz":     dict(name="Oneil Cruz",                 nameKo="오닐 크루즈",            bats="L"),
    "ramirez":  dict(name="Jose Ramirez",               nameKo="호세 라미레스",          bats="S"),
    "rosario":  dict(name="Amed Rosario",               nameKo="아메드 로사리오",        bats="R"),
    "santana":  dict(name="Carlos Santana",             nameKo="카를로스 산타나",        bats="S"),
    "lake":     dict(name="Junior Lake",                nameKo="주니어 레이크",          bats="R"),
}

DATA_START = "2023-04-01"
DATA_END   = "2025-10-31"

# ---------------------------------------------------------------------------
# Zone helpers
# ---------------------------------------------------------------------------
ALL_ZONES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 12, 13, 14]
STRIKE_ZONES = [1, 2, 3, 4, 5, 6, 7, 8, 9]

SWING_DESCRIPTIONS = {
    "swinging_strike", "swinging_strike_blocked", "foul", "foul_tip",
    "foul_bunt", "hit_into_play", "hit_into_play_no_out",
    "hit_into_play_score", "missed_bunt", "bunt_foul_tip",
}
TAKE_DESCRIPTIONS = {
    "called_strike", "ball", "blocked_ball", "hit_by_pitch", "pitchout",
}
SWINGING_MISS_DESCRIPTIONS = {"swinging_strike", "swinging_strike_blocked"}

AB_EVENTS = {
    "single", "double", "triple", "home_run",
    "strikeout", "strikeout_double_play",
    "field_out", "force_out", "grounded_into_double_play",
    "double_play", "triple_play", "fielders_choice",
    "fielders_choice_out", "sac_fly", "sac_fly_double_play",
    "sac_bunt", "sac_bunt_double_play",
}

# ---------------------------------------------------------------------------
# Velocity bands (3 mph)
# ---------------------------------------------------------------------------
VELOCITY_BANDS = [
    "60-62", "63-65", "66-68", "69-71", "72-74", "75-77",
    "78-80", "81-83", "84-86", "87-89", "90-92", "93-95",
    "96-98", "99-101", "102-105",
]

def velocity_band(velo: float) -> str | None:
    """Return the band label for a given release speed, or None if out of range."""
    if pd.isna(velo):
        return None
    v = float(velo)
    if v < 60 or v > 105:
        return None
    for band in VELOCITY_BANDS:
        parts = band.split("-")
        lo, hi = int(parts[0]), int(parts[1])
        if lo <= v <= hi:
            return band
    return None

# ---------------------------------------------------------------------------
# Data fetching with cache
# ---------------------------------------------------------------------------
def fetch_batter_data(batter_key: str, mlbam_id: int) -> pd.DataFrame | None:
    """
    Fetch Statcast batter data from cache or pybaseball.
    Returns DataFrame or None if no data available.
    """
    cache_path = CACHE_DIR / f"{mlbam_id}.parquet"

    if cache_path.exists():
        print(f"  [cache] Loading {batter_key} ({mlbam_id}) from {cache_path.name}")
        try:
            df = pd.read_parquet(cache_path)
            print(f"  [cache] {len(df):,} pitches loaded")
            return df
        except Exception as e:
            print(f"  [cache] Read error: {e}. Re-fetching...")

    print(f"  [fetch] Downloading {batter_key} ({mlbam_id}) from pybaseball ...")
    try:
        from pybaseball import statcast_batter
        df = statcast_batter(DATA_START, DATA_END, mlbam_id)
        if df is None or len(df) == 0:
            print(f"  [warn] No data returned for {batter_key}")
            return None
        print(f"  [fetch] {len(df):,} pitches retrieved")
        df.to_parquet(cache_path, index=False)
        return df
    except Exception as e:
        print(f"  [error] Failed to fetch {batter_key}: {e}")
        traceback.print_exc()
        return None

# ---------------------------------------------------------------------------
# Stat computation helpers
# ---------------------------------------------------------------------------
def safe_div(num, denom, default=0.0):
    if denom == 0 or pd.isna(denom):
        return default
    return float(num) / float(denom)

def compute_zone_row(group: pd.DataFrame) -> dict:
    """Compute raw zone stats for a DataFrame slice (all pitches in one zone)."""
    n = len(group)
    if n == 0:
        return None

    # wOBA
    woba_df = group[group["woba_denom"].notna() & (group["woba_denom"] > 0)]
    woba = safe_div(woba_df["woba_value"].sum(), woba_df["woba_denom"].sum(), 0.0)

    # Swing / take
    is_swing = group["description"].isin(SWING_DESCRIPTIONS)
    is_take  = group["description"].isin(TAKE_DESCRIPTIONS)
    is_miss  = group["description"].isin(SWINGING_MISS_DESCRIPTIONS)

    n_swing = is_swing.sum()
    n_take  = is_take.sum()
    total   = n_swing + n_take

    swing_rate   = safe_div(n_swing, total)
    whiff_rate   = safe_div(is_miss.sum(), n_swing)
    contact_rate = 1.0 - whiff_rate if n_swing > 0 else 0.0

    # HR rate: HR events / AB events
    ab_mask = group["events"].isin(AB_EVENTS)
    hr_mask = group["events"] == "home_run"
    n_ab = ab_mask.sum()
    n_hr = hr_mask.sum()
    hr_rate = safe_div(n_hr, n_ab)

    return {
        "n": n,
        "wOBA": round(woba, 3),
        "swingRate": round(swing_rate, 3),
        "whiffRate": round(whiff_rate, 3),
        "contactRate": round(contact_rate, 3),
        "hrRate": round(hr_rate, 4),
    }

def compute_overall_zone_stats(df: pd.DataFrame) -> dict:
    """Compute overall (all zones) stats for shrinkage baseline."""
    return compute_zone_row(df)

def apply_shrinkage(zone_val: float, n: int, overall_val: float, k: int = 30) -> float:
    """Bayesian shrinkage toward overall average when sample is small."""
    return (n * zone_val + k * overall_val) / (n + k)

def compute_zones(df: pd.DataFrame) -> dict:
    """
    Compute zone stats for all 14 zones with Bayesian shrinkage.
    Returns dict mapping zone_int -> ZoneStats dict.
    """
    overall = compute_overall_zone_stats(df)
    if overall is None:
        return {}

    zone_stats = {}
    for zone in ALL_ZONES:
        g = df[df["zone"] == zone]
        raw = compute_zone_row(g)
        if raw is None:
            # No pitches in this zone: use overall with full shrinkage
            zone_stats[zone] = {
                "wOBA":        round(overall["wOBA"], 3),
                "swingRate":   round(overall["swingRate"], 3),
                "whiffRate":   round(overall["whiffRate"], 3),
                "contactRate": round(overall["contactRate"], 3),
                "hrRate":      round(overall["hrRate"], 4),
            }
            continue

        n = raw["n"]
        if n < 30:
            # Apply shrinkage
            def shrink(field):
                return round(apply_shrinkage(raw[field], n, overall[field], k=30), 3)
            zone_stats[zone] = {
                "wOBA":        shrink("wOBA"),
                "swingRate":   shrink("swingRate"),
                "whiffRate":   shrink("whiffRate"),
                "contactRate": shrink("contactRate"),
                "hrRate":      round(apply_shrinkage(raw["hrRate"], n, overall["hrRate"], k=30), 4),
            }
        else:
            zone_stats[zone] = {
                "wOBA":        raw["wOBA"],
                "swingRate":   raw["swingRate"],
                "whiffRate":   raw["whiffRate"],
                "contactRate": raw["contactRate"],
                "hrRate":      raw["hrRate"],
            }
    return zone_stats

def compute_pitch_type_stats(df: pd.DataFrame) -> dict:
    """
    Compute BA and whiffRate per pitch_type with shrinkage (k=50 pitches).
    League baseline: BA=0.250, whiff=0.25
    """
    LEAGUE_BA    = 0.250
    LEAGUE_WHIFF = 0.250
    K = 50

    results = {}
    for pt, g in df.groupby("pitch_type"):
        if pd.isna(pt) or pt == "" or pt is None:
            continue

        n = len(g)

        # BA
        ab_mask = g["events"].isin(AB_EVENTS)
        hit_mask = g["events"].isin({"single", "double", "triple", "home_run"})
        n_ab  = ab_mask.sum()
        n_hit = hit_mask.sum()
        ba_raw = safe_div(n_hit, n_ab, LEAGUE_BA)

        # whiff rate
        is_swing = g["description"].isin(SWING_DESCRIPTIONS)
        is_miss  = g["description"].isin(SWINGING_MISS_DESCRIPTIONS)
        n_swing = is_swing.sum()
        n_miss  = is_miss.sum()
        whiff_raw = safe_div(n_miss, n_swing, LEAGUE_WHIFF)

        if n < K:
            ba    = round((n * ba_raw    + K * LEAGUE_BA)    / (n + K), 3)
            whiff = round((n * whiff_raw + K * LEAGUE_WHIFF) / (n + K), 3)
        else:
            ba    = round(ba_raw, 3)
            whiff = round(whiff_raw, 3)

        results[pt] = {"ba": ba, "whiffRate": whiff}

    return results

def compute_velocity_bands(df: pd.DataFrame) -> dict:
    """
    Compute BA and SLG per 3-mph velocity band.
    Returns dict with 'avgBA', 'avgSLG', 'bands'.
    """
    df2 = df.copy()
    df2["vel_band"] = df2["release_speed"].apply(velocity_band)

    def band_stats(g):
        ab_mask  = g["events"].isin(AB_EVENTS)
        hit_mask = g["events"].isin({"single", "double", "triple", "home_run"})
        n_ab  = ab_mask.sum()
        n_1b  = (g["events"] == "single").sum()
        n_2b  = (g["events"] == "double").sum()
        n_3b  = (g["events"] == "triple").sum()
        n_hr  = (g["events"] == "home_run").sum()
        n_hit = n_1b + n_2b + n_3b + n_hr
        total_bases = n_1b + 2*n_2b + 3*n_3b + 4*n_hr
        ba  = round(safe_div(n_hit, n_ab), 3)
        slg = round(safe_div(total_bases, n_ab), 3)
        return ba, slg

    # Overall avg
    all_ba, all_slg = band_stats(df2)

    bands = {}
    for band in VELOCITY_BANDS:
        g = df2[df2["vel_band"] == band]
        if len(g) == 0:
            bands[band] = {"ba": all_ba, "slg": all_slg}
        else:
            ba, slg = band_stats(g)
            bands[band] = {"ba": ba, "slg": slg}

    return {"avgBA": round(all_ba, 3), "avgSLG": round(all_slg, 3), "bands": bands}

# ---------------------------------------------------------------------------
# Flavor text generator
# ---------------------------------------------------------------------------
ZONE_NAMES_KO = {
    1: "높은 안쪽(1번 존)",   2: "높은 가운데(2번 존)",   3: "높은 바깥쪽(3번 존)",
    4: "중간 안쪽(4번 존)",   5: "중앙(5번 존)",           6: "중간 바깥쪽(6번 존)",
    7: "낮은 안쪽(7번 존)",   8: "낮은 가운데(8번 존)",    9: "낮은 바깥쪽(9번 존)",
    11: "하이볼(11번 존)",    12: "로우볼(12번 존)",
    13: "왼쪽 유인구(13번 존)", 14: "오른쪽 유인구(14번 존)",
}

PITCH_NAMES_KO = {
    "FF": "포심 패스트볼", "SI": "싱커", "SL": "슬라이더",
    "CU": "커브", "CH": "체인지업", "FC": "컷패스트볼",
    "ST": "스위퍼", "FS": "스플리터", "KC": "너클커브",
    "EP": "엡구", "FO": "포크볼", "SC": "스크류볼",
    "CS": "슬로우커브", "KN": "너클볼", "PO": "피치아웃",
}

def generate_flavor_text(zone_stats: dict, pitch_type_stats: dict) -> str:
    """Generate Korean flavor text from computed stats."""
    # Find 2 weakest and 1 strongest strike zones by wOBA
    sz = {z: s for z, s in zone_stats.items() if z in STRIKE_ZONES}
    if not sz:
        return "데이터 부족으로 분석 불가."

    sorted_sz = sorted(sz.items(), key=lambda x: x[1]["wOBA"])
    weakest   = sorted_sz[:2]
    strongest = sorted_sz[-1]

    weak_names   = "과 ".join(ZONE_NAMES_KO.get(z, f"{z}번 존") for z, _ in weakest)
    strong_name  = ZONE_NAMES_KO.get(strongest[0], f"{strongest[0]}번 존")

    # Weakest pitch type by whiff (most susceptible = highest whiffRate)
    if pitch_type_stats:
        most_whiff = max(pitch_type_stats.items(), key=lambda x: x[1]["whiffRate"])
        pt_ko = PITCH_NAMES_KO.get(most_whiff[0], most_whiff[0])
        pitch_part = f"{pt_ko}에 헛스윙이 많다."
    else:
        pitch_part = ""

    text = f"{weak_names}에 약하다. {strong_name}은 위험 존. {pitch_part}".strip()
    return text

# ---------------------------------------------------------------------------
# Run Value Matrix (league-wide)
# ---------------------------------------------------------------------------
COUNTS = [
    "0-0", "0-1", "0-2",
    "1-0", "1-1", "1-2",
    "2-0", "2-1", "2-2",
    "3-0", "3-1", "3-2",
]

def compute_run_value_matrix(all_dfs: dict) -> dict:
    """
    Combine all batters' DataFrames and compute mean delta_run_exp
    per count × zone combination.
    Returns: dict[count_str][zone_int] -> float
    """
    frames = [df for df in all_dfs.values() if df is not None and len(df) > 0]
    if not frames:
        print("  [warn] No data for run value matrix")
        return {}

    combined = pd.concat(frames, ignore_index=True)

    # Build count string
    combined["count_str"] = (
        combined["balls"].fillna(0).astype(int).astype(str)
        + "-"
        + combined["strikes"].fillna(0).astype(int).astype(str)
    )
    combined["zone_int"] = combined["zone"].apply(
        lambda z: int(z) if pd.notna(z) else None
    )

    valid = combined[
        combined["delta_run_exp"].notna()
        & combined["count_str"].isin(COUNTS)
        & combined["zone_int"].isin(ALL_ZONES)
    ]

    matrix = {}
    for count in COUNTS:
        matrix[count] = {}
        for zone in ALL_ZONES:
            g = valid[(valid["count_str"] == count) & (valid["zone_int"] == zone)]
            if len(g) == 0:
                matrix[count][zone] = 0.0
            else:
                matrix[count][zone] = round(float(g["delta_run_exp"].mean()), 4)

    return matrix

# ---------------------------------------------------------------------------
# TypeScript writers
# ---------------------------------------------------------------------------
LAKE_VERBATIM = """  lake: {
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
  },"""

def write_dom_batter_profiles(profiles: dict):
    """Write src/data/domBatterProfiles.ts"""
    out_path = DATA_DIR / "domBatterProfiles.ts"
    lines = []
    lines.append("import type { BatterProfile, Zone, ZoneStats } from './types';")
    lines.append("")
    lines.append("function z(wOBA: number, swingRate: number, whiffRate: number, contactRate: number, hrRate: number): ZoneStats {")
    lines.append("  return { wOBA, swingRate, whiffRate, contactRate, hrRate };")
    lines.append("}")
    lines.append("")
    lines.append("export const DOM_BATTER_PROFILES: Record<string, BatterProfile> = {")

    batter_order = list(BATTERS.keys()) + ["lake"]

    for key in batter_order:
        meta = BATTER_META[key]

        if key == "lake":
            lines.append(LAKE_VERBATIM)
            lines.append("")
            continue

        if key not in profiles:
            print(f"  [warn] No profile computed for {key}, skipping")
            continue

        profile = profiles[key]
        zone_stats     = profile["zones"]
        pitch_stats    = profile["pitchTypeStats"]
        flavor         = profile["flavorText"]

        lines.append(f"  {key}: {{")
        lines.append(f"    id: '{key}',")
        lines.append(f"    name: '{meta['name']}',")
        lines.append(f"    nameKo: '{meta['nameKo']}',")
        lines.append(f"    bats: '{meta['bats']}',")
        lines.append(f"    team: 'Dominican Republic',")
        lines.append(f"    flavorText: '{flavor}',")
        lines.append(f"    zones: {{")

        for zone in ALL_ZONES:
            zs = zone_stats.get(zone)
            if zs is None:
                continue
            comment = _zone_comment(zone)
            lines.append(
                f"      {zone}: z({zs['wOBA']}, {zs['swingRate']}, "
                f"{zs['whiffRate']}, {zs['contactRate']}, {zs['hrRate']}),  // {comment}"
            )

        lines.append(f"    }} as Record<Zone, ZoneStats>,")
        lines.append(f"    pitchTypeStats: {{")

        for pt, ps in sorted(pitch_stats.items()):
            lines.append(f"      {pt}: {{ ba: {ps['ba']}, whiffRate: {ps['whiffRate']} }},")

        lines.append(f"    }},")
        lines.append(f"  }},")
        lines.append("")

    lines.append("};")
    lines.append("")

    out_path.write_text("\n".join(lines), encoding="utf-8")
    print(f"[write] {out_path}")

def _zone_comment(zone: int) -> str:
    comments = {
        1: "high inside",  2: "high middle",   3: "high outside",
        4: "middle inside", 5: "dead center",  6: "middle outside",
        7: "low inside",   8: "low middle",    9: "low outside",
        11: "하이볼",       12: "로우볼",
        13: "왼쪽 유인구",  14: "오른쪽 유인구",
    }
    return comments.get(zone, "")

# Japan batters (kept verbatim from existing file)
JAPAN_VELOCITY_VERBATIM = """// Japan batters
const ohtani: BatterVelocityProfile = {
  avgBA: 0.295, avgSLG: 0.595,
  bands: {
    '60-62': { ba: 0.180, slg: 0.220 },
    '63-65': { ba: 0.190, slg: 0.240 },
    '66-68': { ba: 0.200, slg: 0.280 },
    '69-71': { ba: 0.220, slg: 0.320 },
    '72-74': { ba: 0.240, slg: 0.380 },
    '75-77': { ba: 0.260, slg: 0.420 },
    '78-80': { ba: 0.280, slg: 0.480 },
    '81-83': { ba: 0.300, slg: 0.540 },
    '84-86': { ba: 0.310, slg: 0.580 },
    '87-89': { ba: 0.320, slg: 0.620 },
    '90-92': { ba: 0.310, slg: 0.600 },
    '93-95': { ba: 0.280, slg: 0.560 },
    '96-98': { ba: 0.250, slg: 0.480 },
    '99-101': { ba: 0.220, slg: 0.400 },
    '102-105': { ba: 0.190, slg: 0.340 },
  },
};

const suzuki: BatterVelocityProfile = {
  avgBA: 0.275, avgSLG: 0.420,
  bands: {
    '60-62': { ba: 0.200, slg: 0.260 },
    '63-65': { ba: 0.210, slg: 0.280 },
    '66-68': { ba: 0.230, slg: 0.310 },
    '69-71': { ba: 0.240, slg: 0.330 },
    '72-74': { ba: 0.250, slg: 0.350 },
    '75-77': { ba: 0.260, slg: 0.370 },
    '78-80': { ba: 0.270, slg: 0.400 },
    '81-83': { ba: 0.280, slg: 0.420 },
    '84-86': { ba: 0.290, slg: 0.440 },
    '87-89': { ba: 0.300, slg: 0.460 },
    '90-92': { ba: 0.310, slg: 0.480 },
    '93-95': { ba: 0.280, slg: 0.430 },
    '96-98': { ba: 0.250, slg: 0.380 },
    '99-101': { ba: 0.220, slg: 0.330 },
    '102-105': { ba: 0.190, slg: 0.280 },
  },
};

const yoshida: BatterVelocityProfile = {
  avgBA: 0.285, avgSLG: 0.450,
  bands: {
    '60-62': { ba: 0.220, slg: 0.280 },
    '63-65': { ba: 0.240, slg: 0.310 },
    '66-68': { ba: 0.260, slg: 0.350 },
    '69-71': { ba: 0.270, slg: 0.370 },
    '72-74': { ba: 0.280, slg: 0.400 },
    '75-77': { ba: 0.290, slg: 0.420 },
    '78-80': { ba: 0.300, slg: 0.460 },
    '81-83': { ba: 0.310, slg: 0.480 },
    '84-86': { ba: 0.310, slg: 0.490 },
    '87-89': { ba: 0.300, slg: 0.470 },
    '90-92': { ba: 0.290, slg: 0.460 },
    '93-95': { ba: 0.270, slg: 0.420 },
    '96-98': { ba: 0.240, slg: 0.370 },
    '99-101': { ba: 0.210, slg: 0.320 },
    '102-105': { ba: 0.180, slg: 0.270 },
  },
};

const murakami: BatterVelocityProfile = {
  avgBA: 0.260, avgSLG: 0.540,
  bands: {
    '60-62': { ba: 0.160, slg: 0.240 },
    '63-65': { ba: 0.180, slg: 0.280 },
    '66-68': { ba: 0.200, slg: 0.340 },
    '69-71': { ba: 0.210, slg: 0.360 },
    '72-74': { ba: 0.230, slg: 0.400 },
    '75-77': { ba: 0.240, slg: 0.430 },
    '78-80': { ba: 0.260, slg: 0.480 },
    '81-83': { ba: 0.270, slg: 0.520 },
    '84-86': { ba: 0.280, slg: 0.560 },
    '87-89': { ba: 0.290, slg: 0.590 },
    '90-92': { ba: 0.280, slg: 0.580 },
    '93-95': { ba: 0.260, slg: 0.530 },
    '96-98': { ba: 0.230, slg: 0.450 },
    '99-101': { ba: 0.200, slg: 0.380 },
    '102-105': { ba: 0.170, slg: 0.310 },
  },
};"""

def write_velocity_band_data(vel_profiles: dict):
    """Write src/data/velocityBandData.ts preserving Japan batter data."""
    out_path = DATA_DIR / "velocityBandData.ts"
    lines = []
    lines.append("// Velocity band batting stats (3mph bands)")
    lines.append("// Source: pybaseball Statcast 2023-2025 seasons")
    lines.append("// Generated by scripts/collect_statcast_batters.py")
    lines.append("")
    lines.append("import type { VelocityBandStats } from './types';")
    lines.append("")
    lines.append("export interface BatterVelocityProfile {")
    lines.append("  avgBA: number;")
    lines.append("  avgSLG: number;")
    lines.append("  bands: Record<string, VelocityBandStats>;")
    lines.append("}")
    lines.append("")
    lines.append(JAPAN_VELOCITY_VERBATIM)
    lines.append("")
    lines.append("// DOM batters")

    dom_order = list(BATTERS.keys())  # no lake in vel profiles

    for key in dom_order:
        if key not in vel_profiles:
            print(f"  [warn] No velocity profile for {key}, skipping")
            continue
        vp = vel_profiles[key]
        lines.append(f"const {key}: BatterVelocityProfile = {{")
        lines.append(f"  avgBA: {vp['avgBA']}, avgSLG: {vp['avgSLG']},")
        lines.append(f"  bands: {{")
        for band in VELOCITY_BANDS:
            bs = vp["bands"].get(band, {"ba": vp["avgBA"], "slg": vp["avgSLG"]})
            lines.append(f"    '{band}': {{ ba: {bs['ba']}, slg: {bs['slg']} }},")
        lines.append(f"  }},")
        lines.append(f"}};")
        lines.append("")

    lines.append("export const VELOCITY_BAND_DATA: Record<string, BatterVelocityProfile> = {")
    lines.append("  ohtani,")
    lines.append("  suzuki,")
    lines.append("  yoshida,")
    lines.append("  murakami,")
    for key in dom_order:
        if key in vel_profiles:
            lines.append(f"  {key},")
    lines.append("};")
    lines.append("")

    out_path.write_text("\n".join(lines), encoding="utf-8")
    print(f"[write] {out_path}")

def write_run_value_matrix(matrix: dict):
    """Write src/data/runValueMatrix.ts"""
    out_path = DATA_DIR / "runValueMatrix.ts"
    lines = []
    lines.append("// Run value by count x zone (league-wide from 2023-2025 Statcast)")
    lines.append("// Negative = pitcher-favorable, Positive = batter-favorable")
    lines.append("// Generated by scripts/collect_statcast_batters.py")
    lines.append("")
    lines.append("export const RUN_VALUE_MATRIX: Record<string, Record<number, number>> = {")

    for count in COUNTS:
        zone_vals = matrix.get(count, {})
        inner_parts = []
        for zone in ALL_ZONES:
            val = zone_vals.get(zone, 0.0)
            inner_parts.append(f"{zone}: {val}")
        inner_str = ", ".join(inner_parts)
        lines.append(f'  "{count}": {{ {inner_str} }},')

    lines.append("};")
    lines.append("")

    out_path.write_text("\n".join(lines), encoding="utf-8")
    print(f"[write] {out_path}")

# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
def main():
    print("=" * 60)
    print("collect_statcast_batters.py")
    print(f"Period: {DATA_START} to {DATA_END}")
    print(f"Batters: {', '.join(BATTERS.keys())}")
    print("=" * 60)

    all_dfs     = {}   # key -> DataFrame | None
    profiles    = {}   # key -> {zones, pitchTypeStats, flavorText}
    vel_profiles = {}  # key -> velocity band profile

    for key, mlbam_id in BATTERS.items():
        print(f"\n[{key}] MLBAM={mlbam_id}")
        df = fetch_batter_data(key, mlbam_id)
        all_dfs[key] = df

        if df is None or len(df) == 0:
            print(f"  [skip] No data for {key}")
            continue

        # Ensure zone column is numeric
        df = df.copy()
        df["zone"] = pd.to_numeric(df["zone"], errors="coerce")

        print(f"  Computing zone stats ...")
        zone_stats = compute_zones(df)

        print(f"  Computing pitch type stats ...")
        pitch_stats = compute_pitch_type_stats(df)

        print(f"  Computing velocity bands ...")
        vel = compute_velocity_bands(df)
        vel_profiles[key] = vel

        flavor = generate_flavor_text(zone_stats, pitch_stats)
        print(f"  Flavor: {flavor}")

        profiles[key] = {
            "zones":         zone_stats,
            "pitchTypeStats": pitch_stats,
            "flavorText":    flavor,
        }

    print("\n[run value matrix] Computing league-wide matrix ...")
    run_matrix = compute_run_value_matrix(all_dfs)

    print("\n[output] Writing TypeScript files ...")
    write_dom_batter_profiles(profiles)
    write_velocity_band_data(vel_profiles)
    write_run_value_matrix(run_matrix)

    print("\nDone.")

if __name__ == "__main__":
    main()
