import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceInit = path.join(root, "src", "scripts", "init.ts");
const bundledInit = path.join(root, "dist", "init.js");

function runBundledInit() {
  const result = spawnSync(process.execPath, [bundledInit], {
    cwd: root,
    stdio: "inherit",
  });

  process.exit(result.status ?? (result.signal ? 1 : 0));
}

if (existsSync(sourceInit)) {
  try {
    const { createJiti } = await import("jiti");
    const jiti = createJiti(import.meta.url);
    await jiti.import(sourceInit);
    process.exit(0);
  } catch (error) {
    if (!(
      error instanceof Error &&
      "code" in error &&
      error.code === "ERR_MODULE_NOT_FOUND"
    )) {
      throw error;
    }
  }
}

if (existsSync(bundledInit)) {
  runBundledInit();
}

console.error(
  "Init script not found. Install dependencies and run npm run build if needed.",
);
process.exit(1);
