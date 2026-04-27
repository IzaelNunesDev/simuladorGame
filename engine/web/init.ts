import { createMiniEngine } from "../wasm/main";
import { ModelManager } from "../wasm/model_manager";
import { NetworkClient } from "./network_client";
import {
  DEFAULT_MULTIPLAYER_PORT,
  SNAPSHOT_SEND_INTERVAL_MS,
} from "../shared/multiplayer";

// Importando os shaders diretamente pelo Vite
import terrainComputeRaw from "../shaders/compute/terrain_gen.wgsl?raw";
import cloudsComputeRaw from "../shaders/compute/clouds_sim.wgsl?raw";
import planetRenderRaw from "../shaders/render/planet.wgsl?raw";
import oceanRenderRaw from "../shaders/render/ocean.wgsl?raw";
import atmosphereRenderRaw from "../shaders/render/atmosphere.wgsl?raw";
import cloudsRenderRaw from "../shaders/render/clouds.wgsl?raw";
import airplaneRenderRaw from "../shaders/render/airplane.wgsl?raw";
import projectileRenderRaw from "../shaders/render/projectile.wgsl?raw";

async function loadImageBitmapFromUrl(url: string): Promise<ImageBitmap> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Falha ao carregar textura base: ${response.status} ${response.statusText} (${url})`);
  }
  const blob = await response.blob();
  return await createImageBitmap(blob);
}

function downloadJsonFile(filename: string, data: unknown): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

async function bootstrap(): Promise<void> {
  if (!("gpu" in navigator)) {
    throw new Error("WebGPU nao esta disponivel neste navegador.");
  }

  const canvas = document.querySelector<HTMLCanvasElement>("#viewport");
  if (!canvas) {
    throw new Error("Canvas #viewport nao encontrado.");
  }

  const adapter = await navigator.gpu.requestAdapter();
  if (!adapter) {
    throw new Error("Nenhum adaptador WebGPU disponivel.");
  }

  const device = await adapter.requestDevice();
  const context = canvas.getContext("webgpu");
  if (!context) {
    throw new Error("Nao foi possivel obter o contexto WebGPU.");
  }

  const presentationFormat = navigator.gpu.getPreferredCanvasFormat();
  context.configure({
    device,
    format: presentationFormat,
    alphaMode: "opaque",
  });

  const shaders = {
    terrainCompute: terrainComputeRaw,
    cloudsCompute: cloudsComputeRaw,
    planetRender: planetRenderRaw,
    oceanRender: oceanRenderRaw,
    atmosphereRender: atmosphereRenderRaw,
    cloudsRender: cloudsRenderRaw,
    airplaneRender: airplaneRenderRaw,
    projectileRender: projectileRenderRaw,
  };

  const baseMapBitmap = await loadImageBitmapFromUrl('/base_map.png');

  const gltfResponse = await fetch('/planer/Export.gltf');
  if (!gltfResponse.ok) {
    throw new Error(`Falha ao carregar modelo do aviao: ${gltfResponse.status}`);
  }
  const gltfJson = await gltfResponse.json();
  const modelManager = await ModelManager.create("/planer/Export.gltf", gltfJson);
  const airplaneMesh = await modelManager.buildMesh();
  const aiContext = modelManager.exportAiContext();

  console.info("Manifesto semantico do modelo carregado.", modelManager.manifest);
  console.info("Contexto GLTF para IA carregado.", aiContext);
  Object.assign(window, {
    __airplaneSemanticManager: modelManager,
    __airplaneSemanticManifest: modelManager.manifest,
    __airplaneGltfAiContext: aiContext,
  });

  const exportButton = document.querySelector<HTMLButtonElement>("#export-ai-context");
  exportButton?.addEventListener("click", () => {
    downloadJsonFile("airplane_gltf_ai_context.json", modelManager.exportAiContext());
  });

  const engine = await createMiniEngine({
    canvas,
    context,
    device,
     presentationFormat,
    shaders,
    baseMapBitmap,
    airplaneMesh,
  });

  const onResize = (): void => engine.resize();
  window.addEventListener("resize", onResize);
  window.addEventListener("keydown", (event) => engine.setKeyState(event.code, true));
  window.addEventListener("keyup", (event) => engine.setKeyState(event.code, false));

  const networkStatus = document.querySelector<HTMLElement>("#network-status");
  const networkClient = new NetworkClient({
    url: resolveMultiplayerUrl(),
    onWelcome: (id) => engine.setLocalNetworkId(id),
    onSnapshot: (players) => engine.syncRemotePlayers(players),
    onPlayerLeft: (id) => engine.removeRemotePlayer(id),
    onStatusChange: (status) => {
      if (networkStatus) {
        networkStatus.textContent = status;
      }
    },
  });
  networkClient.connect();

  window.setInterval(() => {
    networkClient.sendPlayerSnapshot(engine.getLocalPlayerSnapshot(), performance.now());
  }, SNAPSHOT_SEND_INTERVAL_MS);

  engine.start();
}

function resolveMultiplayerUrl(): string {
  const params = new URLSearchParams(window.location.search);
  const explicitServer = params.get("server");
  if (explicitServer) {
    return explicitServer;
  }

  const protocol = window.location.protocol === "https:" ? "wss" : "ws";
  return `${protocol}://${window.location.hostname}:${DEFAULT_MULTIPLAYER_PORT}`;
}

bootstrap().catch((error) => {
  console.error(error);
  const errorElement = document.querySelector<HTMLElement>("#error");
  if (errorElement) {
    errorElement.textContent = error instanceof Error ? error.message : String(error);
  }
});
