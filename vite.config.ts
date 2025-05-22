import vue from "@vitejs/plugin-vue";
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendors: ["date-fns", "crypto-js", "ky"],
          vue: ["vue", "vue-router", "pinia"],
        },
      },
    },
    sourcemap: true,
  },
  css: { devSourcemap: true },
  plugins: [vue()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: { fs: { allow: ["./"] }, port: 3000 },
});
