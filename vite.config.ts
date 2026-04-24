import { defineConfig } from 'vite';

export default defineConfig({
  root: 'engine/web', // Define onde está o index.html
  publicDir: '../../public', // Informa ao Vite que a pasta public está na raiz do projeto
  server: {
    fs: {
      // Permite que o Vite acesse arquivos fora da pasta 'web' (como wasm e shaders)
      allow: ['..'] 
    }
  },
  build: {
    outDir: '../../dist',
    emptyOutDir: true,
  }
});
