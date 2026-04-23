import type { TerrainNoiseSettings } from "./gpu_bridge";
import { Vec3, smoothstep } from "./math";

function mod289(value: number): number {
  return value - Math.floor(value * (1.0 / 289.0)) * 289.0;
}

function permute(value: number): number {
  return mod289(((value * 34.0) + 10.0) * value);
}

function taylorInvSqrt(value: number): number {
  return 1.79284291400159 - 0.85373472095314 * value;
}

function dot3(ax: number, ay: number, az: number, bx: number, by: number, bz: number): number {
  return ax * bx + ay * by + az * bz;
}

function dot4(ax: number, ay: number, az: number, aw: number, bx: number, by: number, bz: number, bw: number): number {
  return ax * bx + ay * by + az * bz + aw * bw;
}

function snoise3(x: number, y: number, z: number): number {
  const cX = 1.0 / 6.0;
  const cY = 1.0 / 3.0;

  let iX = Math.floor(x + (x + y + z) * cY);
  let iY = Math.floor(y + (x + y + z) * cY);
  let iZ = Math.floor(z + (x + y + z) * cY);

  const x0x = x - iX + (iX + iY + iZ) * cX;
  const x0y = y - iY + (iX + iY + iZ) * cX;
  const x0z = z - iZ + (iX + iY + iZ) * cX;

  const gX = x0x >= x0y ? 1.0 : 0.0;
  const gY = x0y >= x0z ? 1.0 : 0.0;
  const gZ = x0z >= x0x ? 1.0 : 0.0;
  const lX = 1.0 - gX;
  const lY = 1.0 - gY;
  const lZ = 1.0 - gZ;

  const i1x = Math.min(gX, lZ);
  const i1y = Math.min(gY, lX);
  const i1z = Math.min(gZ, lY);
  const i2x = Math.max(gX, lZ);
  const i2y = Math.max(gY, lX);
  const i2z = Math.max(gZ, lY);

  const x1x = x0x - i1x + cX;
  const x1y = x0y - i1y + cX;
  const x1z = x0z - i1z + cX;
  const x2x = x0x - i2x + cY;
  const x2y = x0y - i2y + cY;
  const x2z = x0z - i2z + cY;
  const x3x = x0x - 0.5;
  const x3y = x0y - 0.5;
  const x3z = x0z - 0.5;

  iX = mod289(iX);
  iY = mod289(iY);
  iZ = mod289(iZ);

  const p0 = permute(permute(permute(iZ + 0.0) + iY + 0.0) + iX + 0.0);
  const p1 = permute(permute(permute(iZ + i1z) + iY + i1y) + iX + i1x);
  const p2 = permute(permute(permute(iZ + i2z) + iY + i2y) + iX + i2x);
  const p3 = permute(permute(permute(iZ + 1.0) + iY + 1.0) + iX + 1.0);

  const n_ = 1.0 / 7.0;
  const nsX = n_ * 2.0;
  const nsY = n_ * 0.5 - 1.0;
  const nsZ = n_ * 1.0;

  const j0 = p0 - 49.0 * Math.floor(p0 * nsZ * nsZ);
  const j1 = p1 - 49.0 * Math.floor(p1 * nsZ * nsZ);
  const j2 = p2 - 49.0 * Math.floor(p2 * nsZ * nsZ);
  const j3 = p3 - 49.0 * Math.floor(p3 * nsZ * nsZ);

  const x_0 = Math.floor(j0 * nsZ);
  const x_1 = Math.floor(j1 * nsZ);
  const x_2 = Math.floor(j2 * nsZ);
  const x_3 = Math.floor(j3 * nsZ);

  const y_0 = Math.floor(j0 - 7.0 * x_0);
  const y_1 = Math.floor(j1 - 7.0 * x_1);
  const y_2 = Math.floor(j2 - 7.0 * x_2);
  const y_3 = Math.floor(j3 - 7.0 * x_3);

  const xx0 = x_0 * nsX + nsY;
  const xx1 = x_1 * nsX + nsY;
  const xx2 = x_2 * nsX + nsY;
  const xx3 = x_3 * nsX + nsY;
  const yy0 = y_0 * nsX + nsY;
  const yy1 = y_1 * nsX + nsY;
  const yy2 = y_2 * nsX + nsY;
  const yy3 = y_3 * nsX + nsY;

  const h0 = 1.0 - Math.abs(xx0) - Math.abs(yy0);
  const h1 = 1.0 - Math.abs(xx1) - Math.abs(yy1);
  const h2 = 1.0 - Math.abs(xx2) - Math.abs(yy2);
  const h3 = 1.0 - Math.abs(xx3) - Math.abs(yy3);

  const b0x = xx0;
  const b0y = xx1;
  const b0z = yy0;
  const b0w = yy1;
  const b1x = xx2;
  const b1y = xx3;
  const b1z = yy2;
  const b1w = yy3;

  const s0x = Math.floor(b0x) * 2.0 + 1.0;
  const s0y = Math.floor(b0y) * 2.0 + 1.0;
  const s0z = Math.floor(b0z) * 2.0 + 1.0;
  const s0w = Math.floor(b0w) * 2.0 + 1.0;
  const s1x = Math.floor(b1x) * 2.0 + 1.0;
  const s1y = Math.floor(b1y) * 2.0 + 1.0;
  const s1z = Math.floor(b1z) * 2.0 + 1.0;
  const s1w = Math.floor(b1w) * 2.0 + 1.0;

  const sh0 = h0 < 0.0 ? -1.0 : 0.0;
  const sh1 = h1 < 0.0 ? -1.0 : 0.0;
  const sh2 = h2 < 0.0 ? -1.0 : 0.0;
  const sh3 = h3 < 0.0 ? -1.0 : 0.0;

  let a0x = b0x + s0x * sh0;
  let a0y = b0z + s0z * sh0;
  let a0z = b0y + s0y * sh1;
  let a0w = b0w + s0w * sh1;
  let a1x = b1x + s1x * sh2;
  let a1y = b1z + s1z * sh2;
  let a1z = b1y + s1y * sh3;
  let a1w = b1w + s1w * sh3;

  let p0x = a0x;
  let p0y = a0y;
  let p0z = h0;
  let p1x = a0z;
  let p1y = a0w;
  let p1z = h1;
  let p2x = a1x;
  let p2y = a1y;
  let p2z = h2;
  let p3x = a1z;
  let p3y = a1w;
  let p3z = h3;

  const norm0 = taylorInvSqrt(dot3(p0x, p0y, p0z, p0x, p0y, p0z));
  const norm1 = taylorInvSqrt(dot3(p1x, p1y, p1z, p1x, p1y, p1z));
  const norm2 = taylorInvSqrt(dot3(p2x, p2y, p2z, p2x, p2y, p2z));
  const norm3 = taylorInvSqrt(dot3(p3x, p3y, p3z, p3x, p3y, p3z));
  p0x *= norm0; p0y *= norm0; p0z *= norm0;
  p1x *= norm1; p1y *= norm1; p1z *= norm1;
  p2x *= norm2; p2y *= norm2; p2z *= norm2;
  p3x *= norm3; p3y *= norm3; p3z *= norm3;

  let m0 = Math.max(0.5 - dot3(x0x, x0y, x0z, x0x, x0y, x0z), 0.0);
  let m1 = Math.max(0.5 - dot3(x1x, x1y, x1z, x1x, x1y, x1z), 0.0);
  let m2 = Math.max(0.5 - dot3(x2x, x2y, x2z, x2x, x2y, x2z), 0.0);
  let m3 = Math.max(0.5 - dot3(x3x, x3y, x3z, x3x, x3y, x3z), 0.0);
  m0 *= m0;
  m1 *= m1;
  m2 *= m2;
  m3 *= m3;

  return 105.0 * dot4(
    m0 * m0, m1 * m1, m2 * m2, m3 * m3,
    dot3(p0x, p0y, p0z, x0x, x0y, x0z),
    dot3(p1x, p1y, p1z, x1x, x1y, x1z),
    dot3(p2x, p2y, p2z, x2x, x2y, x2z),
    dot3(p3x, p3y, p3z, x3x, x3y, x3z),
  );
}

function fractalNoise3(
  x: number,
  y: number,
  z: number,
  config: TerrainNoiseSettings,
  seedX: number,
  seedY: number,
  seedZ: number,
): number {
  let noise = 0.0;
  let amplitude = 1.0;
  let frequency = config.baseFrequency;
  let amplitudeSum = 0.0;

  for (let i = 0; i < config.octaves; i++) {
    noise += snoise3(x * frequency + seedX, y * frequency + seedY, z * frequency + seedZ) * amplitude;
    amplitudeSum += amplitude;
    amplitude *= config.persistence;
    frequency *= config.lacunarity;
  }

  return noise / Math.max(amplitudeSum, 0.0001);
}

function ridgedNoise3(x: number, y: number, z: number, config: TerrainNoiseSettings): number {
  let value = 0.0;
  let amplitude = 1.0;
  let frequency = config.baseFrequency * 1.35;
  let amplitudeSum = 0.0;

  for (let i = 0; i < config.octaves; i++) {
    const sampleValue = 1.0 - Math.abs(snoise3(
      x * frequency + config.seed * 1.91,
      y * frequency + config.seed * 1.91,
      z * frequency + config.seed * 1.91,
    ));
    value += sampleValue * sampleValue * amplitude;
    amplitudeSum += amplitude;
    amplitude *= config.persistence;
    frequency *= config.lacunarity;
  }

  return value / Math.max(amplitudeSum, 0.0001);
}

export function getTerrainHeight(sphereDir: Vec3, config: TerrainNoiseSettings): number {
  const x = sphereDir[0];
  const y = sphereDir[1];
  const z = sphereDir[2];

  const warpX = snoise3(
    x * config.baseFrequency * 0.22 + config.seed,
    y * config.baseFrequency * 0.22,
    z * config.baseFrequency * 0.22,
  );
  const warpY = snoise3(
    z * config.baseFrequency * 0.24,
    x * config.baseFrequency * 0.24 + config.seed * 1.3,
    y * config.baseFrequency * 0.24,
  );
  const warpZ = snoise3(
    y * config.baseFrequency * 0.2,
    z * config.baseFrequency * 0.2,
    x * config.baseFrequency * 0.2 + config.seed * 1.7,
  );

  const warpedX = x + warpX * 0.22;
  const warpedY = y + warpY * 0.22;
  const warpedZ = z + warpZ * 0.22;
  const warpedLen = Math.hypot(warpedX, warpedY, warpedZ) || 1.0;
  const nx = warpedX / warpedLen;
  const ny = warpedY / warpedLen;
  const nz = warpedZ / warpedLen;

  const continents = smoothstep(0.48, 0.86, fractalNoise3(nx * 0.42, ny * 0.42, nz * 0.42, config, config.seed, config.seed, config.seed) * 0.5 + 0.5);
  const hills = fractalNoise3(nx * 1.35, ny * 1.35, nz * 1.35, config, config.seed, config.seed, config.seed) * 0.5 + 0.5;
  const mountains = ridgedNoise3(nx * 2.4, ny * 2.4, nz * 2.4, config);
  const details = fractalNoise3(nx * 5.25, ny * 5.25, nz * 5.25, config, config.seed, config.seed, config.seed) * 0.5 + 0.5;

  const macroHeight = hills * (0.18 + continents * 0.2) + mountains * 0.92 * continents;
  const detailHeight = details * 0.09 + mountains * continents * 0.28;
  const combined = (macroHeight + detailHeight) * continents;
  return Math.max(combined * config.baseAmplitude, 0.0);
}
