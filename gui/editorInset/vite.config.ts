import react from "@vitejs/plugin-react-swc";
import tailwindcss from "tailwindcss";
import { defineConfig } from "vite";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      'onnxruntime-web': path.resolve(__dirname, '../core/node_modules/onnxruntime-web/dist/ort-web.min.js')
    }
  },
  optimizeDeps: {
    include: ['onnxruntime-web']
  },
  server: {
    // CORS configuration for VS Code webviews
    cors: {
      origin: ['vscode-webview://*'],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      credentials: true
    },
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    },
    hmr: {
      protocol: 'ws',
      host: 'localhost'
    }
  },
  build: {
    // Change the output .js filename to not include a hash
    rollupOptions: {
      // external: ["vscode-webview"],
      output: {
        entryFileNames: `assets/[name].js`,
        chunkFileNames: `assets/[name].js`,
        assetFileNames: `assets/[name].[ext]`,
      },
    },
  },
});