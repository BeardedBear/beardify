import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: { fs: { allow: ["./"] }, port: 3000 },
  css: { devSourcemap: true },
});
