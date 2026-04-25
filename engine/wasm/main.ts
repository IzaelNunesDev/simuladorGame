import { CameraState, createCameraState, updateOrbitalCamera } from "./camera";
import { EngineConfig, GpuBridge, ShaderLibrary } from "./gpu_bridge";
import { MeshData } from "./gltf_loader";
import { Vec3, vec3, vec3Normalize } from "./math";
import {
  PlayerInputState,
  PlayerState,
  createPlayerInputState,
  createPlayerState,
  updatePlayerController,
} from "./player_controller";
import { TerrainQuery } from "./terrain_query";

export interface MiniEngineBootstrap {
  canvas: HTMLCanvasElement;
  context: GPUCanvasContext;
  device: GPUDevice;
  presentationFormat: GPUTextureFormat;
  shaders: ShaderLibrary;
  baseMapBitmap: ImageBitmap;
  airplaneMesh: MeshData;
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
    this.player = createPlayerState(config.worldRadius, config.flyHeight);
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
      case "ArrowLeft":
      case "KeyJ":
        this.input.yaw = value;
        break;
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
    );
    updateOrbitalCamera(
      this.camera,
      this.player,
      this.canvas.width / this.canvas.height,
      deltaTime,
    );

    this.bridge.updateFrameUniforms(this.camera, this.sunDirection, this.player.position, timeMs * 0.001, deltaTime);
    this.bridge.updateCloudUniforms(this.player, deltaTime);
    this.bridge.updateAirplaneUniforms(this.player, this.input);
    this.bridge.render(this.context.getCurrentTexture().createView(), this.camera);

    requestAnimationFrame(this.animationFrame);
  }
}

export async function createMiniEngine(bootstrap: MiniEngineBootstrap): Promise<MiniEngine> {
  return MiniEngine.create(bootstrap);
}
