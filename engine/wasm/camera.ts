import {
  DEG_TO_RAD,
  Mat4,
  Quat,
  Vec3,
  mat4,
  mat4LookAt,
  mat4Multiply,
  mat4Perspective,
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
  vec3Sub,
} from "./math";
import type { PlayerState } from "./player_controller";

export interface CameraState {
  position: Vec3;
  target: Vec3;
  up: Vec3;
  right: Vec3;
  forward: Vec3;
  viewMatrix: Mat4;
  projectionMatrix: Mat4;
  viewProjectionMatrix: Mat4;
  distance: number;
  height: number;
  lookAhead: number;
  fovY: number;
  nearPlane: number;
  farPlane: number;
  _scratchForward: Vec3;
  _scratchUp: Vec3;
  _rotationQuat: Quat;
  _scratchVec: Vec3;
}

export function createCameraState(): CameraState {
  return {
    position: vec3(0, 0, 10),
    target: vec3(),
    up: vec3(0, 1, 0),
    right: vec3(1, 0, 0),
    forward: vec3(0, 0, -1),
    viewMatrix: mat4(),
    projectionMatrix: mat4(),
    viewProjectionMatrix: mat4(),
    distance: 12,
    height: 3,
    lookAhead: 20,
    fovY: 75 * DEG_TO_RAD,
    nearPlane: 0.1,
    farPlane: 10000,
    _scratchForward: vec3(),
    _scratchUp: vec3(),
    _rotationQuat: quat(),
    _scratchVec: vec3(),
  };
}

export function updateOrbitalCamera(
  camera: CameraState,
  player: PlayerState,
  aspect: number,
  deltaTime: number,
): CameraState {
  const damping = 1.0 - Math.exp(-6.0 * deltaTime);

  // Leve roll follow
  vec3Copy(camera._scratchUp, player.gravityUp);
  quatFromAxisAngle(camera._rotationQuat, player.forward, player.rollBank * 0.35);
  vec3RotateByQuat(camera._scratchUp, camera._scratchUp, camera._rotationQuat);

  // Damping no UP
  vec3Sub(camera._scratchVec, camera._scratchUp, camera.up);
  vec3AddScaled(camera.up, camera.up, camera._scratchVec, damping);
  vec3Normalize(camera.up, camera.up);

  // Target Forward
  vec3ProjectOnPlane(camera._scratchForward, player.forward, camera.up);
  if (vec3LengthSq(camera._scratchForward) < 1e-6) {
    vec3Copy(camera._scratchForward, camera.forward);
    vec3ProjectOnPlane(camera._scratchForward, camera._scratchForward, camera.up);
  }
  vec3Normalize(camera._scratchForward, camera._scratchForward);
  
  // Damping no Forward
  vec3Sub(camera._scratchVec, camera._scratchForward, camera.forward);
  vec3AddScaled(camera.forward, camera.forward, camera._scratchVec, damping);
  vec3Normalize(camera.forward, camera.forward);

  vec3Cross(camera.right, camera.forward, camera.up);
  vec3Normalize(camera.right, camera.right);

  // Target look e position ideais
  const idealTarget = vec3AddScaled(vec3(), player.position, camera.forward, camera.lookAhead);
  const idealPosition = vec3AddScaled(vec3(), player.position, camera.forward, -camera.distance);
  vec3AddScaled(idealPosition, idealPosition, camera.up, camera.height);

  // Damping na posicao e target (um pouco mais responsivo)
  const posDamping = 1.0 - Math.exp(-8.0 * deltaTime);
  vec3Sub(camera._scratchVec, idealPosition, camera.position);
  vec3AddScaled(camera.position, camera.position, camera._scratchVec, posDamping);
  
  vec3Sub(camera._scratchVec, idealTarget, camera.target);
  vec3AddScaled(camera.target, camera.target, camera._scratchVec, posDamping);

  // FOV dinamico
  const speedRatio = (player.speed - player.minSpeed) / (player.maxSpeed - player.minSpeed);
  const targetFov = (75 + speedRatio * 35) * DEG_TO_RAD;
  camera.fovY += (targetFov - camera.fovY) * damping;

  mat4LookAt(camera.viewMatrix, camera.position, camera.target, camera.up);
  mat4Perspective(camera.projectionMatrix, camera.fovY, aspect, camera.nearPlane, camera.farPlane);
  mat4Multiply(camera.viewProjectionMatrix, camera.projectionMatrix, camera.viewMatrix);
  return camera;
}
