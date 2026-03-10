import { useState } from 'react';
import type { PitchOption, Zone } from '../data/types';
import { getPitchColor } from '../utils/pitchColors';
import ZoneHeatmap from './ZoneHeatmap';

interface PitchSelectorProps {
  pitches: PitchOption[];
  batSide: 'L' | 'R';
  onSelect: (pitchCode: string, zone: Zone) => void;
  balls: number;
  strikes: number;
}

export default function PitchSelector({
  pitches,
  batSide,
  onSelect,
  balls,
  strikes,
}: PitchSelectorProps) {
  const [selectedPitch, setSelectedPitch] = useState<PitchOption | null>(null);

  if (!selectedPitch) {
    // Step 1: Pick pitch type
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 flex flex-col items-center justify-center px-4 pt-16 pb-8">
        <div className="max-w-md w-full">
          {/* Count display */}
          <div className="text-center mb-6">
            <p className="text-slate-400 text-sm mb-1">카운트</p>
            <p className="text-white text-3xl font-black font-mono">
              <span className="text-green-400">{balls}</span>
              <span className="text-slate-500"> - </span>
              <span className="text-yellow-400">{strikes}</span>
            </p>
          </div>

          <h3 className="text-white text-lg font-bold text-center mb-4">
            구종을 선택하세요
          </h3>

          <div className="grid grid-cols-2 gap-3">
            {pitches.map((pitch) => {
              const color = getPitchColor(pitch.code);
              return (
                <button
                  key={pitch.code}
                  onClick={() => setSelectedPitch(pitch)}
                  className="bg-slate-800 hover:bg-slate-700 active:bg-slate-600 border-2 rounded-xl px-4 py-4 text-left transition-all duration-100 hover:scale-[1.02] active:scale-[0.98]"
                  style={{ borderColor: color }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-white font-bold text-base">
                      {pitch.nameKo}
                    </span>
                  </div>
                  <p className="text-slate-400 text-xs">
                    {pitch.avgSpeed} km/h
                  </p>
                  <p className="text-slate-500 text-[10px] mt-0.5 line-clamp-1">
                    {pitch.movement}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Step 2: Pick zone
  const color = getPitchColor(selectedPitch.code);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 flex flex-col items-center justify-center px-4 pt-16 pb-8">
      <div className="max-w-md w-full flex flex-col items-center">
        {/* Selected pitch info */}
        <div className="flex items-center gap-2 mb-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: color }}
          />
          <span className="text-white font-bold">{selectedPitch.nameKo}</span>
          <span className="text-slate-400 text-sm">{selectedPitch.avgSpeed} km/h</span>
        </div>

        {/* Change button */}
        <button
          onClick={() => setSelectedPitch(null)}
          className="text-slate-400 hover:text-white text-xs mb-4 underline underline-offset-2 transition-colors"
        >
          구종 변경
        </button>

        {/* Count */}
        <div className="text-center mb-4">
          <p className="text-white text-2xl font-black font-mono">
            <span className="text-green-400">{balls}</span>
            <span className="text-slate-500"> - </span>
            <span className="text-yellow-400">{strikes}</span>
          </p>
        </div>

        <h3 className="text-white text-lg font-bold text-center mb-4">
          코스를 선택하세요
        </h3>

        {/* Zone grid (pitcher's perspective, blind) */}
        <ZoneHeatmap
          interactive
          size="lg"
          batSide={batSide}
          onZoneSelect={(zone) => onSelect(selectedPitch.code, zone)}
        />
      </div>
    </div>
  );
}
