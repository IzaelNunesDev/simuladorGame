import {
  Mat4,
  mat4,
  mat4FromRotationTranslation,
  mat4Identity,
  mat4Multiply,
  quat,
  vec3,
  vec3TransformMat4,
  Vec3,
} from "./math";

export interface MeshData {
  positions: Float32Array;
  normals: Float32Array;
  nodeIndices: Float32Array;
  vertexCount: number;
}

export async function loadGltfModel(json: any): Promise<MeshData> {
  const buffers: ArrayBuffer[] = [];
  
  for (const bufferInfo of json.buffers) {
    if (bufferInfo.uri.startsWith("data:")) {
      const base64 = bufferInfo.uri.split(",")[1].replace(/\s/g, '');
      const binary = atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      buffers.push(bytes.buffer);
    } else {
      throw new Error("Somente dados embutidos (data URIs) sao suportados no momento.");
    }
  }

  const bufferViews = json.bufferViews;
  const accessors = json.accessors;

  function getAccessorData(accessorIdx: number): any {
    const accessor = accessors[accessorIdx];
    const bufferView = bufferViews[accessor.bufferView];
    const buffer = buffers[bufferView.buffer];
    const offset = (accessor.byteOffset || 0) + (bufferView.byteOffset || 0);
    
    let typedArray: any;
    if (accessor.componentType === 5126) { // FLOAT
      typedArray = new Float32Array(buffer, offset, accessor.count * (accessor.type === "VEC3" ? 3 : accessor.type === "VEC2" ? 2 : 1));
    } else if (accessor.componentType === 5123) { // UNSIGNED_SHORT
      typedArray = new Uint16Array(buffer, offset, accessor.count);
    } else if (accessor.componentType === 5125) { // UNSIGNED_INT
      typedArray = new Uint32Array(buffer, offset, accessor.count);
    }
    return typedArray;
  }

  const allPositions: number[] = [];
  const allNormals: number[] = [];
  const allNodeIndices: number[] = [];

  function processNode(nodeIdx: number, parentMatrix: Mat4) {
    const node = json.nodes[nodeIdx];
    const localMatrix = mat4();
    
    if (node.matrix) {
      localMatrix.set(node.matrix);
    } else {
      const t = node.translation || [0, 0, 0];
      const r = node.rotation || [0, 0, 0, 1];
      const s = node.scale || [1, 1, 1];
      
      mat4FromRotationTranslation(localMatrix, quat(r[0], r[1], r[2], r[3]), vec3(t[0], t[1], t[2]));
      localMatrix[0] *= s[0]; localMatrix[1] *= s[0]; localMatrix[2] *= s[0];
      localMatrix[4] *= s[1]; localMatrix[5] *= s[1]; localMatrix[6] *= s[1];
      localMatrix[8] *= s[2]; localMatrix[9] *= s[2]; localMatrix[10] *= s[2];
    }

    const worldMatrix = mat4();
    mat4Multiply(worldMatrix, parentMatrix, localMatrix);

    if (node.mesh !== undefined && node.name !== "Baseplate") {
      const mesh = json.meshes[node.mesh];
      for (const primitive of mesh.primitives) {
        const posIdx = primitive.attributes.POSITION;
        const normIdx = primitive.attributes.NORMAL;
        const indexIdx = primitive.indices;

        const positions = getAccessorData(posIdx);
        const normals = getAccessorData(normIdx);
        const indices = indexIdx !== undefined ? getAccessorData(indexIdx) : null;

        if (!positions || !normals) continue;

        const count = indices ? indices.length : positions.length / 3;
        
        for (let i = 0; i < count; i++) {
          const idx = indices ? indices[i] : i;
          
          const px = positions[idx * 3];
          const py = positions[idx * 3 + 1];
          const pz = positions[idx * 3 + 2];
          
          const nx = normals[idx * 3];
          const ny = normals[idx * 3 + 1];
          const nz = normals[idx * 3 + 2];
          
          const wp = vec3();
          const p = vec3(px, py, pz);
          vec3TransformMat4(wp, p, worldMatrix);
          
          const wn = vec3();
          wn[0] = worldMatrix[0] * nx + worldMatrix[4] * ny + worldMatrix[8] * nz;
          wn[1] = worldMatrix[1] * nx + worldMatrix[5] * ny + worldMatrix[9] * nz;
          wn[2] = worldMatrix[2] * nx + worldMatrix[6] * ny + worldMatrix[10] * nz;
          
          const l = Math.sqrt(wn[0]*wn[0] + wn[1]*wn[1] + wn[2]*wn[2]);
          if (l > 0) { wn[0]/=l; wn[1]/=l; wn[2]/=l; }

          allPositions.push(wp[0], wp[1], wp[2]);
          allNormals.push(wn[0], wn[1], wn[2]);
          allNodeIndices.push(nodeIdx);
        }
      }
    }

    if (node.children) {
      for (const childIdx of node.children) {
        processNode(childIdx, worldMatrix);
      }
    }
  }

  const scene = json.scenes[json.scene || 0];
  for (const rootNodeIdx of scene.nodes) {
    processNode(rootNodeIdx, mat4Identity(mat4()));
  }

  // Fallback if no vertices found
  if (allPositions.length === 0) {
    console.warn("Nenhum vertice encontrado no GLTF. Usando fallback.");
    allPositions.push(
      0,0,1, -1,0,-1, 1,0,-1,
      0,0,1, 1,0,-1, 0,1,-1,
      0,0,1, 0,1,-1, -1,0,-1,
      -1,0,-1, 1,0,-1, 0,1,-1
    );
    for(let i=0; i<12; i++) {
      allNormals.push(0,1,0);
      allNodeIndices.push(0);
    }
  }

  console.log(`GLTF carregado: ${allPositions.length/3} vertices.`);

  return {
    positions: new Float32Array(allPositions),
    normals: new Float32Array(allNormals),
    nodeIndices: new Float32Array(allNodeIndices),
    vertexCount: allPositions.length / 3,
  };
}
