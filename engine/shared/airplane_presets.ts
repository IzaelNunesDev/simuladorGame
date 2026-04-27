import { Vec3, vec3 } from "../wasm/math";

export interface AirplanePhysicsConfig {
  minSpeed: number;
  maxSpeed: number;
  acceleration: number;
  turboBoost: number;
  yawRate: number;
  pitchRate: number;
  bankResponse: number;
  rollBankLimit: number;
  shootingCooldownMs: number;
  projectileSpread: number;
  projectileSpeed: number;
}

export interface AirplaneModelConfig {
  id: string;
  name: string;
  gltfPath: string;
  aiContextPath: string;
  physics: AirplanePhysicsConfig;
}

export const AIRPLANE_PRESETS: Record<string, AirplaneModelConfig> = {
  fighter: {
    id: "fighter",
    name: "Fighter Jet",
    gltfPath: "/planer/Export.gltf",
    aiContextPath: "/airplane_gltf_ai_context.json",
    physics: {
      minSpeed: 40,
      maxSpeed: 220,
      acceleration: 45,
      turboBoost: 2.5,
      yawRate: 1.2,
      pitchRate: 1.1,
      bankResponse: 3.5,
      rollBankLimit: 0.85,
      shootingCooldownMs: 100,
      projectileSpread: 8.5,
      projectileSpeed: 500,
    },
  },
  cargo: {
    id: "cargo",
    name: "Cargo Plane",
    gltfPath: "/planer/Cargo.gltf", // Placeholder
    aiContextPath: "/cargo_gltf_ai_context.json", // Placeholder
    physics: {
      minSpeed: 20,
      maxSpeed: 120,
      acceleration: 15,
      turboBoost: 1.5,
      yawRate: 0.5,
      pitchRate: 0.4,
      bankResponse: 1.5,
      rollBankLimit: 0.45,
      shootingCooldownMs: 300,
      projectileSpread: 15.0,
      projectileSpeed: 300,
    },
  },
  stunt: {
    id: "stunt",
    name: "Stunt Plane",
    gltfPath: "/planer/Stunt.gltf", // Placeholder
    aiContextPath: "/stunt_gltf_ai_context.json", // Placeholder
    physics: {
      minSpeed: 10,
      maxSpeed: 140,
      acceleration: 35,
      turboBoost: 1.8,
      yawRate: 1.8,
      pitchRate: 1.5,
      bankResponse: 5.0,
      rollBankLimit: 1.2,
      shootingCooldownMs: 200,
      projectileSpread: 5.0,
      projectileSpeed: 400,
    },
  },
};
