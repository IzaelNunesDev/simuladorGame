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
import type { TerrainQuery } from "./terrain_query";

export interface PlayerInputState {
  pitch: number;
  yaw: number;
  roll: number;
  throttle: number;
  brake: number;
  turbo: number;
}

export interface PlayerState {
  worldCenter: Vec3;
  position: Vec3;
  surfaceDirection: Vec3;
  forward: Vec3;
  right: Vec3;
  up: Vec3;
  velocity: Vec3;
  gravityUp: Vec3;
  previousPosition: Vec3;
  worldRadius: number;
  altitude: number;
  pitchAngle: number;
  speed: number;
  minSpeed: number;
  maxSpeed: number;
  acceleration: number;
  turboBoost: number;
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
    turbo: 0,
  };
}

export function createPlayerState(worldRadius: number, initialAltitude: number): PlayerState {
  const orbitRadius = worldRadius + initialAltitude;
  const position = vec3(orbitRadius, 0, 0);
  const gravityUp = vec3(1, 0, 0);
  const surfaceDirection = vec3Copy(vec3(), gravityUp);
  const forward = vec3(0, 0, -1);
  const right = vec3(0, -1, 0);

  return {
    worldCenter: vec3(),
    position,
    surfaceDirection,
    forward,
    right,
    up: vec3Copy(vec3(), gravityUp),
    velocity: vec3(),
    gravityUp,
    previousPosition: vec3Copy(vec3(), position),
    worldRadius,
    altitude: initialAltitude,
    pitchAngle: 0,
    speed: 42,
    minSpeed: 12,
    maxSpeed: 160,
    acceleration: 28,
    turboBoost: 2.2,
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
  terrainQuery: TerrainQuery,
  seaLevel: number,
): PlayerState {
  const response = clamp(player.bankResponse * deltaTime, 0, 1);
  
  // Aceleração
  const targetAcceleration = (input.throttle - input.brake + input.turbo * player.turboBoost) * player.acceleration;
  const targetMaxSpeed = player.maxSpeed * (1.0 + input.turbo * 0.5);
  
  player.speed = clamp(
    player.speed + targetAcceleration * deltaTime,
    player.minSpeed,
    targetMaxSpeed,
  );

  vec3Copy(player.previousPosition, player.position);
  vec3Normalize(player.gravityUp, player.position);
  vec3Copy(player.surfaceDirection, player.gravityUp);

  // Bank/Roll
  player.rollBank += ((input.roll * 0.75) - player.rollBank) * response;

  // Pitch explícito
  player.pitchAngle += input.pitch * player.pitchRate * deltaTime;
  const maxPitch = Math.PI / 2 * 0.85;
  player.pitchAngle = clamp(player.pitchAngle, -maxPitch, maxPitch);

  // Componentes de velocidade baseados no pitch
  const forwardSpeed = Math.cos(player.pitchAngle) * player.speed;
  const verticalVelocity = Math.sin(player.pitchAngle) * player.speed;

  // Yaw coordenado com bank
  const coordinatedYaw = (input.yaw + player.rollBank * 0.8) * player.yawRate * deltaTime;

  // Garantir que forward atual está no plano tangente
  vec3ProjectOnPlane(player.forward, player.forward, player.gravityUp);
  if (vec3LengthSq(player.forward) < 1e-6) {
    // Fallback caso forward colapse
    vec3Cross(player.forward, player.right, player.gravityUp);
  }
  vec3Normalize(player.forward, player.forward);

  // Aplicar Yaw tangencial
  quatFromAxisAngle(player._rotationQuat, player.gravityUp, coordinatedYaw);
  vec3RotateByQuat(player.forward, player.forward, player._rotationQuat);

  // Mover tangencialmente
  vec3Scale(player._scratchA, player.forward, forwardSpeed * deltaTime);
  vec3AddScaled(player.position, player.position, player._scratchA, 1.0);
  vec3Normalize(player.gravityUp, player.position); // Re-ancorar na esfera

  // Atualizar altitude
  player.altitude += verticalVelocity * deltaTime;

  // Colisão de terreno
  const landHeight = terrainQuery.getHeight(player.gravityUp);
  const minAltitude = Math.max(landHeight, seaLevel) + 2.0;

  if (player.altitude < minAltitude) {
    player.altitude = minAltitude;
    // Bateu no chão: força nariz para cima gradualmente e perde vel
    player.pitchAngle = Math.max(player.pitchAngle, 0); 
    player.speed = clamp(player.speed * 0.98, player.minSpeed, player.maxSpeed);
  }

  // Reconstruir posição final absoluta
  vec3Scale(player.position, player.gravityUp, player.worldRadius + player.altitude);

  // Reconstruir matriz de rotação para render/câmera
  vec3ProjectOnPlane(player.forward, player.forward, player.gravityUp);
  vec3Normalize(player.forward, player.forward);

  vec3Cross(player.right, player.gravityUp, player.forward);
  vec3Normalize(player.right, player.right);

  vec3Copy(player.up, player.gravityUp);

  // Aplicar Pitch nos eixos locais
  quatFromAxisAngle(player._rotationQuat, player.right, player.pitchAngle);
  vec3RotateByQuat(player.forward, player.forward, player._rotationQuat);
  vec3RotateByQuat(player.up, player.up, player._rotationQuat);

  // Aplicar Roll
  quatFromAxisAngle(player._rotationQuat, player.forward, player.rollBank);
  vec3RotateByQuat(player.right, player.right, player._rotationQuat);
  vec3RotateByQuat(player.up, player.up, player._rotationQuat);

  vec3Normalize(player.forward, player.forward);
  vec3Normalize(player.right, player.right);
  vec3Normalize(player.up, player.up);

  // Velocity calculada para shaders
  vec3Copy(player._scratchB, player.position);
  player._scratchB[0] -= player.previousPosition[0];
  player._scratchB[1] -= player.previousPosition[1];
  player._scratchB[2] -= player.previousPosition[2];
  vec3Scale(player.velocity, player._scratchB, deltaTime > 0 ? 1 / deltaTime : 0);

  return player;
}
