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

struct ProjectileData {
  position: vec4f,
  velocity: vec4f,
};

@group(0) @binding(0) var<uniform> frame: FrameUniforms;
@group(1) @binding(0) var<storage, read> projectiles: array<ProjectileData>;

struct VertexOut {
  @builtin(position) clipPosition: vec4f,
  @location(0) color: vec3f,
};

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
  let p = projectiles[instanceIndex];
  let quad = BILLBOARD[vertexIndex];
  
  // Stretch the billboard in the direction of velocity
  let v = normalize(p.velocity.xyz);
  let right = normalize(cross(v, vec3f(0.0, 1.0, 0.0)));
  let up = cross(right, v);
  
  let size = 0.4;
  let length = 4.0;
  
  let worldPos = p.position.xyz + 
                 right * quad.x * size + 
                 v * quad.y * length;

  var out: VertexOut;
  out.clipPosition = frame.viewProjection * vec4f(worldPos, 1.0);
  out.color = vec3f(1.0, 0.8, 0.2); // Glowing orange
  return out;
}

@fragment
fn fs_main(in: VertexOut) -> @location(0) vec4f {
  return vec4f(in.color, 1.0);
}
