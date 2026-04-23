// =============================================================================
// ocean.wgsl — Render Shader: animated ocean shell + solar specular highlight
// =============================================================================

struct FrameUniforms {
  viewProjection: mat4x4<f32>,
  cameraPos: vec4f,
  sunDir: vec4f,
  cameraRight: vec4f,
  cameraUp: vec4f,
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
  @location(3) terrainHeight: f32,
  @location(4) wave: f32,
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

@vertex
fn vs_main(@builtin(vertex_index) vertexIndex: u32) -> VertexOut {
  let sphereDir = normalize(terrainPositions[vertexIndex].xyz);
  let terrainNormal = normalize(terrainNormals[vertexIndex].xyz);
  let terrainHeight = terrainHeights[vertexIndex];
  let uv = sphereToUV(sphereDir);
  let waveA = sin(frame.time * 0.75 + uv.x * 48.0 + uv.y * 21.0);
  let waveB = sin(frame.time * 1.15 - uv.x * 31.0 + uv.y * 37.0);
  let wave = (waveA + waveB) * 0.45;
  let shorelineDamp = 1.0 - smoothstep(frame.seaLevel - 1.0, frame.seaLevel + 8.0, terrainHeight);
  let radius = terrain.worldRadius + frame.seaLevel + wave * shorelineDamp;
  let worldPos = sphereDir * radius;

  var out: VertexOut;
  out.worldPos = worldPos;
  out.normal = normalize(mix(sphereDir, terrainNormal, 0.08));
  out.uv = uv;
  out.terrainHeight = terrainHeight;
  out.wave = wave;
  out.clipPosition = frame.viewProjection * vec4f(worldPos, 1.0);
  return out;
}

@fragment
fn fs_main(in: VertexOut) -> @location(0) vec4f {
  let dirToSun = normalize(frame.sunDir.xyz);
  let viewDir = normalize(frame.cameraPos.xyz - in.worldPos);
  let normal = normalize(in.normal);

  let fresnel = pow(1.0 - max(dot(viewDir, normal), 0.0), 3.5);
  let specularAngle = acos(clamp(dot(normalize(dirToSun - viewDir), normal), -1.0, 1.0));
  let smoothness = 0.18;
  let specularExponent = specularAngle / smoothness;
  let specularHighlight = exp(-specularExponent * specularExponent);

  let diffuse = max(dot(normal, dirToSun), 0.0);
  let deep = vec3f(0.03, 0.11, 0.22);
  let shallow = vec3f(0.08, 0.36, 0.58);
  let waterCol = mix(deep, shallow, diffuse * 0.65 + fresnel * 0.35);
  let highlight = vec3f(1.0, 0.95, 0.82) * specularHighlight;
  let coastalDepth = max(frame.seaLevel - in.terrainHeight, 0.0);
  let foamWave = sin(in.uv.x * 96.0 + frame.time * 2.7 + in.wave * 1.4)
    + sin(in.uv.y * 78.0 - frame.time * 2.2)
    + sin((in.uv.x + in.uv.y) * 64.0 + frame.time * 1.8);
  let foamDistortion = foamWave * 0.22;
  let foamMask = 1.0 - smoothstep(0.15, 3.8, coastalDepth + foamDistortion);
  let foam = vec3f(1.0, 1.0, 1.0) * foamMask * (0.75 + diffuse * 0.25);

  return vec4f(waterCol + highlight + foam, 0.72);
}
