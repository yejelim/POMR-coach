import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const standaloneDir = path.join(root, ".next", "standalone");

await ensureExists(path.join(standaloneDir, "server.js"));
await copyDir(path.join(root, ".next", "static"), path.join(standaloneDir, ".next", "static"));
await copyDir(path.join(root, "public"), path.join(standaloneDir, "public"));
await removeBundlerOnlyPackages();

async function ensureExists(filePath) {
  try {
    await fs.access(filePath);
  } catch {
    throw new Error(`Missing ${filePath}. Run npm run build first.`);
  }
}

async function copyDir(from, to) {
  await fs.rm(to, { recursive: true, force: true });
  await fs.mkdir(path.dirname(to), { recursive: true });
  await fs.cp(from, to, { recursive: true });
}

async function removeBundlerOnlyPackages() {
  const nodeModules = path.join(standaloneDir, "node_modules");
  await fs.rm(path.join(nodeModules, "electron"), { recursive: true, force: true });
  await fs.rm(path.join(nodeModules, "electron-builder"), { recursive: true, force: true });
  await fs.rm(path.join(nodeModules, "@electron"), { recursive: true, force: true });
}
