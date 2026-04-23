// =============================================================================
// planet.wgsl — Render Shader: planet surface from compute-generated buffers
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
  @location(1) normal: vec3f,
  @location(2) uv: vec2f,
  @location(3) height: f32,
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
  let worldPos = terrainPositions[vertexIndex].xyz;
  let normal = normalize(terrainNormals[vertexIndex].xyz);

  var out: VertexOut;
  out.worldPos = worldPos;
  out.normal = normal;
  out.uv = sphereToUV(worldPos);
  out.height = terrainHeights[vertexIndex];
  out.clipPosition = frame.viewProjection * vec4f(worldPos, 1.0);
  return out;
}

@fragment
fn fs_main(in: VertexOut) -> @location(0) vec4f {
  let dirToSun = normalize(frame.sunDir.xyz);
  let diffuse = max(dot(normalize(in.normal), dirToSun), 0.0);
  let ambient = 0.18;
  let heightBlend = clamp(in.height / max(terrain.baseAmp * 1.6, 0.001), 0.0, 1.0);
  let latitudeMask = smoothstep(0.55, 1.0, abs(in.uv.y * 2.0 - 1.0));

  let shore = vec3f(0.28, 0.35, 0.24);
  let grass = vec3f(0.18, 0.33, 0.19);
  let rock = vec3f(0.42, 0.38, 0.34);
  let snow = vec3f(0.92, 0.95, 0.98);

  var albedo = mix(shore, grass, smoothstep(0.05, 0.25, heightBlend));
  albedo = mix(albedo, rock, smoothstep(0.28, 0.65, heightBlend));
  albedo = mix(albedo, snow, max(smoothstep(0.6, 1.0, heightBlend), latitudeMask * 0.35));

  let lighting = ambient + diffuse * 0.82;
  return vec4f(albedo * lighting, 1.0);
}
