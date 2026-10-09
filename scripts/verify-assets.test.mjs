import { createHash } from "node:crypto";
import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { verifyAssets } from "./verify-assets.mjs";

describe("verifyAssets", () => {
  it("accepts intact files and rejects changed bytes", async () => {
    const root = await mkdtemp(join(tmpdir(), "ram-assets-"));
    await mkdir(join(root, "assets"));
    await writeFile(join(root, "assets", "sample.txt"), "temple");
    const sha256 = createHash("sha256").update("temple").digest("hex");
    const manifest = { version: 1, files: [{ path: "assets/sample.txt", bytes: 6, sha256 }] };

    await expect(verifyAssets(root, manifest)).resolves.toEqual({ checked: 1, bytes: 6 });
    await writeFile(join(root, "assets", "sample.txt"), "changed");
    await expect(verifyAssets(root, manifest)).rejects.toThrow("assets/sample.txt");
  });
});
