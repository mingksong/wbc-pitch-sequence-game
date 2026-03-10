import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { PitchTrajectory } from '../data/types';
import { buildTrajectoryCurve } from '../utils/trajectory';
import { getPitchColor } from '../utils/pitchColors';

interface PitchBallProps {
  pitch: PitchTrajectory;
  isAnimating: boolean;
  onAnimationComplete: () => void;
  animationSpeed?: number;
}

export default function PitchBall({
  pitch,
  isAnimating,
  onAnimationComplete,
  animationSpeed = 1,
}: PitchBallProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.MeshStandardMaterial>(null);
  const progressRef = useRef(0);
  const completedRef = useRef(false);
  const prevPosRef = useRef<THREE.Vector3>(new THREE.Vector3());
  const flashRef = useRef(0);

  const curve = useMemo(() => buildTrajectoryCurve(pitch), [pitch]);
  const color = useMemo(() => getPitchColor(pitch.pitchCode), [pitch.pitchCode]);

  useMemo(() => {
    progressRef.current = 0;
    completedRef.current = false;
    flashRef.current = 0;
    if (meshRef.current) {
      meshRef.current.scale.set(0.6, 0.6, 0.6);
      meshRef.current.rotation.set(0, 0, 0);
    }
    if (matRef.current) {
      matRef.current.emissiveIntensity = 0.03;
    }
  }, [pitch]);

  useFrame((_, delta) => {
    if (!meshRef.current) return;

    if (flashRef.current > 0) {
      flashRef.current -= delta * 8;
      if (flashRef.current < 0) flashRef.current = 0;
      if (matRef.current) {
        matRef.current.emissiveIntensity = 0.03 + flashRef.current * 0.8;
      }
    }

    if (!isAnimating || completedRef.current) return;

    const duration = pitch.plateTime * (1 / animationSpeed);
    progressRef.current += delta / duration;

    let perceivedProgress = progressRef.current;
    if (perceivedProgress > 0.8) {
      const tail = (perceivedProgress - 0.8) / 0.2;
      const accelerated = tail * tail;
      perceivedProgress = 0.8 + accelerated * 0.2;
    }

    if (progressRef.current >= 1) {
      progressRef.current = 1;
      completedRef.current = true;
      const endPos = curve.getPoint(1);
      meshRef.current.position.copy(endPos);
      meshRef.current.scale.set(1.8, 1.8, 1.8);
      meshRef.current.rotation.set(0, 0, 0);
      flashRef.current = 1.0;
      onAnimationComplete();
      return;
    }

    const pos = curve.getPoint(perceivedProgress);
    meshRef.current.position.copy(pos);

    const zNorm = THREE.MathUtils.clamp((pos.z + 55) / 55, 0, 1);
    const looming = Math.pow(zNorm, 2.5);
    const baseScale = 0.5 + looming * 1.5;

    const currentPos = pos;
    const velocity = currentPos.clone().sub(prevPosRef.current);
    const speed = velocity.length() / Math.max(delta, 0.001);
    prevPosRef.current.copy(currentPos);

    const stretchFactor = THREE.MathUtils.clamp(speed / 200, 0, 0.6);
    meshRef.current.scale.set(
      baseScale * (1 - stretchFactor * 0.3),
      baseScale * (1 - stretchFactor * 0.3),
      baseScale * (1 + stretchFactor),
    );
  });

  const startPos = useMemo(() => curve.getPoint(0), [curve]);

  return (
    <group>
      <mesh ref={meshRef} position={isAnimating ? undefined : startPos} scale={0.6}>
        <sphereGeometry args={[0.121, 16, 16]} />
        <meshStandardMaterial
          ref={matRef}
          color="#ffffff"
          roughness={0.4}
          metalness={0.1}
          emissive={color}
          emissiveIntensity={0.03}
        />
      </mesh>
    </group>
  );
}
