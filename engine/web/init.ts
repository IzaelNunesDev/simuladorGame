import { createMiniEngine } from "../wasm/main";

// Importando os shaders diretamente pelo Vite
import terrainComputeRaw from "../shaders/compute/terrain_gen.wgsl?raw";
import cloudsComputeRaw from "../shaders/compute/clouds_sim.wgsl?raw";
import planetRenderRaw from "../shaders/render/planet.wgsl?raw";
import oceanRenderRaw from "../shaders/render/ocean.wgsl?raw";
import atmosphereRenderRaw from "../shaders/render/atmosphere.wgsl?raw";
import cloudsRenderRaw from "../shaders/render/clouds.wgsl?raw";
import airplaneRenderRaw from "../shaders/render/airplane.wgsl?raw";

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
  };

  const engine = await createMiniEngine({
    canvas,
    context,
    device,
    presentationFormat,
    shaders,
  });

  const onResize = (): void => engine.resize();
  window.addEventListener("resize", onResize);
  window.addEventListener("keydown", (event) => engine.setKeyState(event.code, true));
  window.addEventListener("keyup", (event) => engine.setKeyState(event.code, false));

  engine.start();
}

bootstrap().catch((error) => {
  console.error(error);
  const errorElement = document.querySelector<HTMLElement>("#error");
  if (errorElement) {
    errorElement.textContent = error instanceof Error ? error.message : String(error);
  }
});
