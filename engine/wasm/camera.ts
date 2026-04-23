import {
  DEG_TO_RAD,
  Mat4,
  Vec3,
  mat4,
  mat4LookAt,
  mat4Multiply,
  mat4Perspective,
  vec3,
  vec3AddScaled,
  vec3Cross,
  vec3Copy,
  vec3LengthSq,
  vec3Normalize,
  vec3ProjectOnPlane,
  vec3Sub,
} from "./math";

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
    farPlane: 20000,
    _scratchForward: vec3(),
  };
}

export function updateOrbitalCamera(
  camera: CameraState,
  playerPosition: Vec3,
  playerForward: Vec3,
  worldCenter: Vec3,
  aspect: number,
): CameraState {
  vec3Sub(camera.up, playerPosition, worldCenter);
  vec3Normalize(camera.up, camera.up);

  vec3ProjectOnPlane(camera._scratchForward, playerForward, camera.up);
  if (vec3LengthSq(camera._scratchForward) < 1e-6) {
    vec3Copy(camera._scratchForward, camera.forward);
    vec3ProjectOnPlane(camera._scratchForward, camera._scratchForward, camera.up);
  }
  vec3Normalize(camera.forward, camera._scratchForward);
  vec3Cross(camera.right, camera.forward, camera.up);
  vec3Normalize(camera.right, camera.right);

  vec3AddScaled(camera.target, playerPosition, camera.forward, camera.lookAhead);
  vec3AddScaled(camera.position, playerPosition, camera.forward, -camera.distance);
  vec3AddScaled(camera.position, camera.position, camera.up, camera.height);

  mat4LookAt(camera.viewMatrix, camera.position, camera.target, camera.up);
  mat4Perspective(camera.projectionMatrix, camera.fovY, aspect, camera.nearPlane, camera.farPlane);
  mat4Multiply(camera.viewProjectionMatrix, camera.projectionMatrix, camera.viewMatrix);
  return camera;
}
