/* eslint-disable no-console */

/**
 * Copy built Windows artifacts into releases/<version>/
 * and generate latest.json for the Tauri updater.
 *
 * Usage (called automatically via build:app):
 *   bun run scripts/package-release.ts
 *   bun run scripts/package-release.ts --debug
 */

import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";

const isDebug = process.argv.includes("--debug");
const profile = isDebug ? "debug" : "release";

const pkg = JSON.parse(readFileSync("package.json", "utf-8"));
const version: string = pkg.version;

const bundleDir = join("src-tauri", "target", profile, "bundle");
const outDir = join("releases", version);

mkdirSync(outDir, { recursive: true });

const artifacts: { dest: string; src: string }[] = [];

// NSIS installer — with bundle.createUpdaterArtifacts enabled, Tauri signs the
// setup .exe directly (sibling .exe.sig), no separate .nsis.zip is produced.
const nsisDir = join(bundleDir, "nsis");
let nsisSetupName: null | string = null;
let nsisSig: null | string = null;

if (existsSync(nsisDir)) {
  const nsisFiles = readdirSync(nsisDir).map((f) => ({
    file: f,
    mtime: statSync(join(nsisDir, f)).mtimeMs,
  }));

  const nsisExes = nsisFiles
    .filter((f) => f.file.endsWith(".exe"))
    .sort((a, b) => b.mtime - a.mtime);

  if (nsisExes.length > 0) {
    nsisSetupName = `beardify_${version}_setup.exe`;
    artifacts.push({
      dest: join(outDir, nsisSetupName),
      src: join(nsisDir, nsisExes[0].file),
    });

    const sigFile = join(nsisDir, `${nsisExes[0].file}.sig`);
    if (existsSync(sigFile)) {
      artifacts.push({
        dest: join(outDir, `${nsisSetupName}.sig`),
        src: sigFile,
      });
      nsisSig = readFileSync(sigFile, "utf-8").trim();
    }
  }
}

// MSI installer — extra artifact for manual installs
const msiDir = join(bundleDir, "msi");
if (existsSync(msiDir)) {
  const msiFiles = readdirSync(msiDir)
    .filter((f) => f.endsWith(".msi"))
    .map((f) => ({ file: f, mtime: statSync(join(msiDir, f)).mtimeMs }))
    .sort((a, b) => b.mtime - a.mtime);

  if (msiFiles.length > 0) {
    artifacts.push({
      dest: join(outDir, `beardify_${version}_x64.msi`),
      src: join(msiDir, msiFiles[0].file),
    });
  }
}

// Portable exe
const portableExe = join("src-tauri", "target", profile, "beardify.exe");
if (existsSync(portableExe)) {
  const suffix = isDebug ? "_debug" : "";
  artifacts.push({
    dest: join(outDir, `beardify_${version}${suffix}.exe`),
    src: portableExe,
  });
}

if (artifacts.length === 0) {
  console.error("No artifacts found. Did the Tauri build succeed?");
  process.exit(1);
}

for (const { dest, src } of artifacts) {
  copyFileSync(src, dest);
  console.log(`  ${src}\n    → ${dest}`);
}

// Generate latest.json for the Tauri updater (NSIS only, skip for debug builds)
if (!isDebug && nsisSetupName && nsisSig) {
  const repo = "BeardedBear/beardify";
  const downloadUrl = `https://github.com/${repo}/releases/download/v${version}/${nsisSetupName}`;

  const manifest = {
    notes: "",
    platforms: {
      "windows-x86_64": {
        signature: nsisSig,
        url: downloadUrl,
      },
    },
    pub_date: new Date().toISOString(),
    version,
  };

  const manifestPath = join(outDir, "latest.json");
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`  Generated ${manifestPath}`);
}

console.log(`\nRelease artifacts saved to: ${outDir}`);
