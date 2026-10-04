import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceOnboard = path.join(root, "src", "scripts", "onboard.ts");
const bundledOnboard = path.join(root, "dist", "onboard.js");

function runBundledOnboard() {
  const result = spawnSync(process.execPath, [bundledOnboard], {
    cwd: root,
    stdio: "inherit",
  });

  process.exit(result.status ?? (result.signal ? 1 : 0));
}

if (existsSync(sourceOnboard)) {
  try {
    const { createJiti } = await import("jiti");
    const jiti = createJiti(import.meta.url);
    await jiti.import(sourceOnboard);
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

if (existsSync(bundledOnboard)) {
  runBundledOnboard();
}

console.error(
  "Onboard script not found. Install dependencies and run npm run build if needed.",
);
process.exit(1);
