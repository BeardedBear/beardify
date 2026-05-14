/**
 * Automate the release process:
 *   1. Bump version in package.json and tauri.conf.json
 *   2. Commit the version bump
 *   3. Tag the commit
 *   4. Push commit + tag → triggers the GitHub Actions release workflow
 *
 * Usage:
 *   bun run scripts/release.ts 0.2.0        # explicit version
 *   bun run scripts/release.ts patch        # 0.1.0 → 0.1.1
 *   bun run scripts/release.ts minor        # 0.1.0 → 0.2.0
 *   bun run scripts/release.ts major        # 0.1.0 → 1.0.0
 */

import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

function bump(version: string, part: "major" | "minor" | "patch"): string {
  const [major, minor, patch] = version.split(".").map(Number);
  if (part === "major") return `${major + 1}.0.0`;
  if (part === "minor") return `${major}.${minor + 1}.0`;
  return `${major}.${minor}.${patch + 1}`;
}

function readJson(path: string): Record<string, unknown> {
  return JSON.parse(readFileSync(path, "utf-8"));
}

function run(cmd: string): string {
  return execSync(cmd, { encoding: "utf-8", stdio: ["pipe", "pipe", "inherit"] }).trim();
}

function writeJson(path: string, data: Record<string, unknown>): void {
  writeFileSync(path, JSON.stringify(data, null, 2) + "\n");
}

const arg = process.argv[2];

if (!arg) {
  console.error("Usage: bun run scripts/release.ts <version|patch|minor|major>");
  process.exit(1);
}

const pkgPath = "package.json";
const tauriConfPath = "src-tauri/tauri.conf.json";

const pkg = readJson(pkgPath);
const currentVersion = pkg.version as string;

let newVersion: string;
if (arg === "patch" || arg === "minor" || arg === "major") {
  newVersion = bump(currentVersion, arg);
} else if (/^\d+\.\d+\.\d+$/.test(arg)) {
  newVersion = arg;
} else {
  console.error(`Invalid version: "${arg}". Use a semver string or patch/minor/major.`);
  process.exit(1);
}

const dirty = run("git status --porcelain");
if (dirty) {
  console.error("Working tree is dirty. Commit or stash changes before releasing.");
  process.exit(1);
}

const existingTag = run(`git tag -l v${newVersion}`);
if (existingTag) {
  console.error(`Tag v${newVersion} already exists.`);
  process.exit(1);
}

// console.log(`\n  ${currentVersion} → ${newVersion}\n`);

pkg.version = newVersion;
writeJson(pkgPath, pkg);

const tauriConf = readJson(tauriConfPath);
tauriConf.version = newVersion;
writeJson(tauriConfPath, tauriConf);

run(`git add ${pkgPath} ${tauriConfPath}`);
run(`git commit -m "chore(release): bump version to ${newVersion}"`);
run(`git tag v${newVersion}`);
run("git push origin HEAD");
run(`git push origin v${newVersion}`);

// console.log(`  v${newVersion} tagged and pushed — GitHub Actions will handle the rest.`);
// console.log(`  https://github.com/BeardedBear/beardify/actions\n`);
