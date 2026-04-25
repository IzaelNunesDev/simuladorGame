// =============================================================================
// airplane.wgsl — Enhanced Render Shader
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
  extra: vec4f, // x: pitch, y: roll, z: yaw, w: speed
};

struct VertexIn {
  @location(0) position: vec3f,
  @location(1) normal: vec3f,
  @location(2) nodeIndex: f32,
};

struct VertexOut {
  @builtin(position) clipPosition: vec4f,
  @location(0) worldPos: vec3f,
  @location(1) normal: vec3f,
  @location(2) localPos: vec3f,
  @location(3) @interpolate(flat) nodeIndex: f32,
};

@group(0) @binding(0) var<uniform> frame: FrameUniforms;
@group(1) @binding(0) var<uniform> airplane: AirplaneUniforms;

@vertex
fn vs_main(in: VertexIn) -> VertexOut {
  var pos = in.position;
  var normal = in.normal;

  let pitch = airplane.extra.x;
  let roll = airplane.extra.y;
  let yaw = airplane.extra.z;
  let speed = airplane.extra.w;

  // 1. Animation for Propeller (Nodes 17, 18, 19)
  if (in.nodeIndex >= 16.5 && in.nodeIndex <= 19.5) {
    let center = vec3f(-0.35, 4.34, -5.75);
    let rotSpeed = 60.0 + speed * 0.1;
    let angle = frame.time * rotSpeed;
    pos = rotateX(pos, center, angle);
    normal = rotateX(normal, vec3f(0.0), angle);
  }

  // 2. Control Surfaces
  // Elevators (Nodes 21, 22, 23)
  if (in.nodeIndex >= 20.5 && in.nodeIndex <= 23.5) {
    let center = vec3f(0.0, 4.4, 7.6);
    let angle = pitch * 0.4; // Max 0.4 rad (~23 deg)
    pos = rotateX(pos, center, angle);
    normal = rotateX(normal, vec3f(0.0), angle);
  }

  // Ailerons (Nodes 30, 31)
  if (in.nodeIndex >= 29.5 && in.nodeIndex <= 30.5) { // Left
    let center = vec3f(9.4, 6.01, -1.9);
    let angle = roll * 0.4;
    pos = rotateX(pos, center, angle);
    normal = rotateX(normal, vec3f(0.0), angle);
  }
  if (in.nodeIndex >= 30.5 && in.nodeIndex <= 31.5) { // Right
    let center = vec3f(-9.4, 6.01, -1.9);
    let angle = -roll * 0.4;
    pos = rotateX(pos, center, angle);
    normal = rotateX(normal, vec3f(0.0), angle);
  }

  // Rudder (Nodes 25, 26)
  if (in.nodeIndex >= 24.5 && in.nodeIndex <= 26.5) {
    let center = vec3f(0.15, 5.338, 6.316);
    let angle = yaw * 0.5;
    pos = rotateY(pos, center, angle);
    normal = rotateY(normal, vec3f(0.0), angle);
  }

  // 3. Wheels (Nodes 9, 12, 15)
  if (in.nodeIndex == 9.0 || in.nodeIndex == 12.0 || in.nodeIndex == 15.0) {
    var center = vec3f(0.0, 0.45, -4.4); // Nose
    if (in.nodeIndex == 9.0) { center = vec3f(2.4, 0.45, -1.4); }
    if (in.nodeIndex == 12.0) { center = vec3f(-2.4, 0.45, -1.4); }
    
    let angle = frame.time * speed * 2.0;
    pos = rotateX(pos, center, angle);
    normal = rotateX(normal, vec3f(0.0), angle);
  }

  let worldPos4 = airplane.model * vec4f(pos, 1.0);
  let worldNormal = normalize((airplane.model * vec4f(normal, 0.0)).xyz);

  var out: VertexOut;
  out.worldPos = worldPos4.xyz;
  out.normal = worldNormal;
  out.localPos = pos;
  out.nodeIndex = in.nodeIndex;
  out.clipPosition = frame.viewProjection * worldPos4;
  return out;
}

fn rotateX(p: vec3f, center: vec3f, angle: f32) -> vec3f {
  let s = sin(angle);
  let c = cos(angle);
  let rel = p - center;
  return vec3f(
    rel.x,
    rel.y * c - rel.z * s,
    rel.y * s + rel.z * c
  ) + center;
}

fn rotateY(p: vec3f, center: vec3f, angle: f32) -> vec3f {
  let s = sin(angle);
  let c = cos(angle);
  let rel = p - center;
  return vec3f(
    rel.x * c + rel.z * s,
    rel.y,
    -rel.x * s + rel.z * c
  ) + center;
}

@fragment
fn fs_main(in: VertexOut) -> @location(0) vec4f {
  let sun = normalize(frame.sunDir.xyz);
  let normal = normalize(in.normal);
  let viewDir = normalize(frame.cameraPos.xyz - in.worldPos);
  
  // Material properties based on node index
  var baseColor = airplane.color.xyz;
  var metalness = 0.6;
  var roughness = 0.2;
  var emission = 0.0;

  // Fuselage details and differentiation
  if (in.nodeIndex >= 33.5 && in.nodeIndex <= 43.5) { // Windows and structures
    if (in.nodeIndex >= 33.5 && in.nodeIndex <= 37.5) { // Windows
       baseColor = vec3f(0.02, 0.03, 0.08); // Deep blue-black glass
       metalness = 0.95;
       roughness = 0.05;
    }
  } else if (in.nodeIndex >= 16.5 && in.nodeIndex <= 18.5) { // Propeller Blades
    baseColor = vec3f(0.05, 0.05, 0.05);
    metalness = 0.1;
    roughness = 0.9;
    // Add a yellow tip to the blades for "elegance"
    let dist = length(in.localPos.yz - vec2f(4.34, -5.75));
    if (dist > 2.2) {
      baseColor = vec3f(0.8, 0.7, 0.1);
    }
  } else if (in.nodeIndex == 19.0) { // Spinner
    baseColor = vec3f(0.8, 0.8, 0.85); // Chrome/Silver
    metalness = 1.0;
    roughness = 0.1;
  } else if (in.nodeIndex == 9.0 || in.nodeIndex == 12.0 || in.nodeIndex == 15.0) { // Tires
    baseColor = vec3f(0.04, 0.04, 0.04);
    metalness = 0.0;
    roughness = 0.8;
  } else if (in.nodeIndex == 24.0) { // Tail Light
    baseColor = vec3f(1.0, 0.1, 0.1);
    emission = 2.0;
  }

  // Lighting
  let diffuse = max(dot(normal, sun), 0.0);
  let reflectDir = reflect(-sun, normal);
  let spec = pow(max(dot(reflectDir, viewDir), 0.0), mix(20.0, 120.0, 1.0 - roughness));
  let fresnel = pow(1.0 - max(dot(viewDir, normal), 0.0), 5.0);
  
  // Ambient occlusion simulation (darken lower parts and crevices)
  let ao = smoothstep(-2.0, 2.0, in.localPos.y); 
  
  let ambient = vec3f(0.05, 0.07, 0.1) * (0.5 + 0.5 * ao);
  let litDiffuse = baseColor * (diffuse * 0.8 + 0.2) + ambient;
  let litSpec = vec3f(1.0, 0.95, 0.9) * spec * metalness;
  let litRim = vec3f(1.0) * fresnel * 0.3 * (1.0 - roughness);
  
  var finalColor = litDiffuse + litSpec + litRim + baseColor * emission;

  // Add a subtle stripe on the fuselage for "elegance"
  if (in.nodeIndex >= 32.5 && in.nodeIndex <= 33.5) {
     let stripe = smoothstep(0.02, 0.03, abs(in.localPos.y - 0.5));
     finalColor = mix(finalColor * 0.3, finalColor, stripe);
  }

  return vec4f(finalColor, 1.0);
}

