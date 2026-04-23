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
  @location(1) sphereDir: vec3f,
  @location(2) uv: vec2f,
  @location(3) terrainHeight: f32,
};

@group(0) @binding(0) var<uniform> frame: FrameUniforms;
@group(1) @binding(0) var<uniform> terrain: TerrainParams;
@group(1) @binding(1) var<storage, read> terrainPositions: array<vec4f>;
@group(1) @binding(3) var<storage, read> terrainHeights: array<f32>;

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

fn gerstnerWave(localPos: vec2f, dir: vec2f, steepness: f32, wavelength: f32, speed: f32, amplitude: f32, time: f32) -> vec3f {
  let k = 6.28318530718 / wavelength;
  let c = speed;
  let d = normalize(dir);
  let phase = k * dot(d, localPos) + c * time;
  let cosP = cos(phase);
  let sinP = sin(phase);
  let q = steepness / max(k * amplitude * 3.0, 0.001);
  return vec3f(
    d.x * (q * amplitude * cosP),
    amplitude * sinP,
    d.y * (q * amplitude * cosP)
  );
}

@vertex
fn vs_main(@builtin(vertex_index) vertexIndex: u32) -> VertexOut {
  let sphereDir = normalize(terrainPositions[vertexIndex].xyz);
  let terrainHeight = terrainHeights[vertexIndex];
  let uv = sphereToUV(sphereDir);
  let basis = tangentFrame(sphereDir);
  let localPos = vec2f(
    (uv.x - 0.5) * 6.28318530718 * terrain.worldRadius,
    (uv.y - 0.5) * 3.14159265359 * terrain.worldRadius
  );
  let shorelineDamp = 1.0 - smoothstep(frame.seaLevel - 1.0, frame.seaLevel + 10.0, terrainHeight);
  let swellA = gerstnerWave(localPos, vec2f(0.92, 0.38), 0.85, 280.0, 0.65, 9.0, frame.time);
  let swellB = gerstnerWave(localPos, vec2f(-0.44, 0.9), 0.72, 170.0, 0.92, 5.5, frame.time * 1.17);
  let chop = gerstnerWave(localPos, vec2f(0.21, -0.97), 0.58, 85.0, 1.45, 2.2, frame.time * 1.35);
  let wave = (swellA + swellB + chop) * shorelineDamp;
  let basePos = sphereDir * (terrain.worldRadius + frame.seaLevel);
  let worldPos = basePos
    + basis[0] * wave.x
    + basis[1] * wave.z
    + sphereDir * wave.y;

  var out: VertexOut;
  out.worldPos = worldPos;
  out.sphereDir = sphereDir;
  out.uv = uv;
  out.terrainHeight = terrainHeight;
  out.clipPosition = frame.viewProjection * vec4f(worldPos, 1.0);
  return out;
}

@fragment
fn fs_main(in: VertexOut) -> @location(0) vec4f {
  let waterDepth = frame.seaLevel - in.terrainHeight;
  if (waterDepth <= 0.0) {
    discard;
  }

  let dirToSun = normalize(frame.sunDir.xyz);
  let viewDir = normalize(frame.cameraPos.xyz - in.worldPos);
  let dx = dpdx(in.worldPos);
  let dy = dpdy(in.worldPos);
  var normal = normalize(cross(dx, dy));
  if (dot(normal, in.sphereDir) < 0.0) {
    normal = -normal;
  }

  let fresnel = pow(1.0 - max(dot(viewDir, normal), 0.0), 3.5);
  let halfVector = normalize(dirToSun + viewDir);
  let specularHighlight = pow(max(dot(normal, halfVector), 0.0), 96.0) * (0.3 + fresnel * 0.7);

  let diffuse = max(dot(normal, dirToSun), 0.0);
  let deepWaterColor = vec3f(0.03, 0.11, 0.22);
  let shallowWaterColor = vec3f(0.08, 0.36, 0.58);
  let depthFactor = clamp(waterDepth / 15.0, 0.0, 1.0);
  let waterBase = mix(shallowWaterColor, deepWaterColor, depthFactor);
  let waterCol = waterBase * (0.45 + diffuse * 0.4 + fresnel * 0.25);
  let highlight = vec3f(1.0, 0.95, 0.82) * specularHighlight;
  let foam = step(waterDepth, 1.2 + sin(frame.time * 2.0 - in.uv.x * 50.0) * 0.5);
  let foamColor = foam * vec3f(1.0);
  let albedoLighting = waterCol + highlight + foamColor;
  let dist = length(frame.cameraPos.xyz - in.worldPos);
  let fogFactor = 1.0 - exp(-dist * 0.0015);
  let finalColor = mix(albedoLighting, vec3f(0.22, 0.42, 0.86), fogFactor);

  return vec4f(finalColor, mix(0.42, 0.72, depthFactor));
}
