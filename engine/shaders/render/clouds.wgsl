// =============================================================================
// clouds.wgsl — Render Shader: instanced billboards with volumetric shading
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

struct CloudParams {
  playerPos: vec4f,
  playerDir: vec4f,
  collisionRadius: f32,
  playerSpeed: f32,
  relaxToHome: f32,
  deltaTime: f32,
  particleCount: f32,
  billboardSize: f32,
  cloudStrength: f32,
  drag: f32,
  pad0: f32,
  pad1: f32,
  pad2: f32,
  pad3: f32,
};

struct Particle {
  position: vec4f,
  previousPosition: vec4f,
  homePosition: vec4f,
  packedData: vec4f,
};

struct VertexOut {
  @builtin(position) clipPosition: vec4f,
  @location(0) center: vec3f,
  @location(1) worldPos: vec3f,
  @location(2) localPos: vec2f,
};

@group(0) @binding(0) var<uniform> frame: FrameUniforms;
@group(1) @binding(0) var<uniform> cloudParams: CloudParams;
@group(1) @binding(1) var<storage, read> particles: array<Particle>;

const BILLBOARD: array<vec2f, 6> = array<vec2f, 6>(
  vec2f(-1.0, -1.0),
  vec2f( 1.0, -1.0),
  vec2f( 1.0,  1.0),
  vec2f(-1.0, -1.0),
  vec2f( 1.0,  1.0),
  vec2f(-1.0,  1.0),
);

@vertex
fn vs_main(
  @builtin(vertex_index) vertexIndex: u32,
  @builtin(instance_index) instanceIndex: u32,
) -> VertexOut {
  let particle = particles[instanceIndex];
  let quad = BILLBOARD[vertexIndex];
  let worldPos =
    particle.position.xyz +
    frame.cameraRight.xyz * quad.x * cloudParams.billboardSize +
    frame.cameraUp.xyz * quad.y * cloudParams.billboardSize;

  var out: VertexOut;
  out.center = particle.position.xyz;
  out.worldPos = worldPos;
  out.localPos = quad;
  out.clipPosition = frame.viewProjection * vec4f(worldPos, 1.0);
  return out;
}

@fragment
fn fs_main(in: VertexOut) -> @location(0) vec4f {
  let r2 = dot(in.localPos, in.localPos);
  if (r2 > 1.0) {
    discard;
  }

  let viewDir = normalize(frame.cameraPos.xyz - in.center);
  let z = sqrt(max(1.0 - r2, 0.0));
  let cloudNormal = normalize(
    frame.cameraRight.xyz * in.localPos.x +
    frame.cameraUp.xyz * in.localPos.y +
    viewDir * z
  );

  let shading = max(0.0, dot(cloudNormal, normalize(frame.sunDir.xyz)));
  let edge = smoothstep(1.0, 0.0, r2);
  let cloudStrength = edge * cloudParams.cloudStrength;
  let backgroundCol = vec3f(0.58, 0.68, 0.82);
  let cloudCol = mix(vec3f(0.48, 0.52, 0.58), vec3f(0.96, 0.97, 1.0), shading);
  let finalCol = mix(backgroundCol, cloudCol, cloudStrength);
  return vec4f(finalCol, cloudStrength * 0.58);
}
