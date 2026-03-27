import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
    proxy: {
      "/api/hf-chat": {
        target: "https://router.huggingface.co",
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api\/hf-chat/, "/v1/chat/completions")
      },
      "/api/hf-image": {
        target: "https://router.huggingface.co",
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api\/hf-image/, "/hf-inference/models/black-forest-labs/FLUX.1-schnell")
      }
    }
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
