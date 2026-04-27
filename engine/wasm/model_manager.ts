import {
  Mat4,
  Quat,
  mat4,
  mat4FromRotationTranslation,
  mat4Identity,
  mat4Multiply,
  quat,
  quatNormalize,
  vec3,
  vec3TransformMat4,
} from "./math";
import { MeshData, loadGltfModel } from "./gltf_loader";

type GltfNode = {
  name?: string;
  mesh?: number;
  children?: number[];
  translation?: [number, number, number];
  rotation?: [number, number, number, number];
  scale?: [number, number, number];
  matrix?: number[];
};

type GltfPrimitive = {
  attributes: {
    POSITION?: number;
    NORMAL?: number;
  };
  indices?: number;
};

type GltfMesh = {
  primitives: GltfPrimitive[];
};

type GltfAccessor = {
  bufferView: number;
  byteOffset?: number;
  componentType: number;
  count: number;
  type: string;
};

type GltfBufferView = {
  buffer: number;
  byteOffset?: number;
};

type GltfBuffer = {
  uri: string;
};

type GltfScene = {
  nodes: number[];
};

export interface SemanticTransformState {
  pos: [number, number, number];
  rot: [number, number, number];
  scale: [number, number, number];
}

export interface SemanticBounds {
  center: [number, number, number];
  extents: [number, number, number];
  size: [number, number, number];
}

export interface SemanticMapEntry {
  id: number;
  name: string;
  gltfIndex: number;
  parentId: number | null;
  childIds: number[];
  meshIndex: number | null;
  currentTransform: SemanticTransformState;
  worldTransform: SemanticTransformState;
  localBounds: SemanticBounds | null;
  worldBounds: SemanticBounds | null;
  role: string;
  canAnimate: boolean;
}

export interface SemanticEditManifest {
  fileReference: string;
  semanticMap: SemanticMapEntry[];
}

export interface AiNodeContext {
  id: number;
  name: string;
  gltfIndex: number;
  parentId: number | null;
  childIds: number[];
  meshIndex: number | null;
  role: string;
  canAnimate: boolean;
  currentTransform: SemanticTransformState;
  worldTransform: SemanticTransformState;
  bounds: SemanticBounds | null;
  aiHints: string[];
}

export interface GltfAiContext {
  schemaVersion: "gltf-ai-context/v1";
  fileReference: string;
  summary: {
    totalNodes: number;
    namedNodes: number;
    meshNodes: number;
    animatableNodes: number;
    roleCounts: Record<string, number>;
  };
  editingProtocol: {
    preferredTargetKey: "gltfIndex";
    transformFormat: "translation+rotationEulerDeg+scale";
    instructions: string[];
  };
  semanticMap: AiNodeContext[];
}

export interface SemanticTransformEdit {
  gltfIndex: number;
  translation?: [number, number, number];
  rotationEulerDeg?: [number, number, number];
  rotationQuat?: [number, number, number, number];
  scale?: [number, number, number];
}

type ParsedGltf = {
  buffers: ArrayBuffer[];
  accessors: GltfAccessor[];
  bufferViews: GltfBufferView[];
};

type AxisBounds = {
  min: [number, number, number];
  max: [number, number, number];
};

export class ModelManager {
  readonly sourcePath: string;
  readonly gltf: any;
  readonly manifest: SemanticEditManifest;

  private constructor(sourcePath: string, gltf: any, manifest: SemanticEditManifest) {
    this.sourcePath = sourcePath;
    this.gltf = gltf;
    this.manifest = manifest;
  }

  static async create(sourcePath: string, gltf: any): Promise<ModelManager> {
    const manifest = await buildSemanticEditManifest(sourcePath, gltf);
    return new ModelManager(sourcePath, gltf, manifest);
  }

  async buildMesh(): Promise<MeshData> {
    return loadGltfModel(this.gltf);
  }

  getEntryByIndex(gltfIndex: number): SemanticMapEntry | undefined {
    return this.manifest.semanticMap.find((entry) => entry.gltfIndex === gltfIndex);
  }

  getEntryByName(name: string): SemanticMapEntry | undefined {
    const lowered = name.trim().toLowerCase();
    return this.manifest.semanticMap.find((entry) => entry.name.toLowerCase() === lowered);
  }

  exportAiContext(): GltfAiContext {
    return buildGltfAiContext(this.manifest);
  }

  async applyTransformEdit(edit: SemanticTransformEdit): Promise<SemanticMapEntry | undefined> {
    const node = this.gltf.nodes?.[edit.gltfIndex] as GltfNode | undefined;
    if (!node) {
      throw new Error(`GLTF node ${edit.gltfIndex} nao encontrado.`);
    }

    if (edit.translation) {
      node.translation = [...edit.translation];
      delete node.matrix;
    }
    if (edit.scale) {
      node.scale = [...edit.scale];
      delete node.matrix;
    }
    if (edit.rotationQuat) {
      node.rotation = normalizeQuatTuple(edit.rotationQuat);
      delete node.matrix;
    } else if (edit.rotationEulerDeg) {
      node.rotation = quatFromEulerDegrees(edit.rotationEulerDeg);
      delete node.matrix;
    }

    const refreshed = await buildSemanticEditManifest(this.sourcePath, this.gltf);
    (this as { manifest: SemanticEditManifest }).manifest = refreshed;
    return this.getEntryByIndex(edit.gltfIndex);
  }
}

export async function buildSemanticEditManifest(sourcePath: string, gltf: any): Promise<SemanticEditManifest> {
  const parsed = await parseGltfBuffers(gltf);
  const entries = buildSemanticEntries(gltf, parsed);
  return {
    fileReference: sourcePath,
    semanticMap: entries,
  };
}

export function buildGltfAiContext(manifest: SemanticEditManifest): GltfAiContext {
  const roleCounts: Record<string, number> = {};
  let namedNodes = 0;
  let meshNodes = 0;
  let animatableNodes = 0;

  for (const entry of manifest.semanticMap) {
    roleCounts[entry.role] = (roleCounts[entry.role] ?? 0) + 1;
    if (!entry.name.startsWith("Node_")) {
      namedNodes += 1;
    }
    if (entry.meshIndex !== null) {
      meshNodes += 1;
    }
    if (entry.canAnimate) {
      animatableNodes += 1;
    }
  }

  return {
    schemaVersion: "gltf-ai-context/v1",
    fileReference: manifest.fileReference,
    summary: {
      totalNodes: manifest.semanticMap.length,
      namedNodes,
      meshNodes,
      animatableNodes,
      roleCounts,
    },
    editingProtocol: {
      preferredTargetKey: "gltfIndex",
      transformFormat: "translation+rotationEulerDeg+scale",
      instructions: [
        "Use semanticMap entries instead of editing raw GLTF JSON directly.",
        "When proposing a transform edit, target a node by gltfIndex and include only the changed fields.",
        "Prefer rotationEulerDeg in degrees for human-readable edits unless quaternion precision is explicitly needed.",
        "Treat bounds and role as semantic hints, not exact physical constraints.",
      ],
    },
    semanticMap: manifest.semanticMap.map((entry) => ({
      id: entry.id,
      name: entry.name,
      gltfIndex: entry.gltfIndex,
      parentId: entry.parentId,
      childIds: entry.childIds,
      meshIndex: entry.meshIndex,
      role: entry.role,
      canAnimate: entry.canAnimate,
      currentTransform: entry.currentTransform,
      worldTransform: entry.worldTransform,
      bounds: entry.worldBounds,
      aiHints: buildAiHints(entry),
    })),
  };
}

function buildSemanticEntries(gltf: any, parsed: ParsedGltf): SemanticMapEntry[] {
  const nodes = (gltf.nodes ?? []) as GltfNode[];
  const scenes = (gltf.scenes ?? []) as GltfScene[];
  const scene = scenes[gltf.scene ?? 0];
  if (!scene) {
    return [];
  }

  const childToParent = new Map<number, number>();
  nodes.forEach((node, index) => {
    for (const child of node.children ?? []) {
      childToParent.set(child, index);
    }
  });

  const entries: SemanticMapEntry[] = [];
  const worldMatrices = new Map<number, Mat4>();

  const visit = (nodeIndex: number, parentMatrix: Mat4): void => {
    const node = nodes[nodeIndex];
    if (!node) {
      return;
    }

    const localMatrix = getNodeLocalMatrix(node);
    const worldMatrix = mat4();
    mat4Multiply(worldMatrix, parentMatrix, localMatrix);
    worldMatrices.set(nodeIndex, worldMatrix);

    const localBounds = node.mesh !== undefined ? getMeshBounds(gltf.meshes?.[node.mesh] as GltfMesh | undefined, parsed) : null;
    const worldBounds = localBounds ? transformBounds(localBounds, worldMatrix) : null;
    const localTransform = decomposeReadableTransform(node);
    const worldTransform = matrixToTransform(worldMatrix);
    const role = inferRole(node, worldBounds, worldTransform, nodeIndex);

    entries.push({
      id: entries.length,
      name: node.name?.trim() || `Node_${nodeIndex}`,
      gltfIndex: nodeIndex,
      parentId: childToParent.has(nodeIndex) ? childToParent.get(nodeIndex)! : null,
      childIds: [...(node.children ?? [])],
      meshIndex: node.mesh ?? null,
      currentTransform: localTransform,
      worldTransform,
      localBounds,
      worldBounds,
      role,
      canAnimate: inferAnimatable(node, role),
    });

    for (const child of node.children ?? []) {
      visit(child, worldMatrix);
    }
  };

  const identity = mat4Identity(mat4());
  for (const rootNode of scene.nodes) {
    visit(rootNode, identity);
  }

  return entries;
}

async function parseGltfBuffers(gltf: any): Promise<ParsedGltf> {
  const buffers: ArrayBuffer[] = [];
  for (const bufferInfo of (gltf.buffers ?? []) as GltfBuffer[]) {
    if (!bufferInfo.uri.startsWith("data:")) {
      throw new Error("Somente GLTF com buffers embutidos em data URI sao suportados.");
    }
    const base64 = bufferInfo.uri.split(",")[1].replace(/\s/g, "");
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }
    buffers.push(bytes.buffer);
  }

  return {
    buffers,
    accessors: (gltf.accessors ?? []) as GltfAccessor[],
    bufferViews: (gltf.bufferViews ?? []) as GltfBufferView[],
  };
}

function getNodeLocalMatrix(node: GltfNode): Mat4 {
  const localMatrix = mat4();
  if (node.matrix) {
    localMatrix.set(node.matrix);
    return localMatrix;
  }

  const t = node.translation ?? [0, 0, 0];
  const r = node.rotation ?? [0, 0, 0, 1];
  const s = node.scale ?? [1, 1, 1];
  mat4FromRotationTranslation(localMatrix, quat(r[0], r[1], r[2], r[3]), vec3(t[0], t[1], t[2]));
  localMatrix[0] *= s[0]; localMatrix[1] *= s[0]; localMatrix[2] *= s[0];
  localMatrix[4] *= s[1]; localMatrix[5] *= s[1]; localMatrix[6] *= s[1];
  localMatrix[8] *= s[2]; localMatrix[9] *= s[2]; localMatrix[10] *= s[2];
  return localMatrix;
}

function decomposeReadableTransform(node: GltfNode): SemanticTransformState {
  if (node.matrix) {
    return matrixToTransform(Float32Array.from(node.matrix));
  }

  const translation = node.translation ?? [0, 0, 0];
  const rotation = node.rotation ?? [0, 0, 0, 1];
  const scale = node.scale ?? [1, 1, 1];
  return {
    pos: tuple3(translation[0], translation[1], translation[2]),
    rot: quatToEulerDegrees(rotation),
    scale: tuple3(scale[0], scale[1], scale[2]),
  };
}

function matrixToTransform(matrix: Float32Array): SemanticTransformState {
  const sx = Math.hypot(matrix[0], matrix[1], matrix[2]) || 1;
  const sy = Math.hypot(matrix[4], matrix[5], matrix[6]) || 1;
  const sz = Math.hypot(matrix[8], matrix[9], matrix[10]) || 1;

  const rotationMatrix = new Float32Array(16);
  rotationMatrix.set(matrix);
  rotationMatrix[0] /= sx; rotationMatrix[1] /= sx; rotationMatrix[2] /= sx;
  rotationMatrix[4] /= sy; rotationMatrix[5] /= sy; rotationMatrix[6] /= sy;
  rotationMatrix[8] /= sz; rotationMatrix[9] /= sz; rotationMatrix[10] /= sz;

  const rotationQuat = quatFromRotationMatrix(rotationMatrix);

  return {
    pos: tuple3(matrix[12], matrix[13], matrix[14]),
    rot: quatToEulerDegrees(rotationQuat),
    scale: tuple3(sx, sy, sz),
  };
}

function getMeshBounds(mesh: GltfMesh | undefined, parsed: ParsedGltf): SemanticBounds | null {
  if (!mesh) {
    return null;
  }

  let bounds: AxisBounds | null = null;
  for (const primitive of mesh.primitives ?? []) {
    const positionAccessorIndex = primitive.attributes.POSITION;
    if (positionAccessorIndex === undefined) {
      continue;
    }
    const positions = getAccessorData(positionAccessorIndex, parsed);
    if (!(positions instanceof Float32Array)) {
      continue;
    }
    bounds = mergeBounds(bounds, computeBoundsFromPositions(positions));
  }

  return bounds ? toSemanticBounds(bounds) : null;
}

function getAccessorData(accessorIndex: number, parsed: ParsedGltf): Float32Array | Uint16Array | Uint32Array | null {
  const accessor = parsed.accessors[accessorIndex];
  if (!accessor) {
    return null;
  }
  const bufferView = parsed.bufferViews[accessor.bufferView];
  const buffer = parsed.buffers[bufferView.buffer];
  const offset = (bufferView.byteOffset ?? 0) + (accessor.byteOffset ?? 0);
  const componentCount = accessor.type === "VEC3" ? 3 : accessor.type === "VEC2" ? 2 : accessor.type === "VEC4" ? 4 : 1;

  if (accessor.componentType === 5126) {
    return new Float32Array(buffer, offset, accessor.count * componentCount);
  }
  if (accessor.componentType === 5123) {
    return new Uint16Array(buffer, offset, accessor.count * componentCount);
  }
  if (accessor.componentType === 5125) {
    return new Uint32Array(buffer, offset, accessor.count * componentCount);
  }
  return null;
}

function computeBoundsFromPositions(positions: Float32Array): AxisBounds {
  const bounds: AxisBounds = {
    min: [Infinity, Infinity, Infinity],
    max: [-Infinity, -Infinity, -Infinity],
  };
  for (let index = 0; index < positions.length; index += 3) {
    const x = positions[index + 0];
    const y = positions[index + 1];
    const z = positions[index + 2];
    bounds.min[0] = Math.min(bounds.min[0], x);
    bounds.min[1] = Math.min(bounds.min[1], y);
    bounds.min[2] = Math.min(bounds.min[2], z);
    bounds.max[0] = Math.max(bounds.max[0], x);
    bounds.max[1] = Math.max(bounds.max[1], y);
    bounds.max[2] = Math.max(bounds.max[2], z);
  }
  return bounds;
}

function transformBounds(bounds: SemanticBounds, worldMatrix: Mat4): SemanticBounds {
  const corners = buildBoundsCorners(bounds);
  let transformed: AxisBounds | null = null;
  for (const corner of corners) {
    const out = vec3();
    vec3TransformMat4(out, vec3(corner[0], corner[1], corner[2]), worldMatrix);
    transformed = mergeBounds(transformed, {
      min: [out[0], out[1], out[2]],
      max: [out[0], out[1], out[2]],
    });
  }
  return toSemanticBounds(transformed!);
}

function buildBoundsCorners(bounds: SemanticBounds): [number, number, number][] {
  const [cx, cy, cz] = bounds.center;
  const [ex, ey, ez] = bounds.extents;
  return [
    [cx - ex, cy - ey, cz - ez],
    [cx - ex, cy - ey, cz + ez],
    [cx - ex, cy + ey, cz - ez],
    [cx - ex, cy + ey, cz + ez],
    [cx + ex, cy - ey, cz - ez],
    [cx + ex, cy - ey, cz + ez],
    [cx + ex, cy + ey, cz - ez],
    [cx + ex, cy + ey, cz + ez],
  ];
}

function mergeBounds(a: AxisBounds | null, b: AxisBounds): AxisBounds {
  if (!a) {
    return {
      min: [...b.min],
      max: [...b.max],
    };
  }
  return {
    min: [
      Math.min(a.min[0], b.min[0]),
      Math.min(a.min[1], b.min[1]),
      Math.min(a.min[2], b.min[2]),
    ],
    max: [
      Math.max(a.max[0], b.max[0]),
      Math.max(a.max[1], b.max[1]),
      Math.max(a.max[2], b.max[2]),
    ],
  };
}

function toSemanticBounds(bounds: AxisBounds): SemanticBounds {
  const sizeX = bounds.max[0] - bounds.min[0];
  const sizeY = bounds.max[1] - bounds.min[1];
  const sizeZ = bounds.max[2] - bounds.min[2];
  return {
    center: tuple3(
      bounds.min[0] + sizeX * 0.5,
      bounds.min[1] + sizeY * 0.5,
      bounds.min[2] + sizeZ * 0.5,
    ),
    extents: tuple3(sizeX * 0.5, sizeY * 0.5, sizeZ * 0.5),
    size: tuple3(sizeX, sizeY, sizeZ),
  };
}

function inferRole(
  node: GltfNode,
  worldBounds: SemanticBounds | null,
  worldTransform: SemanticTransformState,
  nodeIndex: number,
): string {
  const name = (node.name ?? "").toLowerCase();
  if (name.includes("fuselage") || name.includes("body") || name.includes("cabin")) return "main_structure";
  if (name.includes("propeller") || name.includes("engine") || name.includes("motor")) return "engine_part";
  if (name.includes("wing") || name.includes("aileron")) return "wing_surface";
  if (name.includes("rudder") || name.includes("tail") || name.includes("elevator")) return "tail_surface";
  if (name.includes("wheel") || name.includes("gear")) return "landing_gear";

  if (worldBounds) {
    const [sx, sy, sz] = worldBounds.size;
    const absX = Math.abs(worldTransform.pos[0]);
    const absY = Math.abs(worldTransform.pos[1]);
    const largest = Math.max(sx, sy, sz);
    const smallest = Math.min(sx, sy, sz);
    const flatness = largest / Math.max(smallest, 0.001);

    if (flatness > 5 && absX > largest * 0.25) return "wing_surface";
    if (flatness > 4 && absY > largest * 0.15) return "tail_surface";
    if (sx > sy * 2 && sx > sz * 1.5 && absX < sx * 0.2) return "main_structure";
  }

  return node.mesh !== undefined ? "structural_part" : `scene_node_${nodeIndex}`;
}

function inferAnimatable(node: GltfNode, role: string): boolean {
  if ((node.children?.length ?? 0) > 0 && node.mesh === undefined) {
    return true;
  }
  return role === "engine_part" || role === "wing_surface" || role === "tail_surface" || role === "landing_gear";
}

function normalizeQuatTuple(value: [number, number, number, number]): [number, number, number, number] {
  const normalized = quatNormalize(quat(), quat(value[0], value[1], value[2], value[3]));
  return [normalized[0], normalized[1], normalized[2], normalized[3]];
}

function quatFromEulerDegrees(eulerDeg: [number, number, number]): [number, number, number, number] {
  const halfX = (eulerDeg[0] * Math.PI / 180) * 0.5;
  const halfY = (eulerDeg[1] * Math.PI / 180) * 0.5;
  const halfZ = (eulerDeg[2] * Math.PI / 180) * 0.5;

  const sx = Math.sin(halfX), cx = Math.cos(halfX);
  const sy = Math.sin(halfY), cy = Math.cos(halfY);
  const sz = Math.sin(halfZ), cz = Math.cos(halfZ);

  const qx = sx * cy * cz - cx * sy * sz;
  const qy = cx * sy * cz + sx * cy * sz;
  const qz = cx * cy * sz - sx * sy * cz;
  const qw = cx * cy * cz + sx * sy * sz;
  return normalizeQuatTuple([qx, qy, qz, qw]);
}

function quatToEulerDegrees(source: ArrayLike<number>): [number, number, number] {
  const x = source[0];
  const y = source[1];
  const z = source[2];
  const w = source[3];

  const sinrCosp = 2 * (w * x + y * z);
  const cosrCosp = 1 - 2 * (x * x + y * y);
  const roll = Math.atan2(sinrCosp, cosrCosp);

  const sinp = 2 * (w * y - z * x);
  const pitch = Math.abs(sinp) >= 1 ? Math.sign(sinp) * (Math.PI * 0.5) : Math.asin(sinp);

  const sinyCosp = 2 * (w * z + x * y);
  const cosyCosp = 1 - 2 * (y * y + z * z);
  const yaw = Math.atan2(sinyCosp, cosyCosp);

  return tuple3(toDegrees(roll), toDegrees(pitch), toDegrees(yaw));
}

function quatFromRotationMatrix(matrix: Float32Array): Quat {
  const out = quat();
  const m00 = matrix[0], m01 = matrix[4], m02 = matrix[8];
  const m10 = matrix[1], m11 = matrix[5], m12 = matrix[9];
  const m20 = matrix[2], m21 = matrix[6], m22 = matrix[10];
  const trace = m00 + m11 + m22;

  if (trace > 0) {
    const s = Math.sqrt(trace + 1.0) * 2;
    out[3] = 0.25 * s;
    out[0] = (m21 - m12) / s;
    out[1] = (m02 - m20) / s;
    out[2] = (m10 - m01) / s;
  } else if (m00 > m11 && m00 > m22) {
    const s = Math.sqrt(1.0 + m00 - m11 - m22) * 2;
    out[3] = (m21 - m12) / s;
    out[0] = 0.25 * s;
    out[1] = (m01 + m10) / s;
    out[2] = (m02 + m20) / s;
  } else if (m11 > m22) {
    const s = Math.sqrt(1.0 + m11 - m00 - m22) * 2;
    out[3] = (m02 - m20) / s;
    out[0] = (m01 + m10) / s;
    out[1] = 0.25 * s;
    out[2] = (m12 + m21) / s;
  } else {
    const s = Math.sqrt(1.0 + m22 - m00 - m11) * 2;
    out[3] = (m10 - m01) / s;
    out[0] = (m02 + m20) / s;
    out[1] = (m12 + m21) / s;
    out[2] = 0.25 * s;
  }

  return quatNormalize(out, out);
}

function toDegrees(value: number): number {
  return Math.round((value * 180 / Math.PI) * 1000) / 1000;
}

function tuple3(x: number, y: number, z: number): [number, number, number] {
  return [round3(x), round3(y), round3(z)];
}

function round3(value: number): number {
  return Math.round(value * 1000) / 1000;
}

function buildAiHints(entry: SemanticMapEntry): string[] {
  const hints: string[] = [];
  if (entry.canAnimate) {
    hints.push("Likely safe candidate for targeted transform edits or animation.");
  }
  if (entry.parentId !== null) {
    hints.push(`Child of semantic node ${entry.parentId}; parent-space alignment may matter.`);
  }
  if (entry.role === "main_structure") {
    hints.push("Primary structural mass; edits here will affect overall aircraft alignment.");
  }
  if (entry.role === "wing_surface") {
    hints.push("Likely aerodynamic surface; preserve bilateral symmetry if mirrored counterpart exists.");
  }
  if (entry.role === "engine_part") {
    hints.push("Likely rotating or engine-adjacent part; prefer local rotation over translation.");
  }
  if (entry.worldBounds) {
    const [sx, sy, sz] = entry.worldBounds.size;
    hints.push(`Approximate world size: ${sx} x ${sy} x ${sz}.`);
  }
  if (hints.length === 0) {
    hints.push("Structural scene node with no special heuristic classification yet.");
  }
  return hints;
}
