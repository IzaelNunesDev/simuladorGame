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
} from "./math";

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
): PlayerState {
  player.speed = clamp(
    player.speed + (input.throttle - input.brake) * player.acceleration * deltaTime,
    player.minSpeed,
    player.maxSpeed,
  );

  vec3Copy(player.previousPosition, player.position);
  vec3Normalize(player.gravityUp, player.position);

  quatFromAxisAngle(player._rotationQuat, player.gravityUp, input.yaw * player.yawRate * deltaTime);
  vec3RotateByQuat(player.forward, player.forward, player._rotationQuat);

  vec3ProjectOnPlane(player.forward, player.forward, player.gravityUp);
  if (vec3LengthSq(player.forward) < 1e-6) {
    vec3Cross(player.forward, player.right, player.gravityUp);
  }
  vec3Normalize(player.forward, player.forward);

  vec3Cross(player.right, player.forward, player.gravityUp);
  vec3Normalize(player.right, player.right);

  quatFromAxisAngle(player._rotationQuat, player.right, input.pitch * player.pitchRate * deltaTime);
  vec3RotateByQuat(player.forward, player.forward, player._rotationQuat);
  vec3ProjectOnPlane(player.forward, player.forward, player.gravityUp);
  vec3Normalize(player.forward, player.forward);

  vec3Cross(player.right, player.forward, player.gravityUp);
  vec3Normalize(player.right, player.right);
  vec3Copy(player.up, player.gravityUp);

  player.rollBank += ((input.roll * 0.75) - player.rollBank) * clamp(player.bankResponse * deltaTime, 0, 1);

  vec3Scale(player._scratchA, player.forward, player.speed * deltaTime);
  vec3AddScaled(player.position, player.position, player._scratchA, 1);

  // Fake gravity: keep the aircraft constrained to the orbital shell.
  vec3Normalize(player.gravityUp, player.position);
  vec3Scale(player.position, player.gravityUp, player.worldRadius + player.flyHeight);

  // Realign orientation to the new gravity vector so the craft never flips under the planet.
  vec3ProjectOnPlane(player.forward, player.forward, player.gravityUp);
  if (vec3LengthSq(player.forward) < 1e-6) {
    vec3Cross(player.forward, player.up, player.right);
  }
  vec3Normalize(player.forward, player.forward);
  vec3Cross(player.right, player.forward, player.gravityUp);
  vec3Normalize(player.right, player.right);
  vec3Copy(player.up, player.gravityUp);

  vec3Copy(player._scratchB, player.position);
  player._scratchB[0] -= player.previousPosition[0];
  player._scratchB[1] -= player.previousPosition[1];
  player._scratchB[2] -= player.previousPosition[2];
  vec3Scale(player.velocity, player._scratchB, deltaTime > 0 ? 1 / deltaTime : 0);
  return player;
}
