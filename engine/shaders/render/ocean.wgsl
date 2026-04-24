// =============================================================================
// ocean.wgsl — Render Shader: animated ocean shell + solar specular highlight
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
  @location(1) sphereDir: vec3f,
  @location(2) uv: vec2f,
  @location(3) terrainHeight: f32,
};

@group(0) @binding(0) var<uniform> frame: FrameUniforms;
@group(1) @binding(0) var<uniform> terrain: TerrainParams;
@group(1) @binding(1) var<storage, read> terrainPositions: array<vec4f>;
@group(1) @binding(3) var<storage, read> terrainHeights: array<f32>;

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

fn fractalNoise(pos: vec3f) -> f32 {
  var noise = 0.0;
  var amplitude = 1.0;
  var frequency = terrain.baseFreq;
  var amplitudeSum = 0.0;

  for (var i = 0u; i < terrain.octaves; i++) {
    noise += snoise(pos * frequency + vec3f(terrain.seed)) * amplitude;
    amplitudeSum += amplitude;
    amplitude *= terrain.persistence;
    frequency *= terrain.lacunarity;
  }

  return noise / max(amplitudeSum, 0.0001);
}

fn ridgedNoise(pos: vec3f) -> f32 {
  var value = 0.0;
  var amplitude = 1.0;
  var frequency = terrain.baseFreq * 1.35;
  var amplitudeSum = 0.0;

  for (var i = 0u; i < terrain.octaves; i++) {
    let sampleValue = 1.0 - abs(snoise(pos * frequency + vec3f(terrain.seed * 1.91)));
    value += sampleValue * sampleValue * amplitude;
    amplitudeSum += amplitude;
    amplitude *= terrain.persistence;
    frequency *= terrain.lacunarity;
  }

  return value / max(amplitudeSum, 0.0001);
}

fn terrainHeightAt(sphereDir: vec3f) -> f32 {
  let warp = vec3f(
    snoise(sphereDir * terrain.baseFreq * 0.22 + vec3f(terrain.seed, 0.0, 0.0)),
    snoise(sphereDir.zxy * terrain.baseFreq * 0.24 + vec3f(0.0, terrain.seed * 1.3, 0.0)),
    snoise(sphereDir.yzx * terrain.baseFreq * 0.2 + vec3f(0.0, 0.0, terrain.seed * 1.7))
  );
  let warped = normalize(sphereDir + warp * 0.22);
  let continents = smoothstep(0.48, 0.86, fractalNoise(warped * 0.42) * 0.5 + 0.5);
  let hills = fractalNoise(warped * 1.35) * 0.5 + 0.5;
  let mountains = ridgedNoise(warped * 2.4);
  let details = fractalNoise(warped * 5.25) * 0.5 + 0.5;
  let macroHeight = mix(hills * 0.18, hills * 0.38 + mountains * 0.92, continents);
  let detailHeight = details * 0.09 + mountains * continents * 0.28;
  let combined = (macroHeight + detailHeight) * continents;
  return max(combined * terrain.baseAmp, 0.0);
}

fn sphereToUV(p: vec3f) -> vec2f {
  let n = normalize(p);
  let longitude = atan2(n.x, -n.z);
  let latitude = asin(clamp(n.y, -1.0, 1.0));
  let u = (longitude / 3.14159265359 + 1.0) * 0.5;
  let v = latitude / 3.14159265359 + 0.5;
  return vec2f(u, v);
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
  let sphereDir = normalize(terrainPositions[vertexIndex].xyz);
  let terrainHeight = terrainHeights[vertexIndex];
  let worldPos = sphereDir * (terrain.worldRadius + frame.seaLevel);

  var out: VertexOut;
  out.worldPos = worldPos;
  out.sphereDir = sphereDir;
  out.uv = sphereToUV(sphereDir);
  out.terrainHeight = terrainHeight;
  out.clipPosition = frame.viewProjection * vec4f(worldPos, 1.0);
  return out;
}

@fragment
fn fs_main(in: VertexOut) -> @location(0) vec4f {
  let approxWaterDepth = frame.seaLevel - in.terrainHeight;
  let sampledTerrainHeight = select(in.terrainHeight, terrainHeightAt(in.sphereDir), abs(approxWaterDepth) < 6.0);
  let waterDepth = frame.seaLevel - sampledTerrainHeight;
  if (waterDepth <= 0.0) {
    discard;
  }

  let dirToSun = normalize(frame.sunDir.xyz);
  let viewDir = normalize(frame.cameraPos.xyz - in.worldPos);
  let basis = tangentFrame(in.sphereDir);
  let n1 = vec2f(
    snoise(in.worldPos * 0.015 + vec3f(frame.time * 0.3, 0.0, 0.0)),
    snoise(in.worldPos.zxy * 0.015 + vec3f(0.0, frame.time * 0.25, 0.0))
  );
  let n2 = vec2f(
    snoise(in.worldPos * 0.18 + vec3f(frame.time * 1.1, 0.0, 0.0)),
    snoise(in.worldPos.zxy * 0.18 + vec3f(0.0, frame.time * 0.95, 0.0))
  );
  let bump = n1 * 0.6 + n2 * 0.25;
  let normal = normalize(basis * normalize(vec3f(bump * 0.25, 1.0)));

  let fresnel = pow(1.0 - max(dot(viewDir, normal), 0.0), 3.5);
  let reflDir = reflect(-viewDir, normal);
  let skyUp = max(dot(reflDir, in.sphereDir), 0.0);
  let skyRefl = mix(
    vec3f(0.35, 0.52, 0.78),
    vec3f(0.08, 0.22, 0.52),
    pow(skyUp, 0.6)
  );
  let halfVector = normalize(dirToSun + viewDir);
  let specBase = pow(max(dot(normal, halfVector), 0.0), 24.0);
  let glitterNoise = snoise(in.worldPos * 2.5 + vec3f(frame.time * 3.0, 0.0, 0.0));
  let glitter = pow(max(glitterNoise, 0.0), 6.0) * specBase * 4.0;

  let diffuse = max(dot(normal, dirToSun), 0.0);
  let deepWaterColor = vec3f(0.03, 0.11, 0.22);
  let shallowWaterColor = vec3f(0.08, 0.36, 0.58);
  let depthFactor = clamp(waterDepth / 60.0, 0.0, 1.0);
  let caustic = sin(in.worldPos.x * 0.3 + frame.time) * sin(in.worldPos.z * 0.3 + frame.time * 1.3);
  let shallowTinted = shallowWaterColor + vec3f(0.15, 0.18, 0.12) * max(caustic, 0.0) * (1.0 - depthFactor);
  let waterBase = mix(shallowTinted, deepWaterColor, depthFactor);
  let waterLit = waterBase * (0.35 + diffuse * 0.5);
  let waterCol = mix(waterLit, skyRefl, fresnel * 0.85);
  let highlight = vec3f(1.0, 0.97, 0.86) * (specBase * 0.6 + glitter);
  let foam = step(waterDepth, 1.2 + sin(frame.time * 2.0 - in.uv.x * 50.0) * 0.5);
  let shoreFoam = (1.0 - smoothstep(0.0, 4.0, waterDepth)) * 0.8;
  let foamColor = vec3f(1.0) * max(foam, shoreFoam);
  let planeOnSea = normalize(frame.playerPos.xyz) * (terrain.worldRadius + frame.seaLevel);
  let shadowDist = length(in.worldPos - planeOnSea);
  let planeShadow = 1.0 - (1.0 - smoothstep(0.0, 40.0, shadowDist)) * 0.4;
  let albedoLighting = (waterCol + highlight + foamColor) * planeShadow;
  let fog = atmosphericFog(in.worldPos, frame.cameraPos.xyz, frame.sunDir.xyz);
  let finalColor = mix(albedoLighting, fog.rgb, fog.a);

  return vec4f(finalColor, mix(0.42, 0.72, depthFactor));
}
