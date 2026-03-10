import * as THREE from 'three';
import type { PitchTrajectory } from '../data/types';

const NUM_POINTS = 50;

export function buildTrajectoryPoints(pitch: PitchTrajectory): THREE.Vector3[] {
  const { vX0, vY0, vZ0, aX, aY, aZ, x0, y0, z0, plateTime } = pitch;
  const points: THREE.Vector3[] = [];

  for (let i = 0; i <= NUM_POINTS; i++) {
    const t = (i / NUM_POINTS) * plateTime;
    const sx = x0 + vX0 * t + 0.5 * aX * t * t;
    const sy = y0 + vY0 * t + 0.5 * aY * t * t;
    const sz = z0 + vZ0 * t + 0.5 * aZ * t * t;
    points.push(new THREE.Vector3(sx, sz, -sy));
  }

  return points;
}

export function buildTrajectoryCurve(pitch: PitchTrajectory): THREE.CatmullRomCurve3 {
  const points = buildTrajectoryPoints(pitch);
  return new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.5);
}

export function getPlatePosition(pitch: PitchTrajectory): THREE.Vector3 {
  return new THREE.Vector3(pitch.pX, pitch.pZ, 0);
}

export const MOUND_DISTANCE = 60.5;
export const PLATE_Z = 0;
export const MOUND_Z = -MOUND_DISTANCE;
export const SCALE = 1;
