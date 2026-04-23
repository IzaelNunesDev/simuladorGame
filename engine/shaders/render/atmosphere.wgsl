// =============================================================================
// atmosphere.wgsl — Render Shader: lightweight atmospheric shell
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
  let worldPos = sphereDir * (terrain.worldRadius + 34.0);

  var out: VertexOut;
  out.worldPos = worldPos;
  out.sphereDir = sphereDir;
  out.clipPosition = frame.viewProjection * vec4f(worldPos, 1.0);
  return out;
}

@fragment
fn fs_main(in: VertexOut) -> @location(0) vec4f {
  let dirToSun = normalize(frame.sunDir.xyz);
  let viewDir = normalize(frame.cameraPos.xyz - in.worldPos);
  let horizon = pow(1.0 - max(dot(in.sphereDir, viewDir), 0.0), 2.6);
  let forwardScatter = pow(max(dot(viewDir, dirToSun), 0.0), 6.0);
  let base = vec3f(0.22, 0.42, 0.86);
  let sunset = vec3f(0.98, 0.48, 0.22);
  let sky = mix(base, sunset, forwardScatter * 0.6);
  let alpha = horizon * 0.35;
  return vec4f(sky * horizon, alpha);
}
