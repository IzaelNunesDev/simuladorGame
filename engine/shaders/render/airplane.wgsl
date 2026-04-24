// =============================================================================
// airplane.wgsl — Render Shader: procedural aircraft mesh driven by player state
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

struct AirplaneUniforms {
  model: mat4x4<f32>,
  color: vec4f,
};

struct VertexOut {
  @builtin(position) clipPosition: vec4f,
  @location(0) worldPos: vec3f,
  @location(1) normal: vec3f,
};

@group(0) @binding(0) var<uniform> frame: FrameUniforms;
@group(1) @binding(0) var<uniform> airplane: AirplaneUniforms;

const AIRPLANE_POSITIONS = array<vec3f, 51>(
  vec3f(0.0, 0.0, 2.8), vec3f(-0.28, 0.22, 1.4), vec3f(0.28, 0.22, 1.4),
  vec3f(0.0, 0.0, 2.8), vec3f(0.28, -0.22, 1.4), vec3f(-0.28, -0.22, 1.4),
  vec3f(-0.28, 0.22, 1.4), vec3f(-0.28, -0.22, 1.4), vec3f(0.28, -0.22, 1.4),
  vec3f(-0.28, 0.22, 1.4), vec3f(0.28, -0.22, 1.4), vec3f(0.28, 0.22, 1.4),

  vec3f(-0.28, 0.22, 1.4), vec3f(-0.18, 0.16, -2.2), vec3f(0.18, 0.16, -2.2),
  vec3f(-0.28, -0.22, 1.4), vec3f(0.18, -0.16, -2.2), vec3f(-0.18, -0.16, -2.2),
  vec3f(-0.28, 0.22, 1.4), vec3f(0.18, 0.16, -2.2), vec3f(0.28, 0.22, 1.4),
  vec3f(-0.28, -0.22, 1.4), vec3f(0.28, -0.22, 1.4), vec3f(0.18, -0.16, -2.2),

  vec3f(-2.8, 0.0, 0.3), vec3f(-0.16, 0.03, 0.45), vec3f(-0.16, 0.0, -0.4),
  vec3f(0.16, 0.03, 0.45), vec3f(2.8, 0.0, 0.3), vec3f(0.16, 0.0, -0.4),
  vec3f(-0.16, 0.03, 0.45), vec3f(0.16, 0.03, 0.45), vec3f(0.16, 0.0, -0.4),
  vec3f(-0.16, 0.03, 0.45), vec3f(0.16, 0.0, -0.4), vec3f(-0.16, 0.0, -0.4),

  vec3f(0.0, 0.85, -1.75), vec3f(-0.12, 0.18, -1.85), vec3f(0.12, 0.18, -1.85),
  vec3f(0.0, 0.85, -1.75), vec3f(0.12, 0.18, -1.85), vec3f(0.0, 0.22, -2.35),
  vec3f(0.0, 0.85, -1.75), vec3f(0.0, 0.22, -2.35), vec3f(-0.12, 0.18, -1.85),

  vec3f(-0.72, 0.0, -1.55), vec3f(0.0, 0.04, -1.25), vec3f(0.72, 0.0, -1.55),
  vec3f(-0.46, 0.0, -2.05), vec3f(0.0, 0.03, -1.85), vec3f(0.46, 0.0, -2.05),
);

fn localNormal(index: u32) -> vec3f {
  let tri = index / 3u;
  switch (tri) {
    case 0u, 1u: { return vec3f(0.0, 0.45, 1.0); }
    case 2u, 3u: { return vec3f(0.0, 0.0, -1.0); }
    case 4u: { return vec3f(0.0, 1.0, 0.0); }
    case 5u: { return vec3f(0.0, -1.0, 0.0); }
    case 6u: { return vec3f(-0.1, 0.25, 1.0); }
    case 7u: { return vec3f(0.1, -0.25, 1.0); }
    case 8u, 9u: { return vec3f(0.0, 1.0, 0.02); }
    case 10u, 11u: { return vec3f(0.0, 1.0, -0.2); }
    case 12u, 13u, 14u: { return vec3f(0.0, 1.0, -0.25); }
    default: { return vec3f(0.0, 1.0, -0.1); }
  }
}

@vertex
fn vs_main(@builtin(vertex_index) vertexIndex: u32) -> VertexOut {
  let localPos = AIRPLANE_POSITIONS[vertexIndex];
  let worldPos4 = airplane.model * vec4f(localPos, 1.0);
  let worldNormal = normalize((airplane.model * vec4f(localNormal(vertexIndex), 0.0)).xyz);

  var out: VertexOut;
  out.worldPos = worldPos4.xyz;
  out.normal = worldNormal;
  out.clipPosition = frame.viewProjection * worldPos4;
  return out;
}

@fragment
fn fs_main(in: VertexOut) -> @location(0) vec4f {
  let sun = normalize(frame.sunDir.xyz);
  let normal = normalize(in.normal);
  let viewDir = normalize(frame.cameraPos.xyz - in.worldPos);
  let diffuse = max(dot(normal, sun), 0.0);
  let rim = pow(1.0 - max(dot(viewDir, normal), 0.0), 4.0);
  let spec = pow(max(dot(reflect(-sun, normal), viewDir), 0.0), 24.0);
  let bodyColor = airplane.color.xyz;
  let stripeMask = smoothstep(0.1, 0.24, abs(in.worldPos.y - airplane.model[3].y));
  let accentColor = mix(bodyColor, vec3f(0.18, 0.12, 0.08), stripeMask * 0.35);
  let lit = accentColor * (0.3 + diffuse * 0.95) + vec3f(1.0, 0.94, 0.86) * spec * 0.7 + rim * 0.16;
  return vec4f(lit, 1.0);
}
