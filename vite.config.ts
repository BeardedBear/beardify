import vue from "@vitejs/plugin-vue";
import { copyFileSync, mkdirSync, readdirSync, readFileSync } from "node:fs";
import { basename, join } from "node:path";
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vitest/config";

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
            // basename() keeps the lookup inside the flat flags dir: resolve() would have
            // let an absolute request path ("/flags//etc/passwd") escape the base entirely.
            const file = join("node_modules/flag-icons/flags/4x3", basename(req.url ?? ""));
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
  /*
   * Vitest reads this config, so tests get the `@/` alias and the Vue plugin for
   * free. happy-dom rather than node: the app is browser-only and some helpers
   * lean on it — `decodeHtmlEntities` parses Spotify's HTML-escaped descriptions
   * through a detached <textarea>, and tier-list parsing goes through it.
   */
  test: {
    environment: "happy-dom",
    include: ["src/**/*.test.ts"],
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
    /*
     * `tauri:dev` starts Vite while cargo is still linking, and on Windows the
     * linker holds an exclusive lock on target\debug\deps\*.dll — fs.watch then
     * dies with EBUSY before the server ever listens. Nothing under src-tauri
     * affects HMR anyway.
     */
    watch: { ignored: ["**/src-tauri/**"] },
    proxy: {
      // Plain `bun run dev` has no function host, and MusicBrainz is the one relay the app
      // can't work without. Node can set the User-Agent the browser refuses to, so dev gets
      // the same treatment as the deployed function.
      "/.netlify/functions/musicbrainz": {
        changeOrigin: true,
        headers: { "User-Agent": "Beardify/1.0.0 (https://github.com/BeardedBear/beardify)" },
        rewrite: (path): string => path.replace("/.netlify/functions/musicbrainz", "/ws/2"),
        target: "https://musicbrainz.org",
      },
      // Regex, not a plain prefix: Vite tries every proxy context and this one would
      // swallow the MusicBrainz path whatever the key order, sending it to a function
      // host that plain `bun run dev` never starts (ECONNREFUSED -> 502).
      "^/[.]netlify/functions/(?!musicbrainz)": {
        changeOrigin: true,
        target: "http://localhost:9999",
      },
    },
  },

});
