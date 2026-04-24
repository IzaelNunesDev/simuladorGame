// =============================================================================
// atmosphere.wgsl — Render Shader: lightweight atmospheric shell
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
};

@group(0) @binding(0) var<uniform> frame: FrameUniforms;
@group(1) @binding(0) var<uniform> terrain: TerrainParams;
@group(1) @binding(1) var<storage, read> terrainPositions: array<vec4f>;
@group(1) @binding(2) var<storage, read> terrainNormals: array<vec4f>;
@group(1) @binding(3) var<storage, read> terrainHeights: array<f32>;

@vertex
fn vs_main(@builtin(vertex_index) vertexIndex: u32) -> VertexOut {
  let sphereDir = normalize(terrainPositions[vertexIndex].xyz);
  let terrainNormal = normalize(terrainNormals[vertexIndex].xyz);
  let terrainHeight = terrainHeights[vertexIndex];
  let atmosphereOffset =
    frame.atmosphereHeight +
    terrainHeight * 0.04 +
    max(dot(terrainNormal, sphereDir), 0.0) * 1.5;
  let worldPos = sphereDir * (terrain.worldRadius + atmosphereOffset);

  var out: VertexOut;
  out.worldPos = worldPos;
  out.sphereDir = sphereDir;
  out.clipPosition = frame.viewProjection * vec4f(worldPos, 1.0);
  return out;
}

@fragment
fn fs_main(in: VertexOut) -> @location(0) vec4f {
  let dirToSun = normalize(frame.sunDir.xyz);
  let viewDir = normalize(in.worldPos - frame.cameraPos.xyz);
  let surfaceUp = normalize(frame.cameraPos.xyz);
  let upness = max(dot(-viewDir, surfaceUp), 0.0);

  let zenithCol = vec3f(0.08, 0.22, 0.55);
  let middleCol = vec3f(0.35, 0.58, 0.88);
  let horizonCol = vec3f(0.82, 0.72, 0.58);

  let lowSky = mix(horizonCol, middleCol, smoothstep(0.0, 0.3, upness));
  let sky = mix(lowSky, zenithCol, smoothstep(0.3, 0.9, upness));

  let sunDot = max(dot(viewDir, dirToSun), 0.0);
  let sunsetWarm = vec3f(0.98, 0.52, 0.22);
  let finalSky = mix(sky, sunsetWarm, pow(sunDot, 8.0) * 0.5);

  let horizon = pow(1.0 - max(dot(in.sphereDir, -viewDir), 0.0), 2.6);
  return vec4f(finalSky, horizon * 0.6);
}
