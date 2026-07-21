import vue from "@vitejs/plugin-vue";
import { copyFileSync, mkdirSync, readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";

const pkg = JSON.parse(readFileSync("package.json", "utf-8")) as { version: string };

// https://vitejs.dev/config/
export default defineConfig({
  css: { devSourcemap: true },
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  optimizeDeps: {
    include: [
      "@tauri-apps/api/core",
      "@tauri-apps/api/event",
      "@tauri-apps/api/window",
      "@tauri-apps/plugin-deep-link",
      "@tauri-apps/plugin-opener",
      "@tauri-apps/plugin-updater",
    ],
  },
  plugins: [
    vue(),
    {
      apply: "build",
      name: "copy-flag-icons",
      writeBundle(options): void {
        const srcDir = join("node_modules", "flag-icons", "flags", "4x3");
        const destDir = join(options.dir ?? "dist", "flags");
        mkdirSync(destDir, { recursive: true });
        for (const file of readdirSync(srcDir)) {
          if (file.endsWith(".svg")) {
            copyFileSync(join(srcDir, file), join(destDir, file));
          }
        }
      },
    },
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
    proxy: {
      "/.netlify/functions": {
        changeOrigin: true,
        target: "http://localhost:9999",
      },
    },
  },
});
