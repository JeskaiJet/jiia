import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        zh: resolve(__dirname, "zh/index.html")
      },
      output: {
        manualChunks: {
          "vendor-motion": ["gsap"]
        }
      }
    }
  }
});
