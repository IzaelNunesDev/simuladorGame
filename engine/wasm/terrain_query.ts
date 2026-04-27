import { Vec3, vec3, vec3Normalize, vec3Cross, smoothstep } from "./math";
import type { TerrainNoiseSettings } from "./gpu_bridge";

// Import noise functions from noise.ts (we'll expose them or re-implement here)
// Actually it's better to import them if they are exported, but noise.ts doesn't export them currently except getTerrainHeight.
// Let's modify noise.ts to export the raw noise functions, or just put them here. 
// For now, I'll assume I will edit noise.ts to export snoise3, fractalNoise3, ridgedNoise3.
import { snoise3, fractalNoise3, ridgedNoise3 } from "./noise";

export class TerrainQuery {
  public readonly config: TerrainNoiseSettings;
  private readonly mapData: Uint8Array | null = null;
  private readonly mapWidth: number = 0;
  private readonly mapHeight: number = 0;

  constructor(config: TerrainNoiseSettings, baseMapBitmap?: ImageBitmap) {
    this.config = config;

    if (baseMapBitmap) {
      this.mapWidth = baseMapBitmap.width;
      this.mapHeight = baseMapBitmap.height;
      const canvas = new OffscreenCanvas(this.mapWidth, this.mapHeight);
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(baseMapBitmap, 0, 0);
        const imageData = ctx.getImageData(0, 0, this.mapWidth, this.mapHeight);
        this.mapData = new Uint8Array(imageData.data.buffer); // RGBA
      }
    }
  }

  private sphereToUV(x: number, y: number, z: number): [number, number] {
    const len = Math.hypot(x, y, z) || 1.0;
    const nx = x / len;
    const ny = y / len;
    const nz = z / len;
    
    const longitude = Math.atan2(nx, -nz);
    const latitude = Math.asin(Math.max(-1.0, Math.min(1.0, ny)));
    
    const u = (longitude / Math.PI + 1.0) * 0.5;
    const v = latitude / Math.PI + 0.5;
    return [u, v];
  }

  private sampleMap(u: number, v: number): number {
    if (!this.mapData) return 1.0; // fallback se não tiver mapa
    
    // Clamp to edge
    const clampedU = Math.max(0.0, Math.min(1.0, u));
    const clampedV = Math.max(0.0, Math.min(1.0, v));

    const x = Math.min(Math.floor(clampedU * this.mapWidth), this.mapWidth - 1);
    const y = Math.min(Math.floor(clampedV * this.mapHeight), this.mapHeight - 1);
    
    const index = (y * this.mapWidth + x) * 4;
    const r = this.mapData[index]; // red channel
    return r / 255.0;
  }

  private mix(a: number, b: number, t: number): number {
    return a * (1.0 - t) + b * t;
  }

  public getHeight(sphereDir: Vec3): number {
    const x = sphereDir[0];
    const y = sphereDir[1];
    const z = sphereDir[2];

    const freq = this.config.baseFrequency;
    const seed = this.config.seed;

    // 1. Domain Warping
    const warpX = snoise3(x * freq * 0.5 + seed, y * freq * 0.5 + 1.0, z * freq * 0.5);
    const warpY = snoise3(z * freq * 0.5, x * freq * 0.5 + seed, y * freq * 0.5 + 1.0);
    const warpZ = snoise3(y * freq * 0.5 + 1.0, z * freq * 0.5, x * freq * 0.5 + seed);

    const warpedX = x + warpX * 0.25;
    const warpedY = y + warpY * 0.25;
    const warpedZ = z + warpZ * 0.25;
    const warpedLen = Math.hypot(warpedX, warpedY, warpedZ) || 1.0;
    const nx = warpedX / warpedLen;
    const ny = warpedY / warpedLen;
    const nz = warpedZ / warpedLen;

    // 2. Continentalness via textura
    const [u, v] = this.sphereToUV(x, y, z);
    const rawContinent = this.sampleMap(u, v);
    const continentMask = smoothstep(0.15, 0.45, rawContinent);

    // 3. Mapa de Biomas
    const biomeNoise = fractalNoise3(nx * 0.25 + seed * 3.0, ny * 0.25, nz * 0.25, this.config, 0, 0, 0) * 0.5 + 0.5;
    const hillMask = smoothstep(0.35, 0.45, biomeNoise);
    const mountainMask = smoothstep(0.55, 0.65, biomeNoise);

    // 4. Tipos de terreno
    const details = fractalNoise3(nx * 8.0, ny * 8.0, nz * 8.0, this.config, 0, 0, 0) * 0.5 + 0.5;
    
    const flatlands = details * 0.01;
    
    const hills = fractalNoise3(nx * 1.5, ny * 1.5, nz * 1.5, this.config, 0, 0, 0) * 0.5 + 0.5;
    const hillsRelief = (hills * 0.12) + (details * 0.02);

    const mountains = ridgedNoise3(nx * 3.0, ny * 3.0, nz * 3.0, this.config);
    const mountainsRelief = (mountains * 1.5) + (details * 0.05);

    // 5. Mistura
    let landRelief = this.mix(flatlands, hillsRelief, hillMask);
    landRelief = this.mix(landRelief, mountainsRelief, mountainMask);

    const combined = landRelief * continentMask;
    return Math.max(combined * this.config.baseAmplitude, 0.0);
  }

  public getNormal(sphereDir: Vec3): Vec3 {
    // Calcula a normal através de aproximação por diferenças finitas
    const eps = 0.001;
    const tangentU = vec3();
    const tangentV = vec3();
    
    if (Math.abs(sphereDir[1]) < 0.999) {
      vec3Normalize(tangentU, vec3Cross(tangentU, vec3(0, 1, 0), sphereDir));
    } else {
      vec3Normalize(tangentU, vec3Cross(tangentU, vec3(1, 0, 0), sphereDir));
    }
    vec3Normalize(tangentV, vec3Cross(tangentV, sphereDir, tangentU));

    const pN = vec3(sphereDir[0] + tangentV[0] * eps, sphereDir[1] + tangentV[1] * eps, sphereDir[2] + tangentV[2] * eps);
    const pS = vec3(sphereDir[0] - tangentV[0] * eps, sphereDir[1] - tangentV[1] * eps, sphereDir[2] - tangentV[2] * eps);
    const pE = vec3(sphereDir[0] + tangentU[0] * eps, sphereDir[1] + tangentU[1] * eps, sphereDir[2] + tangentU[2] * eps);
    const pW = vec3(sphereDir[0] - tangentU[0] * eps, sphereDir[1] - tangentU[1] * eps, sphereDir[2] - tangentU[2] * eps);
    vec3Normalize(pN, pN);
    vec3Normalize(pS, pS);
    vec3Normalize(pE, pE);
    vec3Normalize(pW, pW);

    const hN = this.getHeight(pN);
    const hS = this.getHeight(pS);
    const hE = this.getHeight(pE);
    const hW = this.getHeight(pW);

    const worldRadius = 1.0; // raio base não importa muito para a orientação da normal local
    const vN = vec3(pN[0] * (worldRadius + hN), pN[1] * (worldRadius + hN), pN[2] * (worldRadius + hN));
    const vS = vec3(pS[0] * (worldRadius + hS), pS[1] * (worldRadius + hS), pS[2] * (worldRadius + hS));
    const vE = vec3(pE[0] * (worldRadius + hE), pE[1] * (worldRadius + hE), pE[2] * (worldRadius + hE));
    const vW = vec3(pW[0] * (worldRadius + hW), pW[1] * (worldRadius + hW), pW[2] * (worldRadius + hW));

    const dirNorth = vec3(vN[0] - vS[0], vN[1] - vS[1], vN[2] - vS[2]);
    const dirEast = vec3(vE[0] - vW[0], vE[1] - vW[1], vE[2] - vW[2]);
    vec3Normalize(dirNorth, dirNorth);
    vec3Normalize(dirEast, dirEast);

    const normal = vec3();
    vec3Cross(normal, dirNorth, dirEast);
    vec3Normalize(normal, normal);
    return normal;
  }

  public getBiome(sphereDir: Vec3): number {
    const x = sphereDir[0];
    const y = sphereDir[1];
    const z = sphereDir[2];
    const freq = this.config.baseFrequency;
    const seed = this.config.seed;

    const warpX = snoise3(x * freq * 0.5 + seed, y * freq * 0.5 + 1.0, z * freq * 0.5);
    const warpY = snoise3(z * freq * 0.5, x * freq * 0.5 + seed, y * freq * 0.5 + 1.0);
    const warpZ = snoise3(y * freq * 0.5 + 1.0, z * freq * 0.5, x * freq * 0.5 + seed);

    const warpedX = x + warpX * 0.25;
    const warpedY = y + warpY * 0.25;
    const warpedZ = z + warpZ * 0.25;
    const warpedLen = Math.hypot(warpedX, warpedY, warpedZ) || 1.0;
    
    return fractalNoise3((warpedX/warpedLen) * 0.25 + seed * 3.0, (warpedY/warpedLen) * 0.25, (warpedZ/warpedLen) * 0.25, this.config, 0, 0, 0) * 0.5 + 0.5;
  }

  public isOcean(sphereDir: Vec3, seaLevel: number): boolean {
    const height = this.getHeight(sphereDir);
    return height < seaLevel;
  }
}
