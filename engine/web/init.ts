import { createMiniEngine } from "../wasm/main";

async function loadText(relativePath: string): Promise<string> {
  const url = new URL(relativePath, import.meta.url);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Falha ao carregar shader: ${relativePath}`);
  }
  return response.text();
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
    terrainCompute: await loadText("../shaders/compute/terrain_gen.wgsl"),
    cloudsCompute: await loadText("../shaders/compute/clouds_sim.wgsl"),
    planetRender: await loadText("../shaders/render/planet.wgsl"),
    oceanRender: await loadText("../shaders/render/ocean.wgsl"),
    atmosphereRender: await loadText("../shaders/render/atmosphere.wgsl"),
    cloudsRender: await loadText("../shaders/render/clouds.wgsl"),
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
