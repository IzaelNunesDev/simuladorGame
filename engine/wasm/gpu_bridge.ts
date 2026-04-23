import type { CameraState } from "./camera";
import { Vec3 } from "./math";
import type { PlayerState } from "./player_controller";

export interface TerrainNoiseSettings {
  octaves: number;
  persistence: number;
  lacunarity: number;
  baseFrequency: number;
  baseAmplitude: number;
  seed: number;
}

export interface EngineConfig {
  terrainResolution: number;
  worldRadius: number;
  flyHeight: number;
  seaLevel: number;
  atmosphereHeight: number;
  particleCount: number;
  cloudCollisionRadius: number;
  cloudRelaxToHome: number;
  cloudBillboardSize: number;
  cloudStrength: number;
  terrainNoise: TerrainNoiseSettings;
}

export interface ShaderLibrary {
  terrainCompute: string;
  planetRender: string;
  oceanRender: string;
  atmosphereRender: string;
  cloudsCompute: string;
  cloudsRender: string;
  airplaneRender: string;
}

const FRAME_UNIFORM_FLOATS = 40;
const CLOUD_UNIFORM_FLOATS = 20;
const AIRPLANE_UNIFORM_FLOATS = 20;
const AIRPLANE_VERTEX_COUNT = 51;
const PARTICLE_STRIDE_FLOATS = 16;
const TERRAIN_PARAM_BYTES = 32;

export class GpuBridge {
  readonly device: GPUDevice;
  readonly format: GPUTextureFormat;
  readonly config: EngineConfig;

  readonly terrainVertexCount: number;
  readonly terrainIndexCount: number;
  readonly cloudParticleCount: number;

  private readonly frameUniformData = new Float32Array(FRAME_UNIFORM_FLOATS);
  private readonly cloudUniformData = new Float32Array(CLOUD_UNIFORM_FLOATS);
  private readonly airplaneUniformData = new Float32Array(AIRPLANE_UNIFORM_FLOATS);
  private readonly terrainParamBytes = new ArrayBuffer(TERRAIN_PARAM_BYTES);

  private readonly frameUniformBuffer: GPUBuffer;
  private readonly terrainParamBuffer: GPUBuffer;
  private readonly cloudParamBuffer: GPUBuffer;
  private readonly airplaneUniformBuffer: GPUBuffer;
  private readonly terrainPositionBuffer: GPUBuffer;
  private readonly terrainNormalBuffer: GPUBuffer;
  private readonly terrainHeightBuffer: GPUBuffer;
  private readonly particleBuffer: GPUBuffer;
  private readonly terrainIndexBuffer: GPUBuffer;

  private readonly terrainComputePipeline: GPUComputePipeline;
  private readonly cloudsComputePipeline: GPUComputePipeline;
  private readonly planetRenderPipeline: GPURenderPipeline;
  private readonly oceanRenderPipeline: GPURenderPipeline;
  private readonly atmosphereRenderPipeline: GPURenderPipeline;
  private readonly cloudsRenderPipeline: GPURenderPipeline;
  private readonly airplaneRenderPipeline: GPURenderPipeline;

  private readonly atmosphereFrameBindGroup: GPUBindGroup;
  private readonly planetFrameBindGroup: GPUBindGroup;
  private readonly oceanFrameBindGroup: GPUBindGroup;
  private readonly cloudsFrameBindGroup: GPUBindGroup;
  private readonly airplaneFrameBindGroup: GPUBindGroup;
  private readonly terrainComputeBindGroup: GPUBindGroup;
  private readonly atmosphereTerrainBindGroup: GPUBindGroup;
  private readonly planetTerrainBindGroup: GPUBindGroup;
  private readonly oceanTerrainBindGroup: GPUBindGroup;
  private readonly cloudComputeBindGroup: GPUBindGroup;
  private readonly cloudRenderBindGroup: GPUBindGroup;
  private readonly airplaneUniformBindGroup: GPUBindGroup;

  private depthTexture: GPUTexture | null = null;
  private depthTextureView: GPUTextureView | null = null;

  private constructor(
    device: GPUDevice,
    format: GPUTextureFormat,
    config: EngineConfig,
    terrainVertexCount: number,
    terrainIndexCount: number,
    cloudParticleCount: number,
    frameUniformBuffer: GPUBuffer,
    terrainParamBuffer: GPUBuffer,
    cloudParamBuffer: GPUBuffer,
    airplaneUniformBuffer: GPUBuffer,
    terrainPositionBuffer: GPUBuffer,
    terrainNormalBuffer: GPUBuffer,
    terrainHeightBuffer: GPUBuffer,
    particleBuffer: GPUBuffer,
    terrainIndexBuffer: GPUBuffer,
    terrainComputePipeline: GPUComputePipeline,
    cloudsComputePipeline: GPUComputePipeline,
    planetRenderPipeline: GPURenderPipeline,
    oceanRenderPipeline: GPURenderPipeline,
    atmosphereRenderPipeline: GPURenderPipeline,
    cloudsRenderPipeline: GPURenderPipeline,
    airplaneRenderPipeline: GPURenderPipeline,
    atmosphereFrameBindGroup: GPUBindGroup,
    planetFrameBindGroup: GPUBindGroup,
    oceanFrameBindGroup: GPUBindGroup,
    cloudsFrameBindGroup: GPUBindGroup,
    airplaneFrameBindGroup: GPUBindGroup,
    terrainComputeBindGroup: GPUBindGroup,
    atmosphereTerrainBindGroup: GPUBindGroup,
    planetTerrainBindGroup: GPUBindGroup,
    oceanTerrainBindGroup: GPUBindGroup,
    cloudComputeBindGroup: GPUBindGroup,
    cloudRenderBindGroup: GPUBindGroup,
    airplaneUniformBindGroup: GPUBindGroup,
  ) {
    this.device = device;
    this.format = format;
    this.config = config;
    this.terrainVertexCount = terrainVertexCount;
    this.terrainIndexCount = terrainIndexCount;
    this.cloudParticleCount = cloudParticleCount;
    this.frameUniformBuffer = frameUniformBuffer;
    this.terrainParamBuffer = terrainParamBuffer;
    this.cloudParamBuffer = cloudParamBuffer;
    this.airplaneUniformBuffer = airplaneUniformBuffer;
    this.terrainPositionBuffer = terrainPositionBuffer;
    this.terrainNormalBuffer = terrainNormalBuffer;
    this.terrainHeightBuffer = terrainHeightBuffer;
    this.particleBuffer = particleBuffer;
    this.terrainIndexBuffer = terrainIndexBuffer;
    this.terrainComputePipeline = terrainComputePipeline;
    this.cloudsComputePipeline = cloudsComputePipeline;
    this.planetRenderPipeline = planetRenderPipeline;
    this.oceanRenderPipeline = oceanRenderPipeline;
    this.atmosphereRenderPipeline = atmosphereRenderPipeline;
    this.cloudsRenderPipeline = cloudsRenderPipeline;
    this.airplaneRenderPipeline = airplaneRenderPipeline;
    this.atmosphereFrameBindGroup = atmosphereFrameBindGroup;
    this.planetFrameBindGroup = planetFrameBindGroup;
    this.oceanFrameBindGroup = oceanFrameBindGroup;
    this.cloudsFrameBindGroup = cloudsFrameBindGroup;
    this.airplaneFrameBindGroup = airplaneFrameBindGroup;
    this.terrainComputeBindGroup = terrainComputeBindGroup;
    this.atmosphereTerrainBindGroup = atmosphereTerrainBindGroup;
    this.planetTerrainBindGroup = planetTerrainBindGroup;
    this.oceanTerrainBindGroup = oceanTerrainBindGroup;
    this.cloudComputeBindGroup = cloudComputeBindGroup;
    this.cloudRenderBindGroup = cloudRenderBindGroup;
    this.airplaneUniformBindGroup = airplaneUniformBindGroup;
  }

  static async create(
    device: GPUDevice,
    format: GPUTextureFormat,
    config: EngineConfig,
    shaders: ShaderLibrary,
    canvasWidth: number,
    canvasHeight: number,
  ): Promise<GpuBridge> {
    const terrainVertexCount = config.terrainResolution * config.terrainResolution * 6;
    const terrainIndexData = buildTerrainIndexBuffer(config.terrainResolution);
    const particleData = buildParticleData(config);

    const frameUniformBuffer = device.createBuffer({
      size: FRAME_UNIFORM_FLOATS * 4,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    const terrainParamBuffer = device.createBuffer({
      size: TERRAIN_PARAM_BYTES,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    const cloudParamBuffer = device.createBuffer({
      size: CLOUD_UNIFORM_FLOATS * 4,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });
    const airplaneUniformBuffer = device.createBuffer({
      size: AIRPLANE_UNIFORM_FLOATS * 4,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    const terrainPositionBuffer = device.createBuffer({
      size: terrainVertexCount * 16,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST,
    });
    const terrainNormalBuffer = device.createBuffer({
      size: terrainVertexCount * 16,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST,
    });
    const terrainHeightBuffer = device.createBuffer({
      size: terrainVertexCount * 4,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST,
    });

    const particleBuffer = device.createBuffer({
      size: particleData.byteLength,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
      mappedAtCreation: true,
    });
    new Float32Array(particleBuffer.getMappedRange()).set(particleData);
    particleBuffer.unmap();

    const terrainIndexBuffer = device.createBuffer({
      size: terrainIndexData.byteLength,
      usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
      mappedAtCreation: true,
    });
    new Uint32Array(terrainIndexBuffer.getMappedRange()).set(terrainIndexData);
    terrainIndexBuffer.unmap();

    const terrainComputePipeline = device.createComputePipeline({
      layout: "auto",
      compute: {
        module: device.createShaderModule({ code: shaders.terrainCompute }),
        entryPoint: "main",
      },
    });

    const cloudsComputePipeline = device.createComputePipeline({
      layout: "auto",
      compute: {
        module: device.createShaderModule({ code: shaders.cloudsCompute }),
        entryPoint: "main",
      },
    });

    const planetRenderPipeline = createRenderPipeline(device, format, shaders.planetRender, "vs_main", "fs_main");
    const oceanRenderPipeline = createRenderPipeline(device, format, shaders.oceanRender, "vs_main", "fs_main", true);
    const atmosphereRenderPipeline = createRenderPipeline(device, format, shaders.atmosphereRender, "vs_main", "fs_main", true);
    const cloudsRenderPipeline = createRenderPipeline(device, format, shaders.cloudsRender, "vs_main", "fs_main", true);
    const airplaneRenderPipeline = createRenderPipeline(device, format, shaders.airplaneRender, "vs_main", "fs_main");

    const atmosphereFrameBindGroup = device.createBindGroup({
      layout: atmosphereRenderPipeline.getBindGroupLayout(0),
      entries: [{ binding: 0, resource: { buffer: frameUniformBuffer } }],
    });
    const planetFrameBindGroup = device.createBindGroup({
      layout: planetRenderPipeline.getBindGroupLayout(0),
      entries: [{ binding: 0, resource: { buffer: frameUniformBuffer } }],
    });
    const oceanFrameBindGroup = device.createBindGroup({
      layout: oceanRenderPipeline.getBindGroupLayout(0),
      entries: [{ binding: 0, resource: { buffer: frameUniformBuffer } }],
    });
    const cloudsFrameBindGroup = device.createBindGroup({
      layout: cloudsRenderPipeline.getBindGroupLayout(0),
      entries: [{ binding: 0, resource: { buffer: frameUniformBuffer } }],
    });
    const airplaneFrameBindGroup = device.createBindGroup({
      layout: airplaneRenderPipeline.getBindGroupLayout(0),
      entries: [{ binding: 0, resource: { buffer: frameUniformBuffer } }],
    });

    const terrainComputeBindGroup = device.createBindGroup({
      layout: terrainComputePipeline.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: { buffer: terrainParamBuffer } },
        { binding: 1, resource: { buffer: terrainPositionBuffer } },
        { binding: 2, resource: { buffer: terrainNormalBuffer } },
        { binding: 3, resource: { buffer: terrainHeightBuffer } },
      ],
    });

    const atmosphereTerrainBindGroup = device.createBindGroup({
      layout: atmosphereRenderPipeline.getBindGroupLayout(1),
      entries: [
        { binding: 0, resource: { buffer: terrainParamBuffer } },
        { binding: 1, resource: { buffer: terrainPositionBuffer } },
        { binding: 2, resource: { buffer: terrainNormalBuffer } },
        { binding: 3, resource: { buffer: terrainHeightBuffer } },
      ],
    });

    const planetTerrainBindGroup = device.createBindGroup({
      layout: planetRenderPipeline.getBindGroupLayout(1),
      entries: [
        { binding: 0, resource: { buffer: terrainParamBuffer } },
        { binding: 1, resource: { buffer: terrainPositionBuffer } },
        { binding: 2, resource: { buffer: terrainNormalBuffer } },
        { binding: 3, resource: { buffer: terrainHeightBuffer } },
      ],
    });

    const oceanTerrainBindGroup = device.createBindGroup({
      layout: oceanRenderPipeline.getBindGroupLayout(1),
      entries: [
        { binding: 0, resource: { buffer: terrainParamBuffer } },
        { binding: 1, resource: { buffer: terrainPositionBuffer } },
        { binding: 2, resource: { buffer: terrainNormalBuffer } },
        { binding: 3, resource: { buffer: terrainHeightBuffer } },
      ],
    });

    const cloudComputeBindGroup = device.createBindGroup({
      layout: cloudsComputePipeline.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: { buffer: cloudParamBuffer } },
        { binding: 1, resource: { buffer: particleBuffer } },
      ],
    });

    const cloudRenderBindGroup = device.createBindGroup({
      layout: cloudsRenderPipeline.getBindGroupLayout(1),
      entries: [
        { binding: 0, resource: { buffer: cloudParamBuffer } },
        { binding: 1, resource: { buffer: particleBuffer } },
      ],
    });
    const airplaneUniformBindGroup = device.createBindGroup({
      layout: airplaneRenderPipeline.getBindGroupLayout(1),
      entries: [{ binding: 0, resource: { buffer: airplaneUniformBuffer } }],
    });

    const bridge = new GpuBridge(
      device,
      format,
      config,
      terrainVertexCount,
      terrainIndexData.length,
      config.particleCount,
      frameUniformBuffer,
      terrainParamBuffer,
      cloudParamBuffer,
      airplaneUniformBuffer,
      terrainPositionBuffer,
      terrainNormalBuffer,
      terrainHeightBuffer,
      particleBuffer,
      terrainIndexBuffer,
      terrainComputePipeline,
      cloudsComputePipeline,
      planetRenderPipeline,
      oceanRenderPipeline,
      atmosphereRenderPipeline,
      cloudsRenderPipeline,
      airplaneRenderPipeline,
      atmosphereFrameBindGroup,
      planetFrameBindGroup,
      oceanFrameBindGroup,
      cloudsFrameBindGroup,
      airplaneFrameBindGroup,
      terrainComputeBindGroup,
      atmosphereTerrainBindGroup,
      planetTerrainBindGroup,
      oceanTerrainBindGroup,
      cloudComputeBindGroup,
      cloudRenderBindGroup,
      airplaneUniformBindGroup,
    );

    bridge.writeTerrainParams();
    bridge.resize(canvasWidth, canvasHeight);
    bridge.generateTerrain();
    return bridge;
  }

  resize(width: number, height: number): void {
    this.depthTexture?.destroy();
    this.depthTexture = this.device.createTexture({
      size: {
        width: Math.max(1, Math.floor(width)),
        height: Math.max(1, Math.floor(height)),
      },
      format: "depth24plus",
      usage: GPUTextureUsage.RENDER_ATTACHMENT,
    });
    this.depthTextureView = this.depthTexture.createView();
  }

  updateFrameUniforms(camera: CameraState, sunDirection: Vec3, time: number, deltaTime: number): void {
    this.frameUniformData.set(camera.viewProjectionMatrix, 0);
    this.frameUniformData.set([camera.position[0], camera.position[1], camera.position[2], 1], 16);
    this.frameUniformData.set([sunDirection[0], sunDirection[1], sunDirection[2], 0], 20);
    this.frameUniformData.set([camera.right[0], camera.right[1], camera.right[2], 0], 24);
    this.frameUniformData.set([camera.up[0], camera.up[1], camera.up[2], 0], 28);
    this.frameUniformData[32] = time;
    this.frameUniformData[33] = deltaTime;
    this.frameUniformData[34] = this.config.worldRadius;
    this.frameUniformData[35] = this.config.seaLevel;
    this.frameUniformData[36] = this.config.atmosphereHeight;
    this.frameUniformData[37] = this.config.flyHeight;
    this.frameUniformData[38] = 0;
    this.frameUniformData[39] = 0;
    this.device.queue.writeBuffer(this.frameUniformBuffer, 0, this.frameUniformData);
  }

  updateCloudUniforms(player: PlayerState, deltaTime: number): void {
    this.cloudUniformData.set([player.position[0], player.position[1], player.position[2], 1], 0);
    this.cloudUniformData.set([player.forward[0], player.forward[1], player.forward[2], 0], 4);
    this.cloudUniformData[8] = this.config.cloudCollisionRadius;
    this.cloudUniformData[9] = Math.max(player.speed * 0.015, 0.05);
    this.cloudUniformData[10] = this.config.cloudRelaxToHome;
    this.cloudUniformData[11] = deltaTime;
    this.cloudUniformData[12] = this.config.particleCount;
    this.cloudUniformData[13] = this.config.cloudBillboardSize;
    this.cloudUniformData[14] = this.config.cloudStrength;
    this.cloudUniformData[15] = 0.985;
    this.cloudUniformData[16] = 0;
    this.cloudUniformData[17] = 0;
    this.cloudUniformData[18] = 0;
    this.cloudUniformData[19] = 0;
    this.device.queue.writeBuffer(this.cloudParamBuffer, 0, this.cloudUniformData);
  }

  updateAirplaneUniforms(player: PlayerState): void {
    const bankAngle = player.rollBank * 1.25;
    const cosBank = Math.cos(bankAngle);
    const sinBank = Math.sin(bankAngle);

    const rolledRightX = player.right[0] * cosBank + player.up[0] * sinBank;
    const rolledRightY = player.right[1] * cosBank + player.up[1] * sinBank;
    const rolledRightZ = player.right[2] * cosBank + player.up[2] * sinBank;
    const rolledUpX = player.up[0] * cosBank - player.right[0] * sinBank;
    const rolledUpY = player.up[1] * cosBank - player.right[1] * sinBank;
    const rolledUpZ = player.up[2] * cosBank - player.right[2] * sinBank;

    const scale = Math.max(this.config.flyHeight * 0.012, 1.35);
    const offsetForward = scale * 5.5;
    const offsetDown = scale * 0.65;
    const planePosX = player.position[0] + player.forward[0] * offsetForward - rolledUpX * offsetDown;
    const planePosY = player.position[1] + player.forward[1] * offsetForward - rolledUpY * offsetDown;
    const planePosZ = player.position[2] + player.forward[2] * offsetForward - rolledUpZ * offsetDown;

    this.airplaneUniformData[0] = rolledRightX * scale;
    this.airplaneUniformData[1] = rolledRightY * scale;
    this.airplaneUniformData[2] = rolledRightZ * scale;
    this.airplaneUniformData[3] = 0;

    this.airplaneUniformData[4] = rolledUpX * scale;
    this.airplaneUniformData[5] = rolledUpY * scale;
    this.airplaneUniformData[6] = rolledUpZ * scale;
    this.airplaneUniformData[7] = 0;

    this.airplaneUniformData[8] = player.forward[0] * scale;
    this.airplaneUniformData[9] = player.forward[1] * scale;
    this.airplaneUniformData[10] = player.forward[2] * scale;
    this.airplaneUniformData[11] = 0;

    this.airplaneUniformData[12] = planePosX;
    this.airplaneUniformData[13] = planePosY;
    this.airplaneUniformData[14] = planePosZ;
    this.airplaneUniformData[15] = 1;

    this.airplaneUniformData[16] = 0.92;
    this.airplaneUniformData[17] = 0.74;
    this.airplaneUniformData[18] = 0.18;
    this.airplaneUniformData[19] = 1;
    this.device.queue.writeBuffer(this.airplaneUniformBuffer, 0, this.airplaneUniformData);
  }

  render(currentTextureView: GPUTextureView): void {
    if (!this.depthTextureView) {
      return;
    }

    const encoder = this.device.createCommandEncoder();

    const cloudPass = encoder.beginComputePass();
    cloudPass.setPipeline(this.cloudsComputePipeline);
    cloudPass.setBindGroup(0, this.cloudComputeBindGroup);
    cloudPass.dispatchWorkgroups(Math.ceil(this.cloudParticleCount / 64));
    cloudPass.end();

    const pass = encoder.beginRenderPass({
      colorAttachments: [
        {
          view: currentTextureView,
          clearValue: { r: 0.055, g: 0.08, b: 0.12, a: 1 },
          loadOp: "clear",
          storeOp: "store",
        },
      ],
      depthStencilAttachment: {
        view: this.depthTextureView,
        depthClearValue: 1,
        depthLoadOp: "clear",
        depthStoreOp: "store",
      },
    });

    pass.setIndexBuffer(this.terrainIndexBuffer, "uint32");
    pass.setPipeline(this.atmosphereRenderPipeline);
    pass.setBindGroup(0, this.atmosphereFrameBindGroup);
    pass.setBindGroup(1, this.atmosphereTerrainBindGroup);
    pass.drawIndexed(this.terrainIndexCount, 1, 0, 0, 0);

    pass.setPipeline(this.planetRenderPipeline);
    pass.setBindGroup(0, this.planetFrameBindGroup);
    pass.setBindGroup(1, this.planetTerrainBindGroup);
    pass.drawIndexed(this.terrainIndexCount, 1, 0, 0, 0);

    pass.setPipeline(this.oceanRenderPipeline);
    pass.setBindGroup(0, this.oceanFrameBindGroup);
    pass.setBindGroup(1, this.oceanTerrainBindGroup);
    pass.drawIndexed(this.terrainIndexCount, 1, 0, 0, 0);

    pass.setPipeline(this.airplaneRenderPipeline);
    pass.setBindGroup(0, this.airplaneFrameBindGroup);
    pass.setBindGroup(1, this.airplaneUniformBindGroup);
    pass.draw(AIRPLANE_VERTEX_COUNT, 1, 0, 0);

    pass.setPipeline(this.cloudsRenderPipeline);
    pass.setBindGroup(0, this.cloudsFrameBindGroup);
    pass.setBindGroup(1, this.cloudRenderBindGroup);
    pass.draw(6, this.cloudParticleCount, 0, 0);

    pass.end();
    this.device.queue.submit([encoder.finish()]);
  }

  private writeTerrainParams(): void {
    const dataView = new DataView(this.terrainParamBytes);
    dataView.setUint32(0, this.config.terrainResolution, true);
    dataView.setFloat32(4, this.config.worldRadius, true);
    dataView.setUint32(8, this.config.terrainNoise.octaves, true);
    dataView.setFloat32(12, this.config.terrainNoise.persistence, true);
    dataView.setFloat32(16, this.config.terrainNoise.lacunarity, true);
    dataView.setFloat32(20, this.config.terrainNoise.baseFrequency, true);
    dataView.setFloat32(24, this.config.terrainNoise.baseAmplitude, true);
    dataView.setFloat32(28, this.config.terrainNoise.seed, true);
    this.device.queue.writeBuffer(this.terrainParamBuffer, 0, this.terrainParamBytes);
  }

  private generateTerrain(): void {
    const encoder = this.device.createCommandEncoder();
    const pass = encoder.beginComputePass();
    pass.setPipeline(this.terrainComputePipeline);
    pass.setBindGroup(0, this.terrainComputeBindGroup);
    pass.dispatchWorkgroups(
      Math.ceil(this.config.terrainResolution / 8),
      Math.ceil(this.config.terrainResolution / 8),
      6,
    );
    pass.end();
    this.device.queue.submit([encoder.finish()]);
  }
}

function createRenderPipeline(
  device: GPUDevice,
  format: GPUTextureFormat,
  shaderCode: string,
  vertexEntryPoint: string,
  fragmentEntryPoint: string,
  enableBlend = false,
): GPURenderPipeline {
  const module = device.createShaderModule({ code: shaderCode });
  return device.createRenderPipeline({
    layout: "auto",
    vertex: {
      module,
      entryPoint: vertexEntryPoint,
    },
    fragment: {
      module,
      entryPoint: fragmentEntryPoint,
      targets: [
        {
          format,
          blend: enableBlend
            ? {
                color: {
                  srcFactor: "src-alpha",
                  dstFactor: "one-minus-src-alpha",
                  operation: "add",
                },
                alpha: {
                  srcFactor: "one",
                  dstFactor: "one-minus-src-alpha",
                  operation: "add",
                },
              }
            : undefined,
        },
      ],
    },
    primitive: {
      topology: "triangle-list",
      cullMode: "none",
    },
    depthStencil: {
      format: "depth24plus",
      depthWriteEnabled: !enableBlend,
      depthCompare: "less",
    },
  });
}

function buildTerrainIndexBuffer(resolution: number): Uint32Array {
  const quadsPerFace = (resolution - 1) * (resolution - 1);
  const indices = new Uint32Array(quadsPerFace * 6 * 6);
  let offset = 0;

  for (let face = 0; face < 6; face++) {
    const faceOffset = face * resolution * resolution;
    for (let y = 0; y < resolution - 1; y++) {
      for (let x = 0; x < resolution - 1; x++) {
        const i0 = faceOffset + y * resolution + x;
        const i1 = i0 + 1;
        const i2 = i0 + resolution;
        const i3 = i2 + 1;
        indices[offset++] = i0;
        indices[offset++] = i2;
        indices[offset++] = i1;
        indices[offset++] = i1;
        indices[offset++] = i2;
        indices[offset++] = i3;
      }
    }
  }
  return indices;
}

function buildParticleData(config: EngineConfig): Float32Array {
  const data = new Float32Array(config.particleCount * PARTICLE_STRIDE_FLOATS);
  const clusterCount = 28;
  const baseCloudRadius = config.worldRadius + config.flyHeight * 0.55;
  const clusterSpread = config.flyHeight * 0.55;

  for (let i = 0; i < config.particleCount; i++) {
    const clusterIndex = i % clusterCount;
    const clusterSeed = clusterIndex * 23.173 + 11.7;
    const particleSeed = i * 17.13 + clusterIndex * 5.31;

    const centerPhi = fract(hash01(clusterSeed * 1.17) * Math.PI * 2);
    const centerCosTheta = hash01(clusterSeed * 2.31) * 2 - 1;
    const centerSinTheta = Math.sqrt(Math.max(0, 1 - centerCosTheta * centerCosTheta));
    const centerX = Math.cos(centerPhi) * centerSinTheta;
    const centerY = centerCosTheta;
    const centerZ = Math.sin(centerPhi) * centerSinTheta;

    const worldUpX = Math.abs(centerY) < 0.92 ? 0 : 1;
    const worldUpY = Math.abs(centerY) < 0.92 ? 1 : 0;
    const worldUpZ = 0;

    let tangentX = worldUpY * centerZ - worldUpZ * centerY;
    let tangentY = worldUpZ * centerX - worldUpX * centerZ;
    let tangentZ = worldUpX * centerY - worldUpY * centerX;
    let tangentLen = Math.hypot(tangentX, tangentY, tangentZ);
    if (tangentLen < 1e-5) {
      tangentX = 1;
      tangentY = 0;
      tangentZ = 0;
      tangentLen = 1;
    }
    tangentX /= tangentLen;
    tangentY /= tangentLen;
    tangentZ /= tangentLen;

    let bitangentX = centerY * tangentZ - centerZ * tangentY;
    let bitangentY = centerZ * tangentX - centerX * tangentZ;
    let bitangentZ = centerX * tangentY - centerY * tangentX;

    const angle = hash01(particleSeed * 0.73) * Math.PI * 2;
    const radial = Math.pow(hash01(particleSeed * 1.91), 0.72) * clusterSpread;
    const shellOffset = (hash01(particleSeed * 2.77) - 0.5) * config.flyHeight * 0.18;
    const centerRadius = baseCloudRadius + (hash01(clusterSeed * 4.13) - 0.5) * config.flyHeight * 0.8;

    const localX = Math.cos(angle) * radial;
    const localY = Math.sin(angle) * radial;
    const px = centerX * (centerRadius + shellOffset) + tangentX * localX + bitangentX * localY;
    const py = centerY * (centerRadius + shellOffset) + tangentY * localX + bitangentY * localY;
    const pz = centerZ * (centerRadius + shellOffset) + tangentZ * localX + bitangentZ * localY;
    const base = i * PARTICLE_STRIDE_FLOATS;

    data[base + 0] = px;
    data[base + 1] = py;
    data[base + 2] = pz;
    data[base + 3] = 1;

    data[base + 4] = px;
    data[base + 5] = py;
    data[base + 6] = pz;
    data[base + 7] = 1;

    data[base + 8] = px;
    data[base + 9] = py;
    data[base + 10] = pz;
    data[base + 11] = 1;

    data[base + 12] = clusterIndex;
    data[base + 13] = radial;
    data[base + 14] = 0;
    data[base + 15] = 0;
  }
  return data;
}

function hash01(value: number): number {
  const x = Math.sin(value * 127.1) * 43758.5453123;
  return x - Math.floor(x);
}

function fract(value: number): number {
  return value - Math.floor(value);
}
