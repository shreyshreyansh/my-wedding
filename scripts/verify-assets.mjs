import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export async function verifyAssets(root, manifest) {
  let totalBytes = 0;

  for (const file of manifest.files) {
    const bytes = await readFile(resolve(root, file.path));
    const digest = createHash("sha256").update(bytes).digest("hex");
    if (bytes.byteLength !== file.bytes || digest !== file.sha256) {
      throw new Error(`Asset integrity check failed: ${file.path}`);
    }
    totalBytes += bytes.byteLength;
  }

  return { checked: manifest.files.length, bytes: totalBytes };
}

const scriptPath = fileURLToPath(import.meta.url);
if (process.argv[1] && resolve(process.argv[1]) === scriptPath) {
  const projectRoot = resolve(dirname(scriptPath), "..");
  const publicRoot = resolve(projectRoot, "public");
  const manifest = JSON.parse(await readFile(resolve(publicRoot, "assets/manifest.json"), "utf8"));
  const result = await verifyAssets(publicRoot, manifest);
  process.stdout.write(`Verified ${result.checked} source assets (${result.bytes} bytes).\n`);
}
