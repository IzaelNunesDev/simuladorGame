import { CameraState, createCameraState, updateOrbitalCamera } from "./camera";
import { EngineConfig, GpuBridge, ShaderLibrary } from "./gpu_bridge";
import { MeshData } from "./gltf_loader";
import { Vec3, vec3, vec3Normalize, vec3Lerp, lerp } from "./math";
import { NetworkPlayerSnapshot } from "../shared/multiplayer";
import {
  PlayerInputState,
  PlayerState,
  createPlayerInputState,
  createPlayerState,
  updatePlayerController,
} from "./player_controller";
import { TerrainQuery } from "./terrain_query";
import { AirplaneRenderState } from "./gpu_bridge";
import { AirplanePhysicsConfig } from "../shared/airplane_presets";

interface RemotePlayerRenderState extends AirplaneRenderState {
  id: string;
  updatedAt: number;
  targetPosition: Vec3;
  targetForward: Vec3;
  targetRight: Vec3;
  targetUp: Vec3;
  targetSpeed: number;
  targetPitch: number;
  targetRoll: number;
  targetYaw: number;
  targetShootingTimer: number;
}

export interface Projectile {
  position: Vec3;
  velocity: Vec3;
  life: number;
}

export interface MiniEngineBootstrap {
  canvas: HTMLCanvasElement;
  context: GPUCanvasContext;
  device: GPUDevice;
  presentationFormat: GPUTextureFormat;
  shaders: ShaderLibrary;
  baseMapBitmap: ImageBitmap;
  airplaneMesh: MeshData;
  airplanePhysics?: AirplanePhysicsConfig;
  config?: Partial<EngineConfig>;
}

const DEFAULT_CONFIG: EngineConfig = {
  terrainResolution: 256,
  worldRadius: 3000,
  flyHeight: 120,
  seaLevel: 18,
  atmosphereHeight: 260,
  particleCount: 4096,
  cloudCollisionRadius: 150.0,
  cloudRelaxToHome: 0.05,
  cloudBillboardSize: 15.0,
  cloudStrength: 0.82,
  terrainNoise: {
    octaves: 5,
    persistence: 0.52,
    lacunarity: 2.15,
    baseFrequency: 1.75,
    baseAmplitude: 150,
    seed: 11.5,
  },
};

export class MiniEngine {
  readonly canvas: HTMLCanvasElement;
  readonly context: GPUCanvasContext;
  readonly device: GPUDevice;
  readonly config: EngineConfig;
  readonly bridge: GpuBridge;
  readonly camera: CameraState;
  readonly player: PlayerState;
  readonly input: PlayerInputState;
  readonly sunDirection: Vec3;
  readonly terrainQuery: TerrainQuery;
  private localNetworkId: string | null = null;
  private readonly remotePlayers = new Map<string, RemotePlayerRenderState>();
  private readonly projectiles: Projectile[] = [];

  private isRunning = false;
  private lastTimeMs = 0;
  private readonly animationFrame = (timeMs: number) => this.frame(timeMs);

  private constructor(
    canvas: HTMLCanvasElement,
    context: GPUCanvasContext,
    device: GPUDevice,
    config: EngineConfig,
    bridge: GpuBridge,
    terrainQuery: TerrainQuery,
  ) {
    this.canvas = canvas;
    this.context = context;
    this.device = device;
    this.config = config;
    this.bridge = bridge;
    this.camera = createCameraState();
    this.player = createPlayerState(config.worldRadius, config.flyHeight, bootstrap.airplanePhysics);
    this.input = createPlayerInputState();
    this.sunDirection = vec3(-0.55, 0.45, -0.70);
    vec3Normalize(this.sunDirection, this.sunDirection);
    this.terrainQuery = terrainQuery;
  }

  static async create(bootstrap: MiniEngineBootstrap): Promise<MiniEngine> {
    const config: EngineConfig = {
      ...DEFAULT_CONFIG,
      ...bootstrap.config,
      terrainNoise: {
        ...DEFAULT_CONFIG.terrainNoise,
        ...(bootstrap.config?.terrainNoise ?? {}),
      },
    };

    const bridge = await GpuBridge.create(
      bootstrap.device,
      bootstrap.presentationFormat,
      config,
      bootstrap.shaders,
      bootstrap.canvas.width,
      bootstrap.canvas.height,
      bootstrap.baseMapBitmap,
      bootstrap.airplaneMesh,
    );

    const terrainQuery = new TerrainQuery(config.terrainNoise, bootstrap.baseMapBitmap);

    const engine = new MiniEngine(
      bootstrap.canvas,
      bootstrap.context,
      bootstrap.device,
      config,
      bridge,
      terrainQuery,
    );
    engine.resize();
    return engine;
  }

  start(): void {
    if (this.isRunning) {
      return;
    }
    this.isRunning = true;
    this.lastTimeMs = performance.now();
    requestAnimationFrame(this.animationFrame);
  }

  stop(): void {
    this.isRunning = false;
  }

  resize(): void {
    const width = Math.max(1, Math.floor(this.canvas.clientWidth * window.devicePixelRatio));
    const height = Math.max(1, Math.floor(this.canvas.clientHeight * window.devicePixelRatio));
    if (this.canvas.width !== width) {
      this.canvas.width = width;
    }
    if (this.canvas.height !== height) {
      this.canvas.height = height;
    }
    this.bridge.resize(width, height);
  }

  setKeyState(code: string, pressed: boolean): void {
    const value = pressed ? 1 : 0;
    switch (code) {
      case "KeyW":
      case "ArrowUp":
      case "KeyI":
        this.input.pitch = -value;
        break;
      case "KeyS":
      case "ArrowDown":
      case "KeyK":
        this.input.pitch = value;
        break;
      case "KeyA":
      case "ArrowLeft":
        this.input.yaw = value;
        break;
      case "KeyJ":
        this.input.shoot = value;
        break;
      case "KeyD":
      case "ArrowRight":
      case "KeyL":
        this.input.yaw = -value;
        break;
      case "KeyQ":
        this.input.roll = -value;
        break;
      case "KeyE":
        this.input.roll = value;
        break;
      case "ShiftLeft":
        this.input.throttle = value;
        break;
      case "ControlLeft":
        this.input.brake = value;
        break;
      case "Space":
        this.input.turbo = value;
        break;
    }
  }

  setLocalNetworkId(id: string): void {
    this.localNetworkId = id;
  }

  getLocalPlayerSnapshot(): NetworkPlayerSnapshot {
    return {
      id: this.localNetworkId ?? "local",
      position: [this.player.position[0], this.player.position[1], this.player.position[2]],
      forward: [this.player.forward[0], this.player.forward[1], this.player.forward[2]],
      right: [this.player.right[0], this.player.right[1], this.player.right[2]],
      up: [this.player.up[0], this.player.up[1], this.player.up[2]],
      speed: this.player.speed,
      smoothedPitch: this.player.smoothedPitch,
      smoothedRoll: this.player.smoothedRoll,
      smoothedYaw: this.player.smoothedYaw,
      updatedAt: Date.now(),
    };
  }

  syncRemotePlayers(players: readonly NetworkPlayerSnapshot[]): void {
    const seen = new Set<string>();

    for (const snapshot of players) {
      if (snapshot.id === this.localNetworkId) {
        continue;
      }

      seen.add(snapshot.id);
      let remotePlayer = this.remotePlayers.get(snapshot.id);
      if (!remotePlayer) {
        remotePlayer = {
          id: snapshot.id,
          position: vec3(snapshot.position[0], snapshot.position[1], snapshot.position[2]),
          forward: vec3(snapshot.forward[0], snapshot.forward[1], snapshot.forward[2]),
          right: vec3(snapshot.right[0], snapshot.right[1], snapshot.right[2]),
          up: vec3(snapshot.up[0], snapshot.up[1], snapshot.up[2]),
          speed: snapshot.speed,
          smoothedPitch: snapshot.smoothedPitch,
          smoothedRoll: snapshot.smoothedRoll,
          smoothedYaw: snapshot.smoothedYaw,
          updatedAt: snapshot.updatedAt,
          targetPosition: vec3(snapshot.position[0], snapshot.position[1], snapshot.position[2]),
          targetForward: vec3(snapshot.forward[0], snapshot.forward[1], snapshot.forward[2]),
          targetRight: vec3(snapshot.right[0], snapshot.right[1], snapshot.right[2]),
          targetUp: vec3(snapshot.up[0], snapshot.up[1], snapshot.up[2]),
          targetSpeed: snapshot.speed,
          targetPitch: snapshot.smoothedPitch,
          targetRoll: snapshot.smoothedRoll,
          targetYaw: snapshot.smoothedYaw,
        };
        this.remotePlayers.set(snapshot.id, remotePlayer);
      }

      this.copyTuple(remotePlayer.targetPosition, snapshot.position);
      this.copyTuple(remotePlayer.targetForward, snapshot.forward);
      this.copyTuple(remotePlayer.targetRight, snapshot.right);
      this.copyTuple(remotePlayer.targetUp, snapshot.up);
      remotePlayer.targetSpeed = snapshot.speed;
      remotePlayer.targetPitch = snapshot.smoothedPitch;
      remotePlayer.targetRoll = snapshot.smoothedRoll;
      remotePlayer.targetYaw = snapshot.smoothedYaw;
      remotePlayer.targetShootingTimer = 0; // Not in snapshot yet, but good for local
      remotePlayer.updatedAt = snapshot.updatedAt;
    }

    for (const id of this.remotePlayers.keys()) {
      if (!seen.has(id)) {
        this.remotePlayers.delete(id);
      }
    }
  }

  removeRemotePlayer(id: string): void {
    this.remotePlayers.delete(id);
  }

  clearRemotePlayers(): void {
    this.remotePlayers.clear();
  }

  private frame(timeMs: number): void {
    if (!this.isRunning) {
      return;
    }

    const deltaTime = Math.min(0.05, Math.max(0.001, (timeMs - this.lastTimeMs) * 0.001));
    this.lastTimeMs = timeMs;

    updatePlayerController(
      this.player,
      this.input,
      deltaTime,
      this.terrainQuery,
      this.config.seaLevel,
      timeMs * 0.001,
    );
    updateOrbitalCamera(
      this.camera,
      this.player,
      this.canvas.width / this.canvas.height,
      deltaTime,
    );
    
    // Shooting logic
    if (this.input.shoot && timeMs - this.player.lastShootTime > 150) {
      this.player.lastShootTime = timeMs;
      this.player.shootingTimer = 1.0; // Flash intensity
      this.spawnProjectiles();
    }

    // Decay shooting timer
    this.player.shootingTimer = Math.max(0, this.player.shootingTimer - deltaTime * 10.0);

    // Update projectiles
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.position[0] += p.velocity[0] * deltaTime;
      p.position[1] += p.velocity[1] * deltaTime;
      p.position[2] += p.velocity[2] * deltaTime;
      p.life -= deltaTime;
      if (p.life <= 0) {
        this.projectiles.splice(i, 1);
      }
    }

    // Interpolate remote players
    const lerpFactor = Math.min(1.0, deltaTime * 10.0); // Simple exponential smoothing
    for (const remote of this.remotePlayers.values()) {
      vec3Lerp(remote.position, remote.position, remote.targetPosition, lerpFactor);
      vec3Lerp(remote.forward, remote.forward, remote.targetForward, lerpFactor);
      vec3Lerp(remote.right, remote.right, remote.targetRight, lerpFactor);
      vec3Lerp(remote.up, remote.up, remote.targetUp, lerpFactor);
      remote.speed = lerp(remote.speed, remote.targetSpeed, lerpFactor);
      remote.smoothedPitch = lerp(remote.smoothedPitch, remote.targetPitch, lerpFactor);
      remote.smoothedRoll = lerp(remote.smoothedRoll, remote.targetRoll, lerpFactor);
      remote.smoothedYaw = lerp(remote.smoothedYaw, remote.targetYaw, lerpFactor);
      remote.shootingTimer = Math.max(0, remote.shootingTimer - deltaTime * 10.0);
    }

    this.bridge.updateFrameUniforms(this.camera, this.sunDirection, this.player.position, timeMs * 0.001, deltaTime);
    this.bridge.updateCloudUniforms(this.player, deltaTime);
    this.bridge.render(
      this.context.getCurrentTexture().createView(),
      this.camera,
      [this.player, ...this.remotePlayers.values()],
      this.projectiles,
    );

    requestAnimationFrame(this.animationFrame);
  }

  private spawnProjectiles(): void {
    // Spawn two projectiles from the wing tips
    const spread = this.player.physics.projectileSpread;
    const forwardSpeed = this.player.speed + this.player.physics.projectileSpeed;
    
    for (const side of [-1, 1]) {
      const pos = vec3(
        this.player.position[0] + this.player.right[0] * spread * side - this.player.up[0] * 1.5,
        this.player.position[1] + this.player.right[1] * spread * side - this.player.up[1] * 1.5,
        this.player.position[2] + this.player.right[2] * spread * side - this.player.up[2] * 1.5
      );
      
      const vel = vec3(
        this.player.forward[0] * forwardSpeed,
        this.player.forward[1] * forwardSpeed,
        this.player.forward[2] * forwardSpeed
      );
      
      this.projectiles.push({ position: pos, velocity: vel, life: 2.0 });
    }
  }

  private copyTuple(target: Vec3, source: readonly [number, number, number]): void {
    target[0] = source[0];
    target[1] = source[1];
    target[2] = source[2];
  }
}

export async function createMiniEngine(bootstrap: MiniEngineBootstrap): Promise<MiniEngine> {
  return MiniEngine.create(bootstrap);
}
