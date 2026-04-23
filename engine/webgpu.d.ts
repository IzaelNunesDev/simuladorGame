declare type GPUDevice = any;
declare type GPUTexture = any;
declare type GPUTextureView = any;
declare type GPUBuffer = any;
declare type GPUCanvasContext = any;
declare type GPUAdapter = any;
declare type GPUTextureFormat = string;
declare type GPURenderPipeline = any;
declare type GPUComputePipeline = any;
declare type GPUBindGroup = any;

declare const GPUBufferUsage: any;
declare const GPUTextureUsage: any;

interface Navigator {
  gpu: {
    requestAdapter(): Promise<GPUAdapter | null>;
    getPreferredCanvasFormat(): GPUTextureFormat;
  };
}

interface HTMLCanvasElement {
  getContext(contextId: "webgpu"): GPUCanvasContext | null;
}
