// =============================================================================
// planet.wgsl — Render Shader: planet surface from compute-generated buffers
// =============================================================================

struct FrameUniforms {
  viewProjection: mat4x4<f32>,
  cameraPos: vec4f,
  sunDir: vec4f,
  cameraRight: vec4f,
  cameraUp: vec4f,
  playerPos: vec4f,
  time: f32,
  deltaTime: f32,
  worldRadius: f32,
  seaLevel: f32,
  atmosphereHeight: f32,
  flyHeight: f32,
  pad0: f32,
  pad1: f32,
};

struct TerrainParams {
  resolution: u32,
  worldRadius: f32,
  octaves: u32,
  persistence: f32,
  lacunarity: f32,
  baseFreq: f32,
  baseAmp: f32,
  seed: f32,
};

struct VertexOut {
  @builtin(position) clipPosition: vec4f,
  @location(0) worldPos: vec3f,
  @location(1) normal: vec3f,
  @location(2) uv: vec2f,
  @location(3) height: f32,
  @location(4) sphereDir: vec3f,
};

@group(0) @binding(0) var<uniform> frame: FrameUniforms;
@group(1) @binding(0) var<uniform> terrain: TerrainParams;
@group(1) @binding(1) var<storage, read> terrainPositions: array<vec4f>;
@group(1) @binding(2) var<storage, read> terrainNormals: array<vec4f>;
@group(1) @binding(3) var<storage, read> terrainHeights: array<f32>;

fn sphereToUV(p: vec3f) -> vec2f {
  let n = normalize(p);
  let longitude = atan2(n.x, -n.z);
  let latitude = asin(clamp(n.y, -1.0, 1.0));
  let u = (longitude / 3.14159265359 + 1.0) * 0.5;
  let v = latitude / 3.14159265359 + 0.5;
  return vec2f(u, v);
}

fn mod289_3(x: vec3f) -> vec3f { return x - floor(x * (1.0 / 289.0)) * 289.0; }
fn mod289_4(x: vec4f) -> vec4f { return x - floor(x * (1.0 / 289.0)) * 289.0; }
fn permute(x: vec4f) -> vec4f { return mod289_4(((x * 34.0) + 10.0) * x); }

fn taylorInvSqrt(r: vec4f) -> vec4f {
  return vec4f(1.79284291400159) - vec4f(0.85373472095314) * r;
}

fn snoise(v: vec3f) -> f32 {
  let C = vec2f(1.0 / 6.0, 1.0 / 3.0);
  let D = vec4f(0.0, 0.5, 1.0, 2.0);

  var i = floor(v + dot(v, vec3f(C.y)));
  let x0 = v - i + dot(i, vec3f(C.x));

  let g = step(x0.yzx, x0.xyz);
  let l = 1.0 - g;
  let i1 = min(g.xyz, l.zxy);
  let i2 = max(g.xyz, l.zxy);

  let x1 = x0 - i1 + vec3f(C.x);
  let x2 = x0 - i2 + vec3f(C.y);
  let x3 = x0 - vec3f(D.y);

  i = mod289_3(i);
  let p = permute(permute(permute(
    i.z + vec4f(0.0, i1.z, i2.z, 1.0))
  + i.y + vec4f(0.0, i1.y, i2.y, 1.0))
  + i.x + vec4f(0.0, i1.x, i2.x, 1.0));

  let n_ = 0.142857142857;
  let ns = n_ * D.wyz - D.xzx;

  let j = p - 49.0 * floor(p * ns.z * ns.z);
  let x_ = floor(j * ns.z);
  let y_ = floor(j - 7.0 * x_);

  let xx = x_ * ns.x + vec4f(ns.y);
  let yy = y_ * ns.x + vec4f(ns.y);
  let h = 1.0 - abs(xx) - abs(yy);

  let b0 = vec4f(xx.x, xx.y, yy.x, yy.y);
  let b1 = vec4f(xx.z, xx.w, yy.z, yy.w);

  let s0 = floor(b0) * 2.0 + 1.0;
  let s1 = floor(b1) * 2.0 + 1.0;
  let sh = -step(h, vec4f(0.0));

  let a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  let a1 = b1.xzyw + s1.xzyw * sh.zzww;

  var p0 = vec3f(a0.x, a0.y, h.x);
  var p1 = vec3f(a0.z, a0.w, h.y);
  var p2 = vec3f(a1.x, a1.y, h.z);
  var p3 = vec3f(a1.z, a1.w, h.w);

  let norm = taylorInvSqrt(vec4f(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

  var m = max(vec4f(0.5) - vec4f(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), vec4f(0.0));
  m = m * m;
  return 105.0 * dot(m * m, vec4f(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}

fn fractalNoise(pos: vec3f, baseFreq: f32, octaves: u32, persistence: f32, lacunarity: f32, seedOffset: vec3f) -> f32 {
  var noise = 0.0;
  var amplitude = 1.0;
  var frequency = baseFreq;
  var amplitudeSum = 0.0;

  for (var i = 0u; i < octaves; i++) {
    noise += snoise(pos * frequency + seedOffset) * amplitude;
    amplitudeSum += amplitude;
    amplitude *= persistence;
    frequency *= lacunarity;
  }

  return noise / max(amplitudeSum, 0.0001);
}

fn tangentFrame(n: vec3f) -> mat3x3<f32> {
  var tangent = cross(vec3f(0.0, 1.0, 0.0), n);
  if (length(tangent) < 0.001) {
    tangent = cross(vec3f(1.0, 0.0, 0.0), n);
  }
  tangent = normalize(tangent);
  let bitangent = normalize(cross(n, tangent));
  return mat3x3<f32>(tangent, bitangent, n);
}

fn atmosphericFog(worldPos: vec3f, cameraPos: vec3f, sunDir: vec3f) -> vec4f {
  let viewDir = normalize(worldPos - cameraPos);
  let dist = length(worldPos - cameraPos);
  let altitude = length(cameraPos) - frame.worldRadius;
  let altFactor = exp(-altitude / 400.0);
  let density = 0.00035 * altFactor;
  let fogAmount = 1.0 - exp(-dist * density);
  let sunDot = max(dot(viewDir, normalize(sunDir)), 0.0);
  let skyBase = vec3f(0.45, 0.62, 0.88);
  let sunsetTint = vec3f(0.98, 0.58, 0.32);
  let fogCol = mix(skyBase, sunsetTint, pow(sunDot, 4.0) * 0.5);
  return vec4f(fogCol, fogAmount);
}

@vertex
fn vs_main(@builtin(vertex_index) vertexIndex: u32) -> VertexOut {
  let worldPos = terrainPositions[vertexIndex].xyz;
  let normal = normalize(terrainNormals[vertexIndex].xyz);

  var out: VertexOut;
  out.worldPos = worldPos;
  out.normal = normal;
  out.uv = sphereToUV(worldPos);
  out.height = terrainHeights[vertexIndex];
  out.sphereDir = normalize(worldPos);
  out.clipPosition = frame.viewProjection * vec4f(worldPos, 1.0);
  return out;
}

@fragment
fn fs_main(in: VertexOut) -> @location(0) vec4f {
  let dirToSun = normalize(frame.sunDir.xyz);
  let baseNormal = normalize(in.normal);
  let viewDir = normalize(frame.cameraPos.xyz - in.worldPos);
  let planetPos = in.sphereDir;
  let planetSeed = terrain.seed;
  let humidityLarge = fractalNoise(
    planetPos.yzx * 1.37 + vec3f(planetSeed * 0.13, planetSeed * 0.29, planetSeed * 0.17),
    terrain.baseFreq * 0.72,
    max(terrain.octaves, 3u),
    0.58,
    terrain.lacunarity * 0.92,
    vec3f(37.1, 11.7, 53.9)
  ) * 0.5 + 0.5;
  let humiditySmall = snoise(planetPos * 8.5 + vec3f(planetSeed * 2.1, 7.3, -3.1)) * 0.25;
  let humidityNoise = clamp(humidityLarge + humiditySmall, 0.0, 1.0);
  let heightBlend = clamp(in.height / max(terrain.baseAmp * 0.95, 0.001), 0.0, 1.0);
  let slope = 1.0 - max(dot(baseNormal, in.sphereDir), 0.0);
  let latitude = abs(in.uv.y * 2.0 - 1.0);
  let coldMask = smoothstep(0.52, 0.95, latitude + heightBlend * 0.18);

  let macroA = snoise(planetPos * 4.5 + vec3f(11.0, 23.0, 5.0)) * 0.5 + 0.5;
  let macroB = snoise(planetPos.zxy * 7.2 + vec3f(-17.0, 9.0, 31.0)) * 0.5 + 0.5;
  let terrainVariation = macroA * 0.55 + macroB * 0.45;
  let dryness = clamp(1.0 - humidityNoise + slope * 0.18, 0.0, 1.0);
  let fertileMask = smoothstep(0.08, 0.5, heightBlend) * (1.0 - smoothstep(0.5, 0.9, slope)) * (1.0 - coldMask);
  let desertMask = smoothstep(0.58, 0.84, dryness) * smoothstep(0.06, 0.42, heightBlend) * (1.0 - coldMask * 0.85);
  let forestMask = smoothstep(0.48, 0.82, humidityNoise) * fertileMask;
  let rockMask = smoothstep(0.22, 0.82, slope + heightBlend * 0.42) * (1.0 - forestMask * 0.5);
  let snowMask = max(
    smoothstep(0.64, 1.0, coldMask + heightBlend * 0.32),
    smoothstep(0.68, 1.0, heightBlend + slope * 0.24)
  );

  let beach = vec3f(0.75, 0.69, 0.53);
  let desert = vec3f(0.72, 0.62, 0.38);
  let forest = vec3f(0.18, 0.34, 0.16);
  let meadow = vec3f(0.35, 0.47, 0.22);
  let rockWarm = vec3f(0.47, 0.38, 0.29);
  let rockCold = vec3f(0.35, 0.38, 0.41);
  let snow = vec3f(0.94, 0.96, 1.0);

  var albedo = mix(beach, meadow, smoothstep(0.03, 0.15, heightBlend));
  albedo = mix(albedo, desert, desertMask * (0.8 + terrainVariation * 0.2));
  albedo = mix(albedo, mix(meadow, forest, humidityNoise), forestMask);
  albedo = mix(albedo, mix(rockWarm, rockCold, coldMask * 0.75 + humidityNoise * 0.15), rockMask);
  albedo = mix(albedo, snow, snowMask);
  albedo *= 0.92 + terrainVariation * 0.14;

  let frameBasis = tangentFrame(baseNormal);
  let bumpSampleA = snoise(in.worldPos * 0.12 + vec3f(planetSeed * 0.41, planetSeed * 0.17, frame.time * 0.02));
  let bumpSampleB = snoise(in.worldPos.zxy * 0.24 + vec3f(19.0, -13.0, planetSeed * 0.67));
  let bumpSampleC = snoise(in.worldPos.yzx * 0.48 + vec3f(-7.0, 29.0, 41.0));
  let bumpVec = vec3f(
    bumpSampleA - bumpSampleB,
    bumpSampleC - bumpSampleA,
    1.0
  );
  let bumpStrength = mix(0.04, 0.18, clamp(rockMask + desertMask * 0.35, 0.0, 1.0));
  let normal = normalize(frameBasis * normalize(vec3f(bumpVec.xy * bumpStrength, bumpVec.z)));
  let diffuse = max(dot(normal, dirToSun), 0.0);

  let surfaceUp = in.sphereDir;
  let skyColor = vec3f(0.55, 0.70, 0.95);
  let groundColor = vec3f(0.25, 0.20, 0.15);
  let hemiFactor = dot(normal, surfaceUp) * 0.5 + 0.5;
  let ambientIndirect = mix(groundColor, skyColor, hemiFactor) * 0.35;
  let rimLight = pow(1.0 - max(dot(viewDir, normal), 0.0), 3.0) * 0.08;
  let backLight = pow(max(dot(-dirToSun, viewDir), 0.0), 3.0) * slope * 0.12;
  let sunLight = albedo * diffuse * 1.15;
  let albedoLighting = albedo * ambientIndirect + sunLight + vec3f(rimLight + backLight);
  let fog = atmosphericFog(in.worldPos, frame.cameraPos.xyz, frame.sunDir.xyz);
  let finalColor = mix(albedoLighting, fog.rgb, fog.a);
  return vec4f(finalColor, 1.0);
}
