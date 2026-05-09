import vue from "@vitejs/plugin-vue";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import { viteStaticCopy } from "vite-plugin-static-copy";

// https://vitejs.dev/config/
export default defineConfig({
  css: { devSourcemap: true },
  plugins: [
    vue(),
    viteStaticCopy({
      targets: [
        {
          dest: "flags",
          src: "node_modules/flag-icons/flags/4x3/*.svg",
        },
      ],
    }),
    {
      configureServer(server): void {
        server.middlewares.use("/flags/", (req, res, next) => {
          try {
            const file = resolve("node_modules/flag-icons/flags/4x3", req.url?.slice(1) ?? "");
            const content = readFileSync(file);
            res.setHeader("Content-Type", "image/svg+xml");
            res.end(content);
          } catch {
            next();
          }
        });
      },
      name: "flag-icons-dev",
    },
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    fs: { allow: ["./"] },
    headers: {
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "SAMEORIGIN",
    },
    host: "127.0.0.1",
    port: 3000,
  },
});
