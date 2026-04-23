// =============================================================================
// terrain_gen.wgsl — Compute Shader: Simplex Noise + Fractal Terrain + Normals
// Generates height data and normal vectors for a spherified cube planet.
// =============================================================================

// --- Uniforms ---
struct TerrainParams {
  resolution  : u32,      // vertices per face edge
  worldRadius : f32,      // planet base radius
  octaves     : u32,      // fractal noise layers
  persistence : f32,      // amplitude decay per octave
  lacunarity  : f32,      // frequency growth per octave
  baseFreq    : f32,      // starting frequency
  baseAmp     : f32,      // starting amplitude
  seed        : f32,      // noise seed offset
};

@group(0) @binding(0) var<uniform> params : TerrainParams;

// Output buffers: position (vec4 for alignment), normal (vec4)
@group(0) @binding(1) var<storage, read_write> outPositions : array<vec4f>;
@group(0) @binding(2) var<storage, read_write> outNormals   : array<vec4f>;
@group(0) @binding(3) var<storage, read_write> outHeights   : array<f32>;

// =============================================================================
// Simplex Noise 3D — Translated from Ashima Arts / Stefan Gustavson
// =============================================================================
fn mod289_3(x: vec3f) -> vec3f { return x - floor(x * (1.0/289.0)) * 289.0; }
fn mod289_4(x: vec4f) -> vec4f { return x - floor(x * (1.0/289.0)) * 289.0; }
fn permute(x: vec4f) -> vec4f { return mod289_4(((x * 34.0) + 10.0) * x); }

fn taylorInvSqrt(r: vec4f) -> vec4f {
  return vec4f(1.79284291400159) - vec4f(0.85373472095314) * r;
}

fn snoise(v: vec3f) -> f32 {
  let C = vec2f(1.0/6.0, 1.0/3.0);
  let D = vec4f(0.0, 0.5, 1.0, 2.0);

  // First corner
  var i = floor(v + dot(v, vec3f(C.y)));
  let x0 = v - i + dot(i, vec3f(C.x));

  // Other corners
  let g = step(x0.yzx, x0.xyz);
  let l = 1.0 - g;
  let i1 = min(g.xyz, l.zxy);
  let i2 = max(g.xyz, l.zxy);

  let x1 = x0 - i1 + vec3f(C.x);
  let x2 = x0 - i2 + vec3f(C.y);
  let x3 = x0 - vec3f(D.y);

  // Permutations
  i = mod289_3(i);
  let p = permute(permute(permute(
    i.z + vec4f(0.0, i1.z, i2.z, 1.0))
  + i.y + vec4f(0.0, i1.y, i2.y, 1.0))
  + i.x + vec4f(0.0, i1.x, i2.x, 1.0));

  // Gradients: 7x7 points over a square, mapped onto an octahedron
  let n_ = 0.142857142857; // 1.0/7.0
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

  // Normalise gradients
  let norm = taylorInvSqrt(vec4f(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;

  // Mix final noise value
  var m = max(vec4f(0.5) - vec4f(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), vec4f(0.0));
  m = m * m;
  return 105.0 * dot(m*m, vec4f(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}

// =============================================================================
// Fractal Noise — Sum of octaves of Simplex Noise
// =============================================================================
fn fractalNoise(pos: vec3f) -> f32 {
  var noise = 0.0;
  var amplitude = 1.0;
  var frequency = params.baseFreq;
  var amplitudeSum = 0.0;

  for (var i = 0u; i < params.octaves; i++) {
    noise += snoise(pos * frequency + vec3f(params.seed)) * amplitude;
    amplitudeSum += amplitude;
    amplitude *= params.persistence;
    frequency *= params.lacunarity;
  }
  return noise / max(amplitudeSum, 0.0001);
}

fn ridgedNoise(pos: vec3f) -> f32 {
  var value = 0.0;
  var amplitude = 1.0;
  var frequency = params.baseFreq * 1.35;
  var amplitudeSum = 0.0;

  for (var i = 0u; i < params.octaves; i++) {
    let sampleValue = 1.0 - abs(snoise(pos * frequency + vec3f(params.seed * 1.91)));
    value += sampleValue * sampleValue * amplitude;
    amplitudeSum += amplitude;
    amplitude *= params.persistence;
    frequency *= params.lacunarity;
  }
  return value / max(amplitudeSum, 0.0001);
}

fn terrainHeight(pos: vec3f) -> f32 {
  let warp = vec3f(
    snoise(pos * params.baseFreq * 0.22 + vec3f(params.seed, 0.0, 0.0)),
    snoise(pos.zxy * params.baseFreq * 0.24 + vec3f(0.0, params.seed * 1.3, 0.0)),
    snoise(pos.yzx * params.baseFreq * 0.2 + vec3f(0.0, 0.0, params.seed * 1.7))
  );
  let warped = normalize(pos + warp * 0.22);

  let continents = smoothstep(0.48, 0.86, fractalNoise(warped * 0.42) * 0.5 + 0.5);
  let hills = fractalNoise(warped * 1.35) * 0.5 + 0.5;
  let mountains = ridgedNoise(warped * 2.4);
  let details = fractalNoise(warped * 5.25) * 0.5 + 0.5;

  let macroHeight = mix(hills * 0.18, hills * 0.38 + mountains * 0.92, continents);
  let detailHeight = details * 0.09 + mountains * continents * 0.28;
  let combined = (macroHeight + detailHeight) * continents;
  return max(combined * params.baseAmp, 0.0);
}

// =============================================================================
// Spherified Cube: maps a cube face point to a sphere surface
// =============================================================================
fn cubeToSphere(p: vec3f) -> vec3f {
  let x2 = p.x * p.x;
  let y2 = p.y * p.y;
  let z2 = p.z * p.z;
  return vec3f(
    p.x * sqrt(1.0 - y2 * 0.5 - z2 * 0.5 + y2 * z2 / 3.0),
    p.y * sqrt(1.0 - z2 * 0.5 - x2 * 0.5 + z2 * x2 / 3.0),
    p.z * sqrt(1.0 - x2 * 0.5 - y2 * 0.5 + x2 * y2 / 3.0)
  );
}

// =============================================================================
// Sphere to UV mapping (longitude/latitude)
// =============================================================================
fn sphereToUV(p: vec3f) -> vec2f {
  let n = normalize(p);
  let longitude = atan2(n.x, -n.z);      // atan2(x, -z)
  let latitude  = asin(clamp(n.y, -1.0, 1.0));
  let u = (longitude / 3.14159265 + 1.0) * 0.5;
  let v = latitude / 3.14159265 + 0.5;
  return vec2f(u, v);
}

// =============================================================================
// Get displaced position on sphere with terrain height
// =============================================================================
fn getDisplacedPos(sphereDir: vec3f) -> vec3f {
  let height = terrainHeight(sphereDir);
  return sphereDir * (params.worldRadius + height);
}

// =============================================================================
// Main compute: generates positions, normals, and heights
// Each thread = one vertex; face is dispatched separately.
// Global ID layout: x = column, y = row, z = face index (0..5)
// =============================================================================
@compute @workgroup_size(8, 8, 1)
fn main(@builtin(global_invocation_id) gid: vec3u) {
  let res = params.resolution;
  if (gid.x >= res || gid.y >= res) { return; }

  let face = gid.z;
  let idx = face * res * res + gid.y * res + gid.x;

  // Map [0, res-1] to [-1, 1]
  let u = f32(gid.x) / f32(res - 1u) * 2.0 - 1.0;
  let v = f32(gid.y) / f32(res - 1u) * 2.0 - 1.0;

  // Build cube face point based on face index
  var cubePoint: vec3f;
  switch (face) {
    case 0u: { cubePoint = vec3f( 1.0,   v,   -u); } // +X
    case 1u: { cubePoint = vec3f(-1.0,   v,    u); } // -X
    case 2u: { cubePoint = vec3f(   u, 1.0,   -v); } // +Y
    case 3u: { cubePoint = vec3f(   u,-1.0,    v); } // -Y
    case 4u: { cubePoint = vec3f(   u,   v,  1.0); } // +Z
    default: { cubePoint = vec3f(  -u,   v, -1.0); } // -Z
  }

  let sphereDir = normalize(cubeToSphere(cubePoint));
  let height = terrainHeight(sphereDir);
  let worldPos = sphereDir * (params.worldRadius + height);

  // --- Normal Calculation via Neighboring Samples (Sobel/Cross Product) ---
  let eps = 0.001; // angular offset for sampling neighbors

  // Build a tangent frame on the sphere
  var tangentU: vec3f;
  if (abs(sphereDir.y) < 0.999) {
    tangentU = normalize(cross(vec3f(0.0, 1.0, 0.0), sphereDir));
  } else {
    tangentU = normalize(cross(vec3f(1.0, 0.0, 0.0), sphereDir));
  }
  let tangentV = normalize(cross(sphereDir, tangentU));

  // Sample 4 neighbors
  let dirN = normalize(sphereDir + tangentV * eps);
  let dirS = normalize(sphereDir - tangentV * eps);
  let dirE = normalize(sphereDir + tangentU * eps);
  let dirW = normalize(sphereDir - tangentU * eps);

  let posN = getDisplacedPos(dirN);
  let posS = getDisplacedPos(dirS);
  let posE = getDisplacedPos(dirE);
  let posW = getDisplacedPos(dirW);

  // Normal from cross product of neighbor differences
  let dirNorth = normalize(posN - posS);
  let dirEast  = normalize(posE - posW);
  let normalVec = normalize(cross(dirNorth, dirEast));

  // Write outputs
  outPositions[idx] = vec4f(worldPos, 1.0);
  outNormals[idx]   = vec4f(normalVec, 0.0);
  outHeights[idx]   = height;
}
