import { Canvas } from '@react-three/fiber';
import type { PitchTrajectory } from '../data/types';
import BatterBox from './BatterBox';
import PitchBall from './PitchBall';

interface PitchSceneProps {
  pitch: PitchTrajectory;
  isAnimating: boolean;
  onAnimationComplete: () => void;
}

export default function PitchScene({ pitch, isAnimating, onAnimationComplete }: PitchSceneProps) {
  return (
    <div className="w-full h-screen bg-slate-950">
      <Canvas
        camera={{
          position: [0, 12, -65],
          fov: 30,
          near: 0.1,
          far: 500,
        }}
        onCreated={({ camera }) => {
          camera.lookAt(0, 3, 0);
        }}
      >
        <BatterBox
          szTop={pitch.szTop}
          szBot={pitch.szBot}
          batSide={pitch.batSide}
        />
        <PitchBall
          pitch={pitch}
          isAnimating={isAnimating}
          onAnimationComplete={onAnimationComplete}
        />
      </Canvas>
    </div>
  );
}
