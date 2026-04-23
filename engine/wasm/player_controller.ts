import {
  Vec3,
  clamp,
  quat,
  quatFromAxisAngle,
  vec3,
  vec3AddScaled,
  vec3Cross,
  vec3Copy,
  vec3LengthSq,
  vec3Normalize,
  vec3ProjectOnPlane,
  vec3RotateByQuat,
  vec3Scale,
  vec3Length,
  vec3Dot,
} from "./math";
import type { TerrainNoiseSettings } from "./gpu_bridge";
import { getTerrainHeight } from "./noise";

export interface PlayerInputState {
  pitch: number;
  yaw: number;
  roll: number;
  throttle: number;
  brake: number;
}

export interface PlayerState {
  worldCenter: Vec3;
  position: Vec3;
  forward: Vec3;
  right: Vec3;
  up: Vec3;
  velocity: Vec3;
  gravityUp: Vec3;
  previousPosition: Vec3;
  worldRadius: number;
  flyHeight: number;
  speed: number;
  minSpeed: number;
  maxSpeed: number;
  acceleration: number;
  yawRate: number;
  pitchRate: number;
  rollBank: number;
  bankResponse: number;
  _scratchA: Vec3;
  _scratchB: Vec3;
  _rotationQuat: Float32Array;
}

export function createPlayerInputState(): PlayerInputState {
  return {
    pitch: 0,
    yaw: 0,
    roll: 0,
    throttle: 0,
    brake: 0,
  };
}

export function createPlayerState(worldRadius: number, flyHeight: number): PlayerState {
  const orbitRadius = worldRadius + flyHeight;
  const position = vec3(orbitRadius, 0, 0);
  const gravityUp = vec3(1, 0, 0);
  const forward = vec3(0, 0, -1);
  const right = vec3(0, -1, 0);

  return {
    worldCenter: vec3(),
    position,
    forward,
    right,
    up: vec3Copy(vec3(), gravityUp),
    velocity: vec3(),
    gravityUp,
    previousPosition: vec3Copy(vec3(), position),
    worldRadius,
    flyHeight,
    speed: 42,
    minSpeed: 12,
    maxSpeed: 160,
    acceleration: 28,
    yawRate: 0.9,
    pitchRate: 0.7,
    rollBank: 0,
    bankResponse: 2.4,
    _scratchA: vec3(),
    _scratchB: vec3(),
    _rotationQuat: quat(),
  };
}

export function updatePlayerController(
  player: PlayerState,
  input: PlayerInputState,
  deltaTime: number,
  terrainNoise: TerrainNoiseSettings,
  seaLevel: number,
): PlayerState {
  const response = clamp(player.bankResponse * deltaTime, 0, 1);
  player.speed = clamp(
    player.speed + (input.throttle - input.brake) * player.acceleration * deltaTime,
    player.minSpeed,
    player.maxSpeed,
  );

  vec3Copy(player.previousPosition, player.position);
  vec3Normalize(player.gravityUp, player.position);
  player.rollBank += ((input.roll * 0.75) - player.rollBank) * response;

  const coordinatedYaw = (input.yaw + player.rollBank * 0.8) * player.yawRate * deltaTime;
  quatFromAxisAngle(player._rotationQuat, player.gravityUp, coordinatedYaw);
  vec3RotateByQuat(player.forward, player.forward, player._rotationQuat);

  vec3Cross(player.right, player.forward, player.gravityUp);
  if (vec3LengthSq(player.right) < 1e-6) {
    vec3Cross(player.right, player.forward, player.up);
  }
  vec3Normalize(player.right, player.right);
  vec3Cross(player.up, player.gravityUp, player.right);
  vec3Normalize(player.up, player.up);

  quatFromAxisAngle(player._rotationQuat, player.right, input.pitch * player.pitchRate * deltaTime);
  vec3RotateByQuat(player.forward, player.forward, player._rotationQuat);
  vec3Normalize(player.forward, player.forward);

  let climbComponent = vec3Dot(player.forward, player.gravityUp);
  if (Math.abs(climbComponent) > 0.98) {
    vec3ProjectOnPlane(player.forward, player.forward, player.gravityUp);
    vec3Normalize(player.forward, player.forward);
    climbComponent = vec3Dot(player.forward, player.gravityUp);
  }

  vec3Cross(player.right, player.forward, player.gravityUp);
  if (vec3LengthSq(player.right) < 1e-6) {
    vec3Cross(player.right, player.forward, player.up);
  }
  vec3Normalize(player.right, player.right);
  vec3Cross(player.up, player.gravityUp, player.right);
  vec3Normalize(player.up, player.up);

  quatFromAxisAngle(player._rotationQuat, player.forward, player.rollBank);
  vec3RotateByQuat(player.right, player.right, player._rotationQuat);
  vec3RotateByQuat(player.up, player.up, player._rotationQuat);
  vec3Normalize(player.right, player.right);
  vec3Normalize(player.up, player.up);

  vec3Scale(player._scratchA, player.forward, player.speed * deltaTime);
  vec3AddScaled(player.position, player.position, player._scratchA, 1);

  vec3Normalize(player.gravityUp, player.position);
  const landHeight = getTerrainHeight(player.gravityUp, terrainNoise);
  const minRadius = player.worldRadius + Math.max(landHeight, seaLevel) + 2.0;
  const desiredRadius = Math.max(player.worldRadius + player.flyHeight, minRadius);
  let currentRadius = vec3Length(player.position);

  if (currentRadius < minRadius) {
    vec3Scale(player.position, player.gravityUp, minRadius);
    player.speed = clamp(player.speed * 0.8, player.minSpeed, player.maxSpeed);
    currentRadius = minRadius;
  } else {
    const altitudeError = desiredRadius - currentRadius;
    vec3AddScaled(player.position, player.position, player.gravityUp, altitudeError * response * 0.22);
    currentRadius = vec3Length(player.position);
  }

  vec3Normalize(player.gravityUp, player.position);
  vec3Cross(player.right, player.forward, player.gravityUp);
  if (vec3LengthSq(player.right) < 1e-6) {
    vec3Cross(player.right, player.forward, player.up);
  }
  vec3Normalize(player.right, player.right);
  vec3Cross(player.up, player.gravityUp, player.right);
  vec3Normalize(player.up, player.up);
  quatFromAxisAngle(player._rotationQuat, player.forward, player.rollBank);
  vec3RotateByQuat(player.right, player.right, player._rotationQuat);
  vec3RotateByQuat(player.up, player.up, player._rotationQuat);
  vec3Normalize(player.right, player.right);
  vec3Normalize(player.up, player.up);

  vec3Copy(player._scratchB, player.position);
  player._scratchB[0] -= player.previousPosition[0];
  player._scratchB[1] -= player.previousPosition[1];
  player._scratchB[2] -= player.previousPosition[2];
  vec3Scale(player.velocity, player._scratchB, deltaTime > 0 ? 1 / deltaTime : 0);
  return player;
}
