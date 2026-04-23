// =============================================================================
// clouds_sim.wgsl — Compute Shader: Verlet integration + player collision
// =============================================================================

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

@group(0) @binding(0) var<uniform> params: CloudParams;
@group(0) @binding(1) var<storage, read_write> particles: array<Particle>;

fn lerp(a: f32, b: f32, t: f32) -> f32 {
  return a + (b - a) * t;
}

@compute @workgroup_size(64, 1, 1)
fn main(@builtin(global_invocation_id) gid: vec3u) {
  let index = gid.x;
  if (f32(index) >= params.particleCount) {
    return;
  }

  var particle = particles[index];
  let current = particle.position.xyz;
  let previous = particle.previousPosition.xyz;

  // Verlet integration baseline.
  var next = current + (current - previous) * params.drag;

  let offsetToPlayer = params.playerPos.xyz - current;
  let dstFromPlayer = length(offsetToPlayer);
  if (dstFromPlayer > 1e-5 && dstFromPlayer < params.collisionRadius) {
    let collisionDir = -(params.playerPos.xyz - current) / dstFromPlayer;
    let influence = clamp(dot(collisionDir, normalize(params.playerDir.xyz)), 0.0, 1.0);
    let particleVelocity = collisionDir * lerp(0.3, 1.0, influence) * params.playerSpeed;
    next += particleVelocity;
  }

  let toHome = particle.homePosition.xyz - next;
  next += toHome * (params.relaxToHome * max(params.deltaTime, 0.016));

  particle.previousPosition = vec4f(current, 1.0);
  particle.position = vec4f(next, 1.0);
  particles[index] = particle;
}
